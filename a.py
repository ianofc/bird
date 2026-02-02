import os
import re

# Caminho para a pasta das views
VIEWS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'core', 'views')

def fix_imports_smart():
    print(f"🕵️  Varrendo importações em: {VIEWS_DIR}")
    
    count = 0
    for root, dirs, files in os.walk(VIEWS_DIR):
        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Regex poderosa:
                # Procura por "from ..models import" seguido de qualquer coisa, depois "Relationship"
                # e troca apenas o "Relationship" por "Connection" mantendo o resto.
                
                # Caso 1: Importação combinada (ex: from ..models import Bird, Relationship)
                new_content = re.sub(
                    r'(from\s+\.\.models\s+import\s+.*)(Relationship)(.*)', 
                    r'\1Connection\3', 
                    content
                )
                
                # Caso 2: Referências diretas no código que escaparam (ex: Relationship.objects)
                new_content = new_content.replace('Relationship.objects', 'Connection.objects')
                new_content = new_content.replace('Relationship(', 'Connection(')

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"✅ Corrigido: {file}")
                    count += 1

    print("-" * 30)
    print(f"🏁 Total de arquivos corrigidos: {count}")
    print("Agora tente rodar o 'makemigrations' novamente.")

if __name__ == "__main__":
    fix_imports_smart()