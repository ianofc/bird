from collections import Counter
from datetime import datetime, timezone
import re
from typing import Dict, Tuple

from sqlalchemy import text

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
    def _to_hashtag(text_value: str) -> str:
        clean = re.sub(r"[^\w\s]", "", text_value or "")
        words = [w for w in clean.split() if w]
        if not words:
            return "#PentaIA"
        selected = words[:2]
        return "#" + "".join(word.capitalize() for word in selected)

    @staticmethod
    def _trend_tokens(topic: str, hashtag: str) -> Tuple[str, str]:
        hashtag_token = (hashtag or "").lstrip("#").replace("_", " ")
        topic_token = (topic or "").replace("_", " ")
        return topic_token.strip(), hashtag_token.strip()

    async def _load_bird_counts(self, topic: str, hashtag: str) -> Dict[str, int]:
        """
        Cruza tendências com tabelas do Django (`core_bird` e `core_comment`) no mesmo PostgreSQL.
        Se as tabelas não existirem/estiverem indisponíveis, retorna zeros sem quebrar o endpoint.
        """
        topic_token, hashtag_token = self._trend_tokens(topic, hashtag)
        if not topic_token and not hashtag_token:
            return {"related_posts_count": 0, "related_news_count": 0}

        like_terms = []
        params: Dict[str, str] = {}
        if topic_token:
            like_terms.append("lower(content) LIKE lower(:topic_pattern)")
            params["topic_pattern"] = f"%{topic_token}%"
        if hashtag_token:
            like_terms.append("lower(content) LIKE lower(:hashtag_pattern)")
            params["hashtag_pattern"] = f"%#{hashtag_token}%"

        where_clause = " OR ".join(like_terms) if like_terms else "1=0"

        posts_sql = text(f"SELECT COUNT(*) FROM core_bird WHERE {where_clause}")
        comments_sql = text(
            f"""
            SELECT COUNT(*)
            FROM core_comment c
            JOIN core_bird b ON b.id = c.bird_id
            WHERE ({where_clause}) OR ({where_clause.replace('content', 'c.content')})
            """
        )

        try:
            async with async_session() as session:
                posts_count = int((await session.execute(posts_sql, params)).scalar() or 0)
                comments_count = int((await session.execute(comments_sql, params)).scalar() or 0)
            return {
                "related_posts_count": posts_count,
                "related_news_count": comments_count,
            }
        except Exception:
            return {"related_posts_count": 0, "related_news_count": 0}

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
            hashtag = self._to_hashtag(topic)
            counters = await self._load_bird_counts(topic, hashtag)
            trends.append(
                {
                    "id": f"trend_{idx + 1}",
                    "topic": topic,
                    "category": "TAS",
                    "hashtag": hashtag,
                    "engagement": int(freq * 10),
                    "related_posts_count": counters["related_posts_count"],
                    "related_news_count": counters["related_news_count"],
                    "link": f"/explore?q={tag}",
                }
            )

        if not trends:
            defaults = ["Mercado Financeiro", "IA Generativa", "Brasil Tecnologia", "Esportes Ao Vivo"]
            for idx, topic in enumerate(defaults[:limit]):
                hashtag = self._to_hashtag(topic)
                counters = await self._load_bird_counts(topic, hashtag)
                trends.append(
                    {
                        "id": f"fallback_{idx + 1}",
                        "topic": topic,
                        "category": "Fallback",
                        "hashtag": hashtag,
                        "engagement": 100 - (idx * 10),
                        "related_posts_count": counters["related_posts_count"],
                        "related_news_count": counters["related_news_count"],
                        "link": f"/explore?q={topic.replace(' ', '+')}",
                    }
                )

        return {
            "trends": trends[:limit],
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": "TAS",
        }


recommendation_service = RecommendationService()
