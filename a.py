import os
import subprocess
import logging
from pathlib import Path

# ==========================================
# 1. CONFIGURAÇÃO DE AMBIENTE & AUDITORIA
# ==========================================
BASE_DIR = Path(__file__).resolve().parent

def setup_audit_system():
    """Garante que a estrutura de logs para o Thalamus existe"""
    log_dir = BASE_DIR / "logs"
    log_dir.mkdir(exist_ok=True)
    print(f"✅ Sistema de Auditoria JSON pronto em: {log_dir}")

def inject_env_vars():
    """Garante que as chaves mestras estão no .env"""
    env_file = BASE_DIR / ".env"
    required_vars = [
        "MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui\n",
        "TAS_API_URL=http://localhost:8003/api/v1\n",
        "REDIS_URL=redis://127.0.0.1:6380/0\n"
    ]
    
    if not env_file.exists():
        with open(env_file, "w") as f:
            f.writelines(required_vars)
        print("✅ Arquivo .env criado com variáveis de soberania.")

# ==========================================
# 2. AUTOMAÇÃO DE BACKUP (Ponto 2)
# ==========================================
def run_initial_backup():
    """Executa o backup adaptado para Windows"""
    import shutil
    from datetime import datetime
    
    timestamp = datetime.now().strftime("%Y-%m-%d")
    backup_dir = BASE_DIR / "backups" / timestamp
    backup_dir.mkdir(parents=True, exist_ok=True)

    # 1. Backup do SQLite
    db_file = BASE_DIR / "db.sqlite3"
    if db_file.exists():
        shutil.copy2(db_file, backup_dir / "db_backup.sqlite3")
        print("✅ Backup do banco de dados concluído.")

    # 2. Backup de Mídias
    media_dir = BASE_DIR / "media"
    if media_dir.exists():
        shutil.make_archive(str(backup_dir / "media_assets"), 'gztar', media_dir)
        print("✅ Backup de mídias concluído.")

# ==========================================
# 3. MOTOR DE INGESTÃO TAS (SARA & ACCUMBENS)
# ==========================================
def create_signals_integration():
    """
    Injeta o código de integração para que o Django alimente o TAS automaticamente.
    Isso conecta o core.models ao motor de IA.
    """
    signals_path = BASE_DIR / "core" / "signals.py"
    integration_code = """
import requests
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Bird

@receiver(post_save, sender=Bird)
def ingest_into_tas(sender, instance, created, **kwargs):
    \"\"\"Envia novos Birds para o SARA gerar embeddings automaticamente\"\"\"
    if created and instance.content:
        payload = {
            "content_id": instance.id,
            "text": instance.content,
            "metadata": {"author": instance.author.username, "type": instance.post_type}
        }
        try:
            requests.post("http://localhost:8003/api/v1/events/ingest", json=payload, timeout=5)
        except Exception:
            pass # Thalamus: Silencia erros para não travar a experiência do usuário
"""
    with open(signals_path, "a") as f:
        f.write(integration_code)
    print("✅ Motor SARA/TAS integrado via Signals.")

# ==========================================
# 4. EXECUÇÃO MESTRE
# ==========================================
if __name__ == "__main__":
    print("🦅 Iniciando Integração Mestre Bird (Aurora 2.0)...")
    setup_audit_system()
    inject_env_vars()
    run_initial_backup()
    create_signals_integration()
    
    # Executa Migrações Finais
    print("⚙️ Sincronizando Base de Dados...")
    subprocess.run(["python", "manage.py", "migrate"])
    
    print("\n🚀 TUDO PRONTO! O Bird agora é autônomo.")
    print("Próximos passos: Inicie o Redis e o fastapi_service.")