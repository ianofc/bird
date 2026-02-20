from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import logging

app = FastAPI(title="MERCÚRIO - PentaIA Hub")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# URLs dos Microsserviços (Docker Network)
IRIS_URL = "http://iris:8003/scan/full"
HEIMDALL_URL = "http://fastapi_service:8000/api/v1/heimdall/check"

@app.get("/api/v1/mercurio/bundle")
async def get_bundle(request: Request):
    client_ip = request.client.host
    bundle = {
        "trends": [],
        "security": {"status": "Safe", "shield": "Active"},
        "events": [
            {"id": "f1", "title": "Futebol: Jogos do Final de Semana", "category": "Esportes"},
            {"id": "e1", "title": "Lançamento Literário: Ian Santos", "category": "Cultura"}
        ]
    }

    # 1. Busca as Trends reais da IRIS
    try:
        iris_res = requests.get(IRIS_URL, timeout=5)
        if iris_res.status_code == 200:
            bundle["trends"] = iris_res.json().get("google_trends", [])
    except:
        bundle["trends"] = [{"hashtag": "#Sincronizando", "topic": "Aguardando IRIS..."}]

    # 2. Valida segurança no Heimdall
    try:
        security_res = requests.get(f"{HEIMDALL_URL}?ip={client_ip}", timeout=2)
        if security_res.status_code == 200:
            bundle["security"] = security_res.json()
    except:
        pass

    return bundle

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)