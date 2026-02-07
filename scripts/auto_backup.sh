#!/bin/bash
# scripts/auto_backup.sh

BACKUP_DIR="./backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# 1. Backup do Banco de Dados (SQLite)
cp db.sqlite3 "$BACKUP_DIR/db_backup.sqlite3"

# 2. Backup de Mídias (Avatares, Posts, Covers)
tar -czf "$BACKUP_DIR/media_assets.tar.gz" ./media/

# 3. Limpeza (Opcional: remove backups com mais de 7 dias)
find ./backups/ -type d -mtime +7 -exec rm -rf {} +

echo "Backup concluído em $BACKUP_DIR"