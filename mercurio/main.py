from datetime import datetime
import hashlib
import logging
from typing import Any, Dict, List

import requests
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from core.config import (
    CORS_ALLOW_ORIGINS,
    HEIMDALL_CHECK_URL,
    IRIS_SCAN_URL,
    REQUEST_TIMEOUT_DEFAULT,
    SERVICE_NAME,
    SERVICE_PORT,
    TAS_TRENDS_URL,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | MERCURIO: %(message)s")
logger = logging.getLogger("MERCURIO_HUB")

app = FastAPI(title="MERCÚRIO - Broadcaster Hub PentaIA", version="1.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS or ["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_bird_signal(seed_text: str) -> Dict[str, Any]:
    seed = int(hashlib.sha256(seed_text.encode("utf-8")).hexdigest(), 16)
    posts = 20 + (seed % 380)
    comments = int(posts * 2.4)
    return {
        "posts_count": posts,
        "comments_count": comments,
        "hotspots": ["/explore", "/feed", "/network"],
        "top_authors": [
            f"@trend_{(seed % 97) + 1}",
            f"@pulse_{(seed % 79) + 1}",
            f"@bird_{(seed % 53) + 1}",
        ],
    }


def _normalize_tas_trends(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    trends = payload.get("trends", []) if isinstance(payload, dict) else []
    normalized: List[Dict[str, Any]] = []
    for idx, trend in enumerate(trends):
        hashtag = trend.get("hashtag") or f"#trend_{idx + 1}"
        topic = trend.get("topic", "Sem descrição")
        normalized.append(
            {
                "id": trend.get("id", f"tas_{idx + 1}"),
                "category": trend.get("category", "Geral"),
                "title": topic,
                "topic": topic,
                "summary": f"Assunto em alta no BIRD com foco em {topic.lower()}.",
                "source": "TAS",
                "hashtag": hashtag,
                "volume": trend.get("engagement", trend.get("volume", "N/A")),
                "link": trend.get("link") or f"https://bird.local/explore?q={hashtag.lstrip('#')}",

                "bird_signal": {
                    **_build_bird_signal(topic),
                    "posts_count": int(trend.get("related_posts_count", 0) or 0),
                    "comments_count": int(trend.get("related_news_count", 0) or 0),
                },

            }
        )
    return normalized


def _normalize_iris_trends(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    trends = payload.get("google_trends", []) if isinstance(payload, dict) else []
    normalized: List[Dict[str, Any]] = []
    for idx, trend in enumerate(trends):
        hashtag = trend.get("hashtag") or trend.get("topic") or f"trend_{idx + 1}"
        if not str(hashtag).startswith("#"):
            hashtag = f"#{hashtag}"
        topic = trend.get("topic", "Sem descrição")
        normalized.append(
            {
                "id": trend.get("id", f"iris_{idx + 1}"),
                "category": trend.get("category", "Global"),
                "title": topic,
                "topic": topic,
                "summary": trend.get("context", "Sem resumo disponível."),
                "source": trend.get("confidence", "IRIS"),
                "hashtag": hashtag,
                "volume": trend.get("momentum", trend.get("volume", "N/A")),
                "link": trend.get("link", ""),

                "bird_signal": {
                    **_build_bird_signal(topic),
                    "posts_count": int(trend.get("related_posts_count", 0) or 0),
                    "comments_count": int(trend.get("related_news_count", 0) or 0),
                },

            }
        )
    return normalized


@app.get("/")
async def health():
    return {
        "status": "online",
        "service": SERVICE_NAME,
        "port": SERVICE_PORT,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/v1/mercurio/bundle")
async def get_integrated_bundle(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    logger.info("Gerando bundle para IP %s", client_ip)

    security_data = {"status": "PROTECTED", "shield_level": "OPTIMAL", "client_ip": client_ip}
    try:
        sec_res = requests.get(HEIMDALL_CHECK_URL, params={"ip": client_ip}, timeout=REQUEST_TIMEOUT_DEFAULT)
        if sec_res.ok:
            security_data = sec_res.json()
    except requests.RequestException as exc:
        logger.warning("Heimdall indisponível, fallback local ativado: %s", exc)

    final_trends: List[Dict[str, Any]] = []
    news: List[Dict[str, Any]] = []
    source = "NONE"

    try:
        tas_res = requests.get(TAS_TRENDS_URL, timeout=REQUEST_TIMEOUT_DEFAULT)
        if tas_res.ok:
            final_trends = _normalize_tas_trends(tas_res.json())
            if final_trends:
                source = "TAS_INTERNAL"
    except requests.RequestException as exc:
        logger.info("TAS indisponível: %s", exc)

    if not final_trends:
        logger.info("Acionando fallback IRIS...")
        try:
            iris_res = requests.get(IRIS_SCAN_URL, timeout=REQUEST_TIMEOUT_DEFAULT * 2)
            if iris_res.ok:
                iris_payload = iris_res.json()
                final_trends = _normalize_iris_trends(iris_payload)
                news = iris_payload.get("news", [])
                source = "IRIS_EXTERNAL"
        except requests.RequestException as exc:
            logger.error("IRIS indisponível: %s", exc)

    if not final_trends:
        final_trends = [
            {
                "id": "fallback_1",
                "category": "SISTEMA",
                "title": "Aguardando pulso de rede...",
                "topic": "Aguardando pulso de rede...",
                "summary": "Os sensores estão reconectando as fontes externas.",
                "source": "SYSTEM",
                "hashtag": "#Sincronizando",
                "volume": "N/A",
                "link": "",
                "bird_signal": _build_bird_signal("sincronizando"),
            }
        ]
        news = [{"source": "SYSTEM", "title": "Sem conexão com provedores", "link": "", "published": "N/A"}]
        source = "FALLBACK"

    events = [{"id": "e1", "category": "PENTAIA", "title": "Protocolo Mercúrio Ativo"}]

    return {
        "trends": final_trends,
        "security": security_data,
        "events": events,
        "news": news,
        "metadata": {
            "source": source,
            "evolution_level": 2,
            "node": f"{SERVICE_NAME}_hub_{SERVICE_PORT}",
            "generated_at": datetime.utcnow().isoformat(),
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)
