#!/usr/bin/env python3
"""
ZIOS - Proactive Intelligence
Sistema de IA e segurança PentaIA
"""

import os
import sys
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | ZIOS_NODE: %(message)s"
)
logger = logging.getLogger("ZIOS_MAIN")

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ZIOS - Proactive Intelligence",
    description="Motor de IA e segurança do ecossistema PentaIA",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "OPERATIONAL",
        "engine": "ZIOS_PENTAIA_v2",
        "service": "Proactive-Intelligence",
        "port": 8002,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {
        "status": "OPERATIONAL",
        "components": {
            "brain": "ACTIVE",
            "memory": "ACTIVE",
            "resonance": "ACTIVE"
        }
    }

@app.get("/v1/proactive/heimdall/check")
async def heimdall_check(ip: str = Query(...)):
    logger.info(f"🔒 Heimdall verificando IP: {ip}")
    
    threat_detected = False
    shield_level = "OPTIMAL"
    recommendations = []
    
    blocked_ips = ["192.168.1.100", "10.0.0.50", "172.16.0.99"]
    if ip in blocked_ips:
        threat_detected = True
        shield_level = "ELEVATED"
        recommendations = ["Ativar 2FA", "Revisar sessões ativas", "Notificar administrador"]
        logger.warning(f"⚠️ Ameaça detectada no IP: {ip}")
    
    return {
        "status": "PROTECTED" if not threat_detected else "WARNING",
        "shield_level": shield_level,
        "client_ip": ip,
        "threat_detected": threat_detected,
        "recommendations": recommendations
    }

@app.get("/api/v1/zios/status")
async def zios_status():
    return {
        "brain": "online",
        "memory_system": "synced",
        "resonance_engine": "calibrated"
    }

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8002"))
    host = os.getenv("HOST", "0.0.0.0")
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    logger.info(f"🧠 Iniciando ZIOS em {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        reload_dirs=["/app"] if reload else None,
        workers=1
    )
