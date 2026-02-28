import os

SERVICE_NAME = "mercurio"
SERVICE_PORT = int(os.getenv("MERCURIO_PORT", "8004"))
REQUEST_TIMEOUT_DEFAULT = float(os.getenv("MERCURIO_TIMEOUT", "2.5"))

# Endpoints internos (docker-first com fallback local)
TAS_TRENDS_URL = os.getenv("TAS_TRENDS_URL", "http://tas:8001/api/v1/recommend/trends")
IRIS_SCAN_URL = os.getenv("IRIS_SCAN_URL", "http://iris:8003/scan/full")
HEIMDALL_CHECK_URL = os.getenv("HEIMDALL_CHECK_URL", "http://zios:8002/v1/proactive/heimdall/check")

# CORS
CORS_ALLOW_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "MERCURIO_CORS_ALLOW_ORIGINS",
        "http://localhost:8080,http://127.0.0.1:8080",
    ).split(",")
    if origin.strip()
]
