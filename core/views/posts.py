from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse, HttpResponseBadRequest
from django.contrib import messages
from core.models import Bird # Importação absoluta para evitar erros

# ========================================================
# ⚙️ IMPORTAÇÃO DA TASK (CELERY)
# ========================================================
# Usamos try/except para que o site continue funcionando 
# mesmo se você ainda não tiver configurado o Celery/Redis.
try:
    from core.tasks import process_video_upload
except ImportError:
    process_video_upload = None
    print("⚠️ Aviso: core.tasks não encontrado ou Celery não instalado. Vídeos não serão processados.")

# ========================================================
# 🦅 CRIAÇÃO DE CONTEÚDO (POSTS)
# ========================================================

@login_required
@require_http_methods(["POST"])
def create_bird(request):
    """
    Processa a criação de um novo post (Texto, Imagem ou Vídeo).
    Retorna o HTML parcial para o HTMX injetar no feed.
    """
    # 1. Captura de Dados
    content = request.POST.get('content', '').strip()
    image = request.FILES.get('image')
    video = request.FILES.get('video')
    
    # 2. Validação: Não permite post vazio
    if not content and not image and not video:
        # Retorna 204 (No Content), o HTMX ignora e não faz nada
        return HttpResponse(status=204)

    try:
        # 3. Definição do Tipo e Status
        post_type = 'text'
        is_processing = False

        if video:
            post_type = 'video'
            is_processing = True # Vídeo nasce bloqueado até o Celery liberar
        elif image:
            post_type = 'image'

        # 4. Criação no Banco de Dados
        bird = Bird.objects.create(
            author=request.user,
            content=content,
            image=image,
            video=video,
            post_type=post_type,
            is_processing=is_processing
        )
        
        # 5. Disparo do Processamento (Background)
        if video and process_video_upload:
            # .delay() envia a tarefa para o Redis processar assincronamente
            process_video_upload.delay(bird.id)
        
        # 6. Resposta HTMX
        # Renderiza apenas o componente do novo post
        context = {'bird': bird, 'user': request.user}
        return render(request, 'components/bird_item.html', context)

    except Exception as e:
        print(f"Erro ao criar post: {e}")
        return HttpResponseBadRequest("Erro ao processar sua publicação.")


# ========================================================
# 🔍 VISUALIZAÇÃO (DETALHE / PERMALINK)
# ========================================================

@login_required
def bird_detail(request, bird_id):
    """
    Página individual do post (Permalink).
    """
    bird = get_object_or_404(Bird, id=bird_id)
    
    context = {
        'bird': bird,
        'is_detail': True # Flag para o template ajustar o layout
    }
    return render(request, 'pages/bird_detail.html', context)


# ========================================================
# 🗑️ DELEÇÃO DE CONTEÚDO
# ========================================================

@login_required
def delete_bird(request, bird_id):
    """
    Permite ao autor apagar seu post.
    """
    bird = get_object_or_404(Bird, id=bird_id)

    # Segurança: Apenas o dono pode apagar
    if request.user != bird.author:
        messages.error(request, "Você não tem permissão para isso.")
        return redirect('home')

    bird.delete()
    
    # Se for requisição HTMX (botão delete no feed), retorna vazio para sumir com o post
    if request.headers.get('HX-Request'):
        return HttpResponse("") 
    
    # Se for requisição normal, redireciona para a home
    messages.success(request, "Post removido.")
    return redirect('home')