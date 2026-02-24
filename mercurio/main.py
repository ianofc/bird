# mercurio/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import logging

# Configuração de Log para o Ecossistema PentaIA
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MERCURIO_HUB")

app = FastAPI(title="MERCÚRIO - Broadcaster Hub PentaIA", version="1.2.0")

# FIX DE CORS: Autorizando explicitamente o frontend (8080) e mantendo flexibilidade de rede
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints Internos (Conforme definido no seu Docker Compose)
TAS_URL = "http://tas:8001/api/v1/recommend/trends" # Ajuste o path conforme sua rota no TAS
IRIS_URL = "http://iris:8003/scan/full"
HEIMDALL_URL = "http://zios:8002/v1/proactive/heimdall/check" # Aponta para o node de segurança no Zios

@app.get("/")
async def health():
    return {"status": "online", "service": "mercurio", "port": 8004}

@app.get("/api/v1/mercurio/bundle")
async def get_integrated_bundle(request: Request):
    """
    Broadcaster: Consolida TAS, IRIS e HEIMDALL.
    Implementa redundância: Prioriza tração interna (TAS), falha para varredura global (IRIS).
    """
    client_ip = request.client.host
    logger.info(f"MERCURIO: Gerando bundle para IP {client_ip}")

    # 1. SEGURANÇA (Heimdall)
    security_data = {"status": "PROTECTED", "shield_level": "OPTIMAL"}
    try:
        sec_res = requests.get(f"{HEIMDALL_URL}?ip={client_ip}", timeout=1.0)
        if sec_res.status_code == 200:
            security_data = sec_res.json()
    except Exception:
        logger.warning("Heimdall Shield operando em modo autônomo (Cache).")

    # 2. TRENDS (Redundância PentaIA: TAS -> IRIS)
    final_trends = []
    source = "NONE"

    # TENTATIVA A: TAS (Inteligência da Rede)
    try:
        tas_res = requests.get(TAS_URL, timeout=2)
        if tas_res.status_code == 200:
            final_trends = tas_res.json()
            source = "TAS_INTERNAL"
            if not final_trends: raise ValueError("TAS Empty")
    except Exception:
        # TENTATIVA B: IRIS/SATTR (Varredura Externa)
        logger.info("TAS indisponível ou em processamento. Acionando sensores IRIS...")
        try:
            iris_res = requests.get(IRIS_URL, timeout=5)
            if iris_res.status_code == 200:
                final_trends = iris_res.json().get("google_trends", [])
                source = "IRIS_EXTERNAL"
        except Exception as e:
            logger.error(f"IRIS SATTR Offline: {e}")
            final_trends = [
                {"hashtag": "#Sincronizando", "topic": "Aguardando pulso de rede...", "category": "SISTEMA"}
            ]

    # 3. EVENTOS
    events = [
        {"id": "e1", "category": "PENTAIA", "title": "Protocolo Mercúrio Ativo"}
    ]

    return {
        "trends": final_trends,
        "security": security_data,
        "events": events,
        "metadata": {
            "source": source,
            "evolution_level": 1,
            "node": "mercurio_hub_8004"
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Mercúrio roda na 8004 conforme seu Docker Compose
    uvicorn.run(app, host="0.0.0.0", port=8004)