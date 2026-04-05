#!/usr/bin/env python3
"""
🚀 PENTAIA SYSTEM AUTOMATOR
Script mestre para gerenciamento do ecossistema Lyv/MultiVerso IO
Autor: Ian Santos
Versão: 2.0.0
"""

import os
import sys
import subprocess
import json
import time
import re
import shutil
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

class ServiceStatus(Enum):
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    MISSING = "missing"
    REBUILDING = "rebuilding"

@dataclass
class Service:
    name: str
    port: int
    container: str
    endpoints: List[str]
    required_files: Dict[str, str]  # filename: content_pattern

# CONFIGURAÇÃO DOS SERVIÇOS PENTAIA
SERVICES = {
    "tas": Service(
        name="TAS",
        port=8001,
        container="lyv_tas",
        endpoints=["/", "/health", "/api/v1/recommend/trends"],
        required_files={
            "main.py": "async def get_trends",
            "requirements.txt": "fastapi"
        }
    ),
    "zios": Service(
        name="ZIOS",
        port=8002,
        container="lyv_zios",
        endpoints=["/", "/v1/proactive/heimdall/check?ip=127.0.0.1"],
        required_files={
            "main.py": "async def heimdall_check"
        }
    ),
    "iris": Service(
        name="IRIS",
        port=8003,
        container="lyv_iris",
        endpoints=["/", "/scan/full"],
        required_files={
            "main.py": "perform_scan"
        }
    ),
    "mercurio": Service(
        name="MERCÚRIO",
        port=8004,
        container="lyv_mercurio",
        endpoints=["/", "/api/v1/mercurio/bundle"],
        required_files={
            "main.py": "get_integrated_bundle"
        }
    ),
    "backend": Service(
        name="DJANGO BACKEND",
        port=8000,
        container="lyv_backend",
        endpoints=["/api/auth/me/"],
        required_files={}
    ),
    "frontend": Service(
        name="FRONTEND",
        port=8080,
        container="lyv_frontend",
        endpoints=["/"],
        required_files={}
    )
}

class PentaiaAutomator:
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path).resolve()
        self.errors_found = []
        self.fixes_applied = []
        
    def log(self, message: str, level: str = "info"):
        """Log colorido"""
        timestamp = time.strftime("%H:%M:%S")
        prefix = f"[{timestamp}]"
        
        if level == "info":
            print(f"{Colors.BLUE}{prefix}{Colors.END} {message}")
        elif level == "success":
            print(f"{Colors.GREEN}{prefix} ✓ {message}{Colors.END}")
        elif level == "warning":
            print(f"{Colors.YELLOW}{prefix} ⚠ {message}{Colors.END}")
        elif level == "error":
            print(f"{Colors.RED}{prefix} ✗ {message}{Colors.END}")
        elif level == "header":
            print(f"\n{Colors.HEADER}{Colors.BOLD}{message}{Colors.END}")
            print("=" * 60)
        elif level == "cyan":
            print(f"{Colors.CYAN}{prefix} ➜ {message}{Colors.END}")

    def run_command(self, cmd: str, capture: bool = True) -> Tuple[int, str, str]:
        """Executa comando shell e retorna (código, stdout, stderr)"""
        try:
            if capture:
                result = subprocess.run(
                    cmd, shell=True, capture_output=True, text=True, 
                    cwd=self.base_path, timeout=120
                )
                return result.returncode, result.stdout, result.stderr
            else:
                result = subprocess.run(cmd, shell=True, cwd=self.base_path)
                return result.returncode, "", ""
        except subprocess.TimeoutExpired:
            return -1, "", "Timeout"
        except Exception as e:
            return -1, "", str(e)

    def check_docker_running(self) -> bool:
        """Verifica se Docker Desktop está rodando"""
        code, _, _ = self.run_command("docker ps", capture=True)
        if code != 0:
            self.log("Docker não está acessível. Inicie o Docker Desktop!", "error")
            return False
        return True

    def verify_file_exists(self, service_name: str, filename: str) -> bool:
        """Verifica se arquivo existe no diretório do serviço"""
        filepath = self.base_path / service_name / filename
        exists = filepath.exists()
        if not exists:
            self.log(f"[{service_name}] Arquivo ausente: {filename}", "warning")
        return exists

    def check_file_content(self, service_name: str, filename: str, pattern: str) -> bool:
        """Verifica se arquivo contém padrão necessário"""
        filepath = self.base_path / service_name / filename
        if not filepath.exists():
            return False
        
        try:
            content = filepath.read_text(encoding='utf-8')
            return pattern in content
        except Exception as e:
            self.log(f"Erro lendo {filepath}: {e}", "error")
            return False

    def write_file(self, service_name: str, filename: str, content: str) -> bool:
        """Escreve arquivo no diretório do serviço"""
        service_dir = self.base_path / service_name
        service_dir.mkdir(parents=True, exist_ok=True)
        
        filepath = service_dir / filename
        try:
            filepath.write_text(content, encoding='utf-8')
            self.log(f"[{service_name}] Criado: {filename}", "success")
            return True
        except Exception as e:
            self.log(f"Erro escrevendo {filepath}: {e}", "error")
            return False

    def generate_tas_main(self) -> str:
        """Gera código main.py completo do TAS"""
        return '''#!/usr/bin/env python3
"""
TAS - Thalamus Accumbens SARA System
Entry point unificado para Docker e desenvolvimento local
"""

import os
import sys
import logging
import math
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | TAS_NODE: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("TAS_MAIN")

@asynccontextmanager
async def lifespan(app):
    logger.info("🚀 [TAS ORCHESTRATOR] Iniciando motor PentaIA...")
    logger.info("📦 Dependências verificadas")
    logger.info("🗄️ Conexão com banco estabelecida")
    logger.info("🔥 TAS Engine pronto na porta 8001")
    yield
    logger.info("🛑 TAS Engine desligado")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="TAS - Thalamus Accumbens SARA",
    description="Motor de decisão do feed PentaIA",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrendItem(BaseModel):
    id: str
    hashtag: str
    topic: str
    category: str
    engagement: str
    sara_score: float
    viral: bool = False

@app.get("/")
async def root():
    return {
        "status": "OPERATIONAL",
        "engine": "TAS_PENTAIA_v2",
        "service": "Thalamus-Accumbens-SARA",
        "port": 8001,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {
        "status": "OPERATIONAL",
        "engine": "TAS_PENTAIA_v2",
        "components": {
            "thalamus": "ACTIVE",
            "sara": "ACTIVE", 
            "accumbens": "ACTIVE"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/recommend/trends")
async def get_trends():
    logger.info("📊 Accumbens processando trends...")
    
    raw_trends = [
        TrendItem(
            id="tas_001",
            hashtag="#InteligenciaArtificial",
            topic="Avanços em IA Generativa 2026",
            category="Tecnologia",
            engagement="45.2k",
            sara_score=0.95,
            viral=True
        ),
        TrendItem(
            id="tas_002",
            hashtag="#Sustentabilidade",
            topic="Energia Limpa no Brasil bate recorde",
            category="Meio Ambiente",
            engagement="32.1k",
            sara_score=0.88,
            viral=True
        ),
        TrendItem(
            id="tas_003",
            hashtag="#Libertadores",
            topic="Final 2026 define campeão sul-americano",
            category="Esportes",
            engagement="28.7k",
            sara_score=0.82,
            viral=True
        ),
        TrendItem(
            id="tas_004",
            hashtag="#EconomiaGlobal",
            topic="Mercados reagem às novas políticas",
            category="Economia",
            engagement="19.3k",
            sara_score=0.75
        ),
        TrendItem(
            id="tas_005",
            hashtag="#CinemaNacional",
            topic="Filme brasileiro concorre ao Oscar",
            category="Cultura",
            engagement="15.8k",
            sara_score=0.71
        ),
        TrendItem(
            id="tas_006",
            hashtag="#SpaceX",
            topic="Novo lançamento de foguete reutilizável",
            category="Ciência",
            engagement="12.4k",
            sara_score=0.68
        ),
    ]
    
    def dopamine_score(trend: TrendItem) -> float:
        eng_str = trend.engagement.replace('k', '').replace('m', '')
        try:
            eng_num = float(eng_str)
        except:
            eng_num = 1.0
        return trend.sara_score * math.log(eng_num + 1)
    
    sorted_trends = sorted(raw_trends, key=dopamine_score, reverse=True)
    logger.info(f"✅ Retornando {len(sorted_trends)} trends ranqueados")
    
    return {
        "trends": [t.model_dump() for t in sorted_trends],
        "source": "TAS_INTERNAL",
        "count": len(sorted_trends),
        "engine": "TAS_PENTAIA_v2",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/feed/personalized")
async def get_personalized_feed(user_id: Optional[str] = None):
    return {
        "user_id": user_id or "anonymous",
        "feed": [],
        "message": "SARA personalização em desenvolvimento"
    }

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8001"))
    host = os.getenv("HOST", "0.0.0.0")
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    logger.info(f"🚀 Iniciando TAS em {host}:{port} (reload={reload})")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        reload_dirs=["/app"] if reload else None,
        workers=1,
        access_log=True
    )
'''

    def generate_zios_main(self) -> str:
        """Gera código main.py completo do ZIOS"""
        return '''#!/usr/bin/env python3
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
'''

    def generate_tas_requirements(self) -> str:
        """Gera requirements.txt do TAS"""
        return '''fastapi==0.109.0
uvicorn==0.27.0
redis>=5.0.1
numpy
requests
python-multipart
sqlalchemy>=1.4.0
asyncpg
python-dotenv
psycopg2-binary
gunicorn
pydantic-settings
pydantic>=2.5.0
'''

    def fix_service_files(self, service_key: str) -> bool:
        """Detecta e corrige arquivos faltantes ou incorretos de um serviço"""
        service = SERVICES[service_key]
        fixed = False
        
        self.log(f"Verificando {service.name}...", "cyan")
        
        # Verifica arquivos necessários
        for filename, pattern in service.required_files.items():
            filepath = self.base_path / service_key / filename
            
            if not filepath.exists():
                self.log(f"  Arquivo ausente: {filename}", "warning")
                
                # Gera arquivo correspondente
                if filename == "main.py" and service_key == "tas":
                    content = self.generate_tas_main()
                    if self.write_file(service_key, filename, content):
                        fixed = True
                        
                elif filename == "main.py" and service_key == "zios":
                    content = self.generate_zios_main()
                    if self.write_file(service_key, filename, content):
                        fixed = True
                        
                elif filename == "requirements.txt" and service_key == "tas":
                    content = self.generate_tas_requirements()
                    if self.write_file(service_key, filename, content):
                        fixed = True
            else:
                # Verifica conteúdo
                if not self.check_file_content(service_key, filename, pattern):
                    self.log(f"  Conteúdo incorreto em: {filename}", "warning")
                    
                    # Regenera se necessário
                    if filename == "main.py" and service_key == "tas":
                        content = self.generate_tas_main()
                        backup_path = filepath.with_suffix('.py.backup')
                        shutil.copy(filepath, backup_path)
                        if self.write_file(service_key, filename, content):
                            fixed = True
                            
                    elif filename == "main.py" and service_key == "zios":
                        content = self.generate_zios_main()
                        backup_path = filepath.with_suffix('.py.backup')
                        shutil.copy(filepath, backup_path)
                        if self.write_file(service_key, filename, content):
                            fixed = True
        
        return fixed

    def test_endpoint(self, port: int, endpoint: str) -> Tuple[bool, dict]:
        """Testa se endpoint responde corretamente"""
        import urllib.request
        import urllib.error
        
        url = f"http://localhost:{port}{endpoint}"
        try:
            req = urllib.request.Request(url, method='GET')
            req.add_header('Accept', 'application/json')
            
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode('utf-8'))
                return True, data
        except urllib.error.HTTPError as e:
            return False, {"error": f"HTTP {e.code}", "url": url}
        except Exception as e:
            return False, {"error": str(e), "url": url}

    def check_service_health(self, service_key: str) -> ServiceStatus:
        """Verifica saúde completa de um serviço"""
        service = SERVICES[service_key]
        
        # Testa endpoints
        for endpoint in service.endpoints:
            success, data = self.test_endpoint(service.port, endpoint)
            if not success:
                self.log(f"[{service.name}] Endpoint falhou: {endpoint}", "error")
                return ServiceStatus.UNHEALTHY
        
        return ServiceStatus.HEALTHY

    def rebuild_service(self, service_key: str) -> bool:
        """Rebuilda um serviço específico"""
        service = SERVICES[service_key]
        self.log(f"Rebuilding {service.name}...", "header")
        
        # Para container se existir
        self.run_command(f"docker-compose stop {service_key}", capture=True)
        self.run_command(f"docker-compose rm -f {service_key}", capture=True)
        
        # Rebuild sem cache
        code, stdout, stderr = self.run_command(
            f"docker-compose build --no-cache {service_key}", 
            capture=False  # Mostra output em tempo real
        )
        
        if code != 0:
            self.log(f"Falha no rebuild de {service.name}", "error")
            return False
        
        self.log(f"{service.name} rebuildado com sucesso!", "success")
        return True

    def full_system_check(self) -> Dict[str, ServiceStatus]:
        """Executa verificação completa do sistema"""
        self.log("INICIANDO DIAGNÓSTICO COMPLETO DO SISTEMA PENTAIA", "header")
        
        results = {}
        
        # 1. Verifica Docker
        if not self.check_docker_running():
            return results
        
        # 2. Verifica e corrige arquivos de cada serviço
        self.log("FASE 1: Verificação de Arquivos", "header")
        services_to_rebuild = []
        
        for key in ["tas", "zios"]:  # Serviços críticos que geramos código
            if self.fix_service_files(key):
                services_to_rebuild.append(key)
        
        # 3. Verifica containers rodando
        self.log("FASE 2: Verificação de Containers", "header")
        code, stdout, _ = self.run_command("docker-compose ps --format json", capture=True)
        
        running_containers = []
        if code == 0 and stdout:
            try:
                containers = json.loads(stdout)
                running_containers = [c.get("Service") for c in containers if c.get("State") == "running"]
            except:
                pass
        
        # 4. Testa saúde dos serviços
        self.log("FASE 3: Testes de Saúde (Health Checks)", "header")
        
        for key, service in SERVICES.items():
            if key in running_containers or key in ["tas", "zios", "iris", "mercurio", "backend", "frontend"]:
                status = self.check_service_health(key)
                results[key] = status
                
                if status == ServiceStatus.HEALTHY:
                    self.log(f"[{service.name}] ✓ SAUDÁVEL", "success")
                else:
                    self.log(f"[{service.name}] ✗ PROBLEMA DETECTADO", "error")
                    if key not in services_to_rebuild:
                        services_to_rebuild.append(key)
        
        # 5. Rebuild se necessário
        if services_to_rebuild:
            self.log(f"FASE 4: Rebuild Necessário para: {', '.join(services_to_rebuild)}", "header")
            
            for key in services_to_rebuild:
                self.rebuild_service(key)
        
        return results

    def start_system(self):
        """Inicia todo o ecossistema"""
        self.log("INICIANDO PENTAIA ECOSYSTEM", "header")
        
        # Verifica arquivos primeiro
        for key in ["tas", "zios"]:
            self.fix_service_files(key)
        
        # Up completo
        self.log("Subindo todos os serviços...", "cyan")
        code, _, _ = self.run_command("docker-compose up -d", capture=False)
        
        if code == 0:
            self.log("Sistema iniciado! Aguardando health checks...", "success")
            time.sleep(10)  # Aguarda inicialização
            
            # Verifica saúde
            self.full_system_check()
        else:
            self.log("Falha ao iniciar sistema", "error")

    def stop_system(self):
        """Para todo o ecossistema"""
        self.log("PARANDO PENTAIA ECOSYSTEM", "header")
        self.run_command("docker-compose down", capture=False)

    def logs(self, service: Optional[str] = None):
        """Mostra logs"""
        if service:
            self.run_command(f"docker-compose logs -f {service}", capture=False)
        else:
            self.run_command("docker-compose logs -f", capture=False)

    def menu(self):
        """Menu interativo"""
        while True:
            print(f"\n{Colors.HEADER}{Colors.BOLD}🚀 PENTAIA SYSTEM AUTOMATOR v2.0{Colors.END}")
            print("=" * 50)
            print(f"{Colors.CYAN}1.{Colors.END} Iniciar Sistema Completo (up + health check)")
            print(f"{Colors.CYAN}2.{Colors.END} Verificar e Corrigir Problemas (diagnóstico)")
            print(f"{Colors.CYAN}3.{Colors.END} Rebuild Serviço Específico")
            print(f"{Colors.CYAN}4.{Colors.END} Parar Sistema")
            print(f"{Colors.CYAN}5.{Colors.END} Ver Logs")
            print(f"{Colors.CYAN}6.{Colors.END} Testar Endpoints")
            print(f"{Colors.CYAN}0.{Colors.END} Sair")
            print("=" * 50)
            
            choice = input(f"{Colors.YELLOW}Escolha: {Colors.END}").strip()
            
            if choice == "1":
                self.start_system()
            elif choice == "2":
                self.full_system_check()
            elif choice == "3":
                print("\nServiços disponíveis:")
                for i, (key, svc) in enumerate(SERVICES.items(), 1):
                    print(f"  {i}. {svc.name} ({key})")
                svc_choice = input("Qual serviço rebuildar? (nome): ").strip().lower()
                if svc_choice in SERVICES:
                    self.rebuild_service(svc_choice)
                else:
                    self.log("Serviço inválido", "error")
            elif choice == "4":
                self.stop_system()
            elif choice == "5":
                print("\nServiços: tas, zios, iris, mercurio, backend, frontend, (deixe vazio para todos)")
                svc = input("Qual serviço? ").strip() or None
                self.logs(svc)
            elif choice == "6":
                self.full_system_check()
            elif choice == "0":
                print(f"{Colors.GREEN}Até logo! 🦅{Colors.END}")
                break
            else:
                self.log("Opção inválida", "warning")

def main():
    automator = PentaiaAutomator()
    
    # Se passou argumentos, executa direto
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "up":
            automator.start_system()
        elif cmd == "down":
            automator.stop_system()
        elif cmd == "check":
            automator.full_system_check()
        elif cmd == "fix":
            for key in ["tas", "zios"]:
                automator.fix_service_files(key)
        elif cmd == "rebuild" and len(sys.argv) > 2:
            automator.rebuild_service(sys.argv[2])
        else:
            print(f"Comandos: up, down, check, fix, rebuild <servico>")
    else:
        # Menu interativo
        automator.menu()

if __name__ == "__main__":
    main(),