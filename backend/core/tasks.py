import subprocess
import os
from celery import shared_task
from django.conf import settings
from .models import Bird

@shared_task
def process_video_upload(bird_id):
    """
    Tarefa de Background (Worker):
    1. Recebe o ID do post.
    2. Localiza o vídeo no disco.
    3. Usa FFmpeg para extrair um frame (thumbnail).
    4. Atualiza o banco de dados e libera o post (is_processing=False).
    """
    try:
        bird = Bird.objects.get(id=bird_id)
        
        # Se por algum motivo o arquivo não existe ou não é vídeo, aborta
        if not bird.video or not bird.video.path:
            bird.is_processing = False
            bird.save()
            return

        video_path = bird.video.path
        
        # Define nomes e caminhos
        base_name = os.path.splitext(os.path.basename(video_path))[0]
        thumb_name = f"{base_name}_thumb.jpg"
        
        # Caminho Relativo (para salvar no Banco de Dados)
        thumb_rel_path = f"posts/{bird.author.username}/thumbnails/{thumb_name}"
        
        # Caminho Absoluto (para o Sistema Operacional salvar o arquivo)
        thumb_full_path = os.path.join(settings.MEDIA_ROOT, 'posts', bird.author.username, 'thumbnails', thumb_name)

        # Garante que a pasta de thumbnails existe
        os.makedirs(os.path.dirname(thumb_full_path), exist_ok=True)

        # COMANDO FFMPEG
        # -ss 00:00:01.000: Pega o frame no segundo 1 (evita tela preta do início)
        # -vframes 1: Extrai apenas 1 frame
        # -y: Sobrescreve se já existir
        subprocess.run([
            'ffmpeg', '-y', 
            '-i', video_path, 
            '-ss', '00:00:01.000', 
            '-vframes', '1', 
            thumb_full_path
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Verifica se o arquivo foi gerado com sucesso
        if os.path.exists(thumb_full_path):
            bird.thumbnail.name = thumb_rel_path
        
        # Finaliza o processamento
        bird.is_processing = False
        bird.save()

    except Bird.DoesNotExist:
        print(f"Erro: Post {bird_id} foi deletado antes do processamento.")
        
    except Exception as e:
        print(f"Erro crítico ao processar vídeo {bird_id}: {str(e)}")
        
        # Em caso de erro, tentamos destravar o post para não ficar carregando eternamente
        try:
            bird = Bird.objects.get(id=bird_id)
            bird.is_processing = False
            bird.save()
        except:
            pass