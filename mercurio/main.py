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


def _parse_numeric(value: Any) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        cleaned = value.replace(".", "").replace(",", ".")
        digits = "".join(ch for ch in cleaned if ch.isdigit() or ch in {".", "-"})
        if not digits:
            return 0.0
        try:
            return float(digits)
        except ValueError:
            return 0.0
    return 0.0


def _infer_external_origin(trend: Dict[str, Any]) -> str:
    source = str(trend.get("source", "")).lower()
    link = str(trend.get("link", "")).lower()
    blob = f"{source} {link}"
    if any(token in blob for token in ("rss", "feed", "xml")):
        return "RSS"
    return "API_NEWS"


def _weight_for_origin(origin: str) -> int:
    # Política solicitada:
    # 3 = viral no BIRD (publicações/comentários da rede)
    # 2 = RSS
    # 1 = APIs de notícias/revistas/etc.
    if origin == "BIRD_NETWORK":
        return 3
    if origin == "RSS":
        return 2
    return 1


def _score_trend(trend: Dict[str, Any]) -> float:
    signal = trend.get("bird_signal", {}) if isinstance(trend.get("bird_signal"), dict) else {}
    posts = _parse_numeric(signal.get("posts_count", 0))
    comments = _parse_numeric(signal.get("comments_count", 0))
    volume = _parse_numeric(trend.get("volume", 0))
    weight = _parse_numeric(trend.get("weight", 1))
    # Peso domina o ranking; engajamento e volume desempata dentro da mesma classe.
    return (weight * 10_000) + (posts * 15) + (comments * 7) + volume


def _rank_weighted_trends(trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not trends:
        return []

    dedup: Dict[str, Dict[str, Any]] = {}
    for trend in trends:
        hashtag_key = str(trend.get("hashtag", "")).strip().lower() or str(trend.get("topic", "")).strip().lower()
        if hashtag_key not in dedup:
            dedup[hashtag_key] = trend
            continue

        current = dedup[hashtag_key]
        if _score_trend(trend) > _score_trend(current):
            dedup[hashtag_key] = trend

    ranked = sorted(dedup.values(), key=_score_trend, reverse=True)
    return ranked


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
                "source": "BIRD",
                "origin": "BIRD_NETWORK",
                "weight": _weight_for_origin("BIRD_NETWORK"),
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
        origin = _infer_external_origin(trend)
        normalized.append(
            {
                "id": trend.get("id", f"iris_{idx + 1}"),
                "category": trend.get("category", "Global"),
                "title": topic,
                "topic": topic,
                "summary": trend.get("context", "Sem resumo disponível."),
                "source": trend.get("source", trend.get("confidence", "IRIS")),
                "origin": origin,
                "weight": _weight_for_origin(origin),
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


def _normalize_news_items(news_payload: Any) -> List[Dict[str, Any]]:
    if not isinstance(news_payload, list):
        return []

    normalized: List[Dict[str, Any]] = []
    for item in news_payload:
        if not isinstance(item, dict):
            continue
        source = str(item.get("source", "Mercurio"))
        link = str(item.get("link", ""))
        origin = _infer_external_origin({"source": source, "link": link})
        normalized.append(
            {
                "source": source,
                "title": item.get("title", "Sem título"),
                "link": link,
                "published": item.get("published", "N/A"),
                "origin": origin,
                "weight": _weight_for_origin(origin),
            }
        )

    return sorted(normalized, key=lambda item: item.get("weight", 1), reverse=True)


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

    bird_trends: List[Dict[str, Any]] = []
    external_trends: List[Dict[str, Any]] = []
    news: List[Dict[str, Any]] = []
    sources: List[str] = []

    try:
        tas_res = requests.get(TAS_TRENDS_URL, timeout=REQUEST_TIMEOUT_DEFAULT)
        if tas_res.ok:
            bird_trends = _normalize_tas_trends(tas_res.json())
            if bird_trends:
                sources.append("BIRD_NETWORK")
    except requests.RequestException as exc:
        logger.info("TAS indisponível: %s", exc)

    try:
        iris_res = requests.get(IRIS_SCAN_URL, timeout=REQUEST_TIMEOUT_DEFAULT * 2)
        if iris_res.ok:
            iris_payload = iris_res.json()
            external_trends = _normalize_iris_trends(iris_payload)
            news = _normalize_news_items(iris_payload.get("news", []))
            if external_trends or news:
                sources.append("EXTERNAL_FEEDS")
    except requests.RequestException as exc:
        logger.error("IRIS indisponível: %s", exc)

    final_trends = _rank_weighted_trends([*bird_trends, *external_trends])

    if not final_trends:
        final_trends = [
            {
                "id": "fallback_1",
                "category": "SISTEMA",
                "title": "Aguardando pulso de rede...",
                "topic": "Aguardando pulso de rede...",
                "summary": "Os sensores estão reconectando as fontes externas.",
                "source": "SYSTEM",
                "origin": "SYSTEM",
                "weight": 0,
                "hashtag": "#Sincronizando",
                "volume": "N/A",
                "link": "",
                "bird_signal": _build_bird_signal("sincronizando"),
            }
        ]
        news = [{"source": "SYSTEM", "title": "Sem conexão com provedores", "link": "", "published": "N/A", "origin": "SYSTEM", "weight": 0}]
        sources = ["FALLBACK"]

    events = [{"id": "e1", "category": "PENTAIA", "title": "Protocolo Mercúrio Ativo"}]

    primary_source = sources[0] if sources else "NONE"

    return {
        "trends": final_trends,
        "security": security_data,
        "events": events,
        "news": news,
        "metadata": {
            "source": primary_source,
            "sources": sources,
            "weight_policy": {
                "BIRD_NETWORK": 3,
                "RSS": 2,
                "API_NEWS": 1,
            },
            "evolution_level": 2,
            "node": f"{SERVICE_NAME}_hub_{SERVICE_PORT}",
            "generated_at": datetime.utcnow().isoformat(),
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)
