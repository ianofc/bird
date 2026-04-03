from playwright.sync_api import sync_playwright
import requests
import os
import time
import uuid

def capture_instagram_dm_final(chat_url, target_count=5000):
    with sync_playwright() as p:
        user_data_dir = "./user_data"
        browser = p.chromium.launch_persistent_context(user_data_dir, headless=False)
        page = browser.pages[0]
        
        page.goto(chat_url)
        
        print("--- AGUARDANDO LOGIN ---")
        print("Entre no chat. A captura começa em 15 segundos...")
        time.sleep(15)

        if not os.path.exists('capturas'):
            os.makedirs('capturas')

        processed_urls = set()
        total_captured = 0

        while total_captured < target_count:
            # Pega ABSOLUTAMENTE TODAS as imagens da página para filtrar manualmente
            all_imgs = page.query_selector_all('img')
            all_vids = page.query_selector_all('video')
            
            current_cycle = 0

            # --- PROCESSAR IMAGENS ---
            for img in all_imgs:
                try:
                    url = img.get_attribute('src')
                    if not url or url in processed_urls: continue

                    # O segredo: Imagens de chat no Instagram NÃO costumam ter 
                    # classes de avatar (como 'xpdipgo' ou 'x173jzuc').
                    # Mas o filtro de URL e tamanho é o mais seguro:
                    if "fbcdn.net" in url or "cdninstagram.com" in url:
                        # Vamos baixar e testar o tamanho
                        width = img.evaluate("img => img.naturalWidth")
                        
                        # Fotos de perfil são minúsculas (geralmente 32x32 ou 56x56)
                        # Imagens enviadas no chat dificilmente têm menos de 200px
                        if width > 150:
                            response = requests.get(url, timeout=10)
                            if response.status_code == 200:
                                filename = f"capturas/med_{uuid.uuid4().hex[:6]}.jpg"
                                with open(filename, 'wb') as f:
                                    f.write(response.content)
                                processed_urls.add(url)
                                total_captured += 1
                                current_cycle += 1
                                print(f"[{total_captured}] Capturado!")
                except:
                    continue

            # --- PROCESSAR VÍDEOS ---
            for video in all_vids:
                try:
                    box = video.bounding_box()
                    if not box: continue
                    
                    # Filtro de área: vídeos de chat não são minúsculos
                    if box['width'] > 100:
                        v_id = f"{box['x']}_{box['y']}"
                        if v_id not in processed_urls:
                            filename = f"capturas/vid_{uuid.uuid4().hex[:6]}.jpg"
                            video.screenshot(path=filename)
                            processed_urls.add(v_id)
                            total_captured += 1
                            current_cycle += 1
                            print(f"[{total_captured}] Frame de Vídeo!")
                except:
                    continue

            # Scroll e Feedback
            if current_cycle == 0:
                print("Nenhuma mídia nova nesta tela... Subindo mais.")
            
            # Move o mouse para o centro para o scroll funcionar no chat
            page.mouse.move(600, 500) 
            page.mouse.wheel(0, -2500)
            time.sleep(3)

# Substitua pela sua URL
capture_instagram_dm_final('https://www.instagram.com/direct/t/17850948516669619/', target_count=5000)