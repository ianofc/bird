import os

# 1. Configurações de Segurança
# Pastas que o script NUNCA deve tocar
EXCLUDE_DIRS = {'node_modules', '.git', 'venv', 'env', '__pycache__', '.next', 'build', 'dist', 'migrations'}

# Extensões válidas para alterar o texto dentro
VALID_EXTS = {'.ts', '.tsx', '.js', '.jsx', '.py', '.html', '.css', '.json', '.md'}

# 2. O Dicionário de Mutação (A ordem importa: palavras compostas primeiro!)
REPLACEMENTS = {
    # Nomes de Componentes e Contextos
    "LyvContext": "LyvContext",
    "LyvLayout": "LyvLayout",
    "useLyv": "useLyv",
    "LyvProvider": "LyvProvider",
    
    # Nomes de Marcas e Textos
    "Lyvifi": "Lyvifi",
    "Pentaia Network": "Pentaia Network",
    
    # Capitalização Maiúscula/Minúscula (O nome raiz)
    "Lyv": "Lyv",
    "lyv": "lyv",
    "LYV": "LYV",
    
    # A velha nomenclatura de posts
    "Post": "Post",
    "post": "post",
    "Posts": "Posts",
    "posts": "posts",
    
    # A velha nomenclatura de abas
    "Agora": "Agora",
    "agora": "agora",
    "Agoras": "Status",
    "agoras": "status",
}

def replace_in_file(filepath):
    """Lê o arquivo, substitui o texto e salva se houver mudanças."""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
    except UnicodeDecodeError:
        return False # Pula arquivos binários ou imagens disfarçadas

    original_content = content
    for old, new in REPLACEMENTS.items():
        content = content.replace(old, new)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(content)
        return True
    return False

def rename_file(filepath, filename):
    """Renomeia arquivos que contenham 'Lyv' no nome."""
    new_filename = filename
    for old, new in REPLACEMENTS.items():
        if old in new_filename:
            new_filename = new_filename.replace(old, new)
            break # Evita múltiplas substituições no mesmo nome de arquivo
            
    if new_filename != filename:
        new_filepath = os.path.join(os.path.dirname(filepath), new_filename)
        os.rename(filepath, new_filepath)
        return new_filepath
    return filepath

def main():
    print("🧬 Iniciando o Protocolo de Expurgo Bio-Digital...")
    files_modified = 0
    files_renamed = 0

    # Varre as pastas a partir de onde o script está rodando
    for root, dirs, files in os.walk('.'):
        # Ignora as pastas proibidas
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for filename in files:
            filepath = os.path.join(root, filename)
            
            # Passo A: Renomeia o arquivo se necessário (ex: LyvLayout.tsx -> LyvLayout.tsx)
            new_filepath = rename_file(filepath, filename)
            if new_filepath != filepath:
                print(f"Renomeado: {filename} -> {os.path.basename(new_filepath)}")
                files_renamed += 1
                filepath = new_filepath # Atualiza o path para o passo B

            # Passo B: Substitui o conteúdo dentro do arquivo
            _, ext = os.path.splitext(filepath)
            if ext in VALID_EXTS:
                if replace_in_file(filepath):
                    print(f"Varrido e Atualizado: {filepath}")
                    files_modified += 1

    print("-" * 40)
    print(f"✅ Expurgo Concluído!")
    print(f"Arquivos renomeados: {files_renamed}")
    print(f"Arquivos modificados internamente: {files_modified}")
    print("⚠️ Lembre-se: Verifique se algum import quebrou devido à mudança de capitalização em caminhos de pastas!")

if __name__ == "__main__":
    main()