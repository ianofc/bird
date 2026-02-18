#!/usr/bin/env python3
"""
FIX AGRESSIVO - Remove completamente zios/tas do settings.py
"""

import re
from pathlib import Path

settings_path = Path("backend/bird/settings.py")

if not settings_path.exists():
    print("❌ settings.py não encontrado")
    exit(1)

content = settings_path.read_text(encoding='utf-8')

# Remover completamente qualquer linha com zios ou tas (exceto comentários explicativos)
lines = content.split('\n')
new_lines = []

for line in lines:
    stripped = line.strip().lower()
    
    # Pular linhas que contenham zios ou tas (mas não comentários de aviso)
    if ('zios' in stripped or 'tas' in stripped) and not stripped.startswith('#'):
        print(f"🗑️  Removendo: {line.strip()[:60]}...")
        continue  # Não adiciona esta linha
    
    new_lines.append(line)

# Salvar
new_content = '\n'.join(new_lines)
settings_path.write_text(new_content, encoding='utf-8')

print("✅ settings.py limpo!")
print("Reiniciando backend...")