from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.sattr_logic import SATTR
import uvicorn

app = FastAPI(title="IRIS - SATTR System", version="1.0.0")

# Habilitar CORS para o Frontend poder falar direto se precisar (backup)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

sattr = SATTR()

@app.get("/")
def health():
    return {"status": "online", "service": "IRIS", "mode": "REALTIME"}

@app.get("/scan/full")
def full_scan():
    # Retorna dados reais processados
    return sattr.perform_scan()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)