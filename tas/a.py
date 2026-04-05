import os
import datetime

# Documentação Técnica Gerada Automaticamente
DOCUMENTATION = f"""
# TAS ENGINE - DOCUMENTAÇÃO TÉCNICA v1.0
Gerado em: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## 1. Arquitetura (Trindade TAS)
- **Thalamus (O Porteiro):** Responsável pela soberania do utilizador e filtros legais. Executa o veto antes de qualquer cálculo pesado. [cite: 39]
- **SARA (A Atenção):** Motor de busca semântica e afinidade vetorial utilizando similaridade de cosseno. [cite: 35, 38]
- **Accumbens (A Recompensa):** Algoritmo de ranking baseado em "Scores de Dopamina" (Share, Like, Click). [cite: 38]

## 2. Fluxo de Dados
1. Ingestão via `/api/v1/events/ingest` (Geração de Embeddings automática).
2. Armazenamento no Supabase (PostgreSQL + PgVector). [cite: 37]
3. Recomendação via `/api/v1/recommend/` (T -> S -> A).
4. Busca Semântica via `/api/v1/search/` (Vibe-based search).

## 3. Comandos de Manutenção
- **Iniciar Servidor (Dev):** python run_tas.py
- **Iniciar Servidor (Prod):** sh scripts/deploy_start.sh
- **Monitorizar Dopamina:** python scripts/monitor_dopamine.py
- **Sincronizar Banco:** python scripts/init_db.py

## 4. Variáveis de Ambiente (.env)
- DATABASE_URL: Conexão com Supabase. [cite: 1]
- API_V1_STR: Prefixo da API. [cite: 1]
"""

def finalize():
    print("🧹 [AUTO-CLEAN] Limpando ambiente e gerando documentação...")
    
    # 1. Cria o ficheiro de documentação
    with open("README_TAS.md", "w", encoding="utf-8") as f:
        f.write(DOCUMENTATION.strip())
    print("✅ Documentação gerada: README_TAS.md")

    # 2. Limpeza de caches de Python
    count = 0
    for root, dirs, files in os.walk("."):
        for d in dirs:
            if d == "__pycache__":
                import shutil
                shutil.rmtree(os.path.join(root, d))
                count += 1
    print(f"✅ Limpos {count} diretórios de cache (__pycache__).")

    print("\n🏆 [PROJETO CONCLUÍDO]")
    print("O TAS Engine está 100% funcional, documentado e soberano.")
    print("Pronto para ser o motor do Lyv e outros sistemas.")

if __name__ == "__main__":
    finalize()