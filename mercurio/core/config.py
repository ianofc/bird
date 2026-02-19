import os

# Tenta pegar do ambiente, se não usa localhost (para dev local) ou nome do serviço (docker)
IRIS_URL = os.getenv("IRIS_URL", "http://iris:8003")
TAS_URL = os.getenv("TAS_URL", "http://tas:8001")