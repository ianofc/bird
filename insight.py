import os
import time
import google.generativeai as genai
from pathlib import Path

# 1. CONFIGURAÇÃO PRO
# Certifique-se de que sua API Key é da conta com plano Pro
genai.configure(api_key="AIzaSyAUTZEQy0aLpyWAKR3kpSmLk8O5QOQQxoA")

# Usamos o modelo Pro para a análise de DNA e o Flash Image para a geração
model_analise = genai.GenerativeModel('gemini-1.5-pro')
model_imagem = genai.GenerativeModel('gemini-3-flash-image') # Motor Nano Banana 2

# 2. UPLOAD DO DNA (CACHE)
print("Subindo referências da modelo...")
fotos_base = [
    genai.upload_file("modelo_base/Gemini_Generated_Image_l3c6a9l3c6a9l3c6.png"),
    genai.upload_file("modelo_base/Gemini_Generated_Image_mahumjmahumjmahu.png"),
    genai.upload_file("modelo_base/Gemini_Generated_Image_vlshsyvlshsyvlsh.png"),
    genai.upload_file("modelo_base/unnamed (1)3323.jpg"),
]

# 3. DIRETÓRIOS
path_capturas = Path("./capturas")
path_saida = Path("./geradas_consistentes")
path_saida.mkdir(exist_ok=True)

# 4. O LOOP DE 900+ IMAGENS
arquivos = [f for f in os.listdir(path_capturas) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

for arquivo in arquivos:
    nome_final = f"final_{arquivo}"
    if (path_saida / nome_final).exists():
        continue

    try:
        print(f"Processando: {arquivo}...")
        foto_pose = genai.upload_file(str(path_capturas / arquivo))

        # PASSO A: O Gemini Pro analisa e cria o prompt técnico de fusão
        # Aqui ele garante que o cabelo morena e o biotipo sejam respeitados
        instrucao_prompt = (
            "Analyze these 4 reference photos of the same woman (brunette, specific skin tone and body type). "
            "Now, look at this target pose image. Create a prompt to generate a new image "
            "where the woman from the 4 references is performing the exact pose and is in the "
            "exact environment of the target image. Focus on maintaining her hair texture, "
            "skin tone, and physical build. Output only the prompt text."
        )
        
        resultado_prompt = model_analise.generate_content([instrucao_prompt, *fotos_base, foto_pose])
        prompt_final = resultado_prompt.text

        # PASSO B: Geração da Imagem Final
        # O modelo de imagem recebe o prompt 'blindado' pela análise anterior
        print(f"Gerando imagem consistente para {arquivo}...")
        imagem_gerada = model_imagem.generate_content(prompt_final)
        
        # Salvando o arquivo
        # Nota: A estrutura de salvamento depende do retorno do blob de imagem no SDK
        for i, chunk in enumerate(imagem_gerada.candidates[0].content.parts):
            if chunk.inline_data:
                with open(path_saida / nome_final, "wb") as f:
                    f.write(chunk.inline_data.data)

        # Limpeza para não estourar limite de armazenamento temporário
        foto_pose.delete()
        print(f"Sucesso: {nome_final} salvo.")

    except Exception as e:
        print(f"Erro em {arquivo}: {e}")
        time.sleep(10) # Pausa maior em erro para resetar conexão

    # Delay de segurança para conta Pro (ajuste conforme sua quota)
    time.sleep(5)

print("\n--- PROCESSO AUTOMÁTICO CONCLUÍDO ---")