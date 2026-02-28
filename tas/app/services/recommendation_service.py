from collections import Counter
from datetime import datetime, timezone
import re

from app.engines.thalamus.filters import ThalamusFilter
from app.engines.sara.vector_search import SaraEngine
from app.engines.accumbens.ranker import AccumbensRanker
from app.db.repositories.content_repository import ContentRepository
from app.db.session import async_session


class RecommendationService:
    def __init__(self):
        self.thalamus = ThalamusFilter()
        self.sara = SaraEngine()
        self.accumbens = AccumbensRanker()

    @staticmethod
    def _to_hashtag(text: str) -> str:
        clean = re.sub(r"[^\w\s]", "", text or "")
        words = [w for w in clean.split() if w]
        if not words:
            return "#PentaIA"
        selected = words[:2]
        return "#" + "".join(word.capitalize() for word in selected)

    async def get_feed(self, request):
        raw_data = []
        try:
            async with async_session() as session:
                repo = ContentRepository(session)
                raw_objects = await repo.get_candidates()
                raw_data = [
                {
                    "id": o.id,
                    "title": o.title,
                    "tags": o.tags,
                    "safety": o.safety_label,
                    "embedding": o.embedding,
                }
                for o in raw_objects
                ]
        except Exception:
            raw_data = []

        if not raw_data:
            raw_data = [{"id": "test_1", "title": "Tendência Global", "tags": ["politics"], "safety": "safe"}]

        clean = await self.thalamus.apply(request, raw_data)
        aligned = await self.sara.align(request.user_id, clean)
        return await self.accumbens.rank(aligned)

    async def get_trends(self, limit: int = 10):
        raw_objects = []
        try:
            async with async_session() as session:
                repo = ContentRepository(session)
                raw_objects = await repo.get_candidates(limit=500)
        except Exception:
            raw_objects = []

        trends = []
        tag_counter = Counter()

        for content in raw_objects:
            tags = content.tags or []
            for tag in tags:
                if tag:
                    tag_counter[str(tag).strip().lower()] += 1

        for idx, (tag, freq) in enumerate(tag_counter.most_common(limit)):
            topic = tag.replace("_", " ").title()
            trends.append(
                {
                    "id": f"trend_{idx + 1}",
                    "topic": topic,
                    "category": "TAS",
                    "hashtag": self._to_hashtag(topic),
                    "engagement": int(freq * 10),
                    "link": f"/explore?q={tag}",
                }
            )

        if not trends:
            defaults = ["Mercado Financeiro", "IA Generativa", "Brasil Tecnologia", "Esportes Ao Vivo"]
            for idx, topic in enumerate(defaults[:limit]):
                trends.append(
                    {
                        "id": f"fallback_{idx + 1}",
                        "topic": topic,
                        "category": "Fallback",
                        "hashtag": self._to_hashtag(topic),
                        "engagement": 100 - (idx * 10),
                        "link": f"/explore?q={topic.replace(' ', '+')}",
                    }
                )

        return {
            "trends": trends[:limit],
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": "TAS",
        }


recommendation_service = RecommendationService()
