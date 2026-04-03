import google.generativeai as genai
import PIL.Image
import os
import time
import uuid

# --- CONFIGURAÇÃO ---
CHAVE_API = "AIzaSyAYrpRdYQHBz0dLZuCezGVUShLOitGY1OY"
genai.configure(api_key=CHAVE_API)

def bird_vision_nano():
    path_capturas = "./capturas"
    path_modelo = "./modelo_base"
    path_output = "./geradas"

    if not os.path.exists(path_output): os.makedirs(path_output)

    # Para o Gemini 3 Flash (Nano Banana 2) processar imagens via Chat API:
    # Usamos o 1.5-flash-latest que é o motor por trás da lógica multimodal
    NOME_MODELO = "gemini-1.5-flash-latest" 

    try:
        model = genai.GenerativeModel(model_name=NOME_MODELO)
        
        # Carregar Referência
        modelo_files = [f for f in os.listdir(path_modelo) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if not modelo_files:
            print("Erro: Pasta 'modelo_base' vazia.")
            return
        img_modelo = PIL.Image.open(os.path.join(path_modelo, modelo_files[0]))

        # Carregar Galeria
        capturas = [f for f in os.listdir(path_capturas) if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
        print(f"Bird Vision: Processando {len(capturas)} imagens...")

        for i, nome_arquivo in enumerate(capturas):
            try:
                print(f"[{i+1}/{len(capturas)}] Renderizando: {nome_arquivo}")
                img_target = PIL.Image.open(os.path.join(path_capturas, nome_arquivo))

                # Prompt para forçar o motor de imagem interno (Nano Banana)
                prompt = (
                    "Using Image-to-Image Generation (Gemini 3 Flash/Nano Banana 2): "
                    "Take the face from the first image and realistically place it on the person in the second image. "
                    "Keep the background, lighting, and pose of the second image exactly the same. "
                    "Provide the generated image as output."
                )

                # Chamada multimodal
                response = model.generate_content([prompt, img_modelo, img_target])
                
                # Verificando se retornou imagem (inline_data) ou erro
                try:
                    # Se o modelo gerou a imagem, ela vem em parts[0].inline_data
                    # Se ele retornou texto (erro de política), caímos no except
                    if response.candidates[0].content.parts:
                        # Nota: No Tier Free, o Gemini costuma recusar gerar rostos reais.
                        # Se ele retornar apenas texto, vamos logar para você saber.
                        print(f"   -> Resposta: {response.text[:50]}...")
                except:
                    print(f"   -> Erro: Modelo recusou a geração por política de segurança.")

                time.sleep(4) 

            except Exception as e:
                print(f"   -> Falha em {nome_arquivo}: {e}")
                continue

    except Exception as e:
        print(f"Erro no Motor: {e}")

if __name__ == "__main__":
    bird_vision_nano()