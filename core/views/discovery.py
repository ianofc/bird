from django.shortcuts import render
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from ..models import Bird

# ========================================================
# 🧭 EXPLORE (GRID DE DESCOBERTA)
# ========================================================

@login_required
def explore_view(request):
    """
    Grade de descoberta estilo Instagram (Imagens e Vídeos).
    Também funciona como a View de Resultados de Busca.
    """
    query = request.GET.get('q')
    
    # Base: Apenas mídias permanentes (Exclui texto puro e stories)
    base_birds = Bird.objects.exclude(
        Q(post_type='text') | Q(post_type='story')
    )

    if query:
        # Busca: Conteúdo, Username ou Nome do Perfil
        birds = base_birds.filter(
            Q(content__icontains=query) | 
            Q(author__username__icontains=query) |
            Q(author__profile__full_name__icontains=query)
        ).order_by('-likes__count', '-created_at') # Relevância simples
    else:
        # Modo Descoberta: Aleatório (ou os mais recentes globais)
        # Nota: order_by('?') é pesado em produção, ideal usar algoritmo de recomendação
        birds = base_birds.order_by('?')[:30]

    context = {
        'birds': birds, # Nome da variável alinhado com explore.html
        'query': query
    }

    return render(request, 'pages/explore.html', context)


# ========================================================
# 🔍 SEARCH REDIRECT (Opcional, se tiver rota separada)
# ========================================================

@login_required
def search_view(request):
    """Redireciona a busca para o explore_view"""
    return explore_view(request)


# ========================================================
# 🎬 REELS (TIKTOK STYLE)
# ========================================================

@login_required
def reels_view(request):
    """
    Feed imersivo de vídeos verticais em tela cheia.
    Tenta buscar vídeos reais do banco. Se não houver, exibe demonstração.
    """
    
    # 1. Tenta buscar vídeos reais do banco
    real_videos = Bird.objects.filter(post_type='video').order_by('-created_at')[:10]

    if real_videos.exists():
        videos = real_videos
        using_mock = False
    else:
        # 2. Fallback: Mock Data para demonstração (UX não fica vazia)
        videos = get_mock_reels()
        using_mock = True

    context = {
        'videos': videos,
        'using_mock': using_mock
    }

    # Nota: Você precisará criar o template 'pages/reels.html' futuramente
    # Por enquanto, podemos usar o explore ou criar um simples.
    return render(request, 'pages/reels.html', context)


# ========================================================
# 🛠️ UTILITÁRIOS (MOCK DATA)
# ========================================================

def get_mock_reels():
    """
    Retorna objetos simulados (dict) que imitam a estrutura do Model Bird.
    Útil para popular a interface antes de ter usuários reais postando vídeos.
    """
    class MockProfile:
        def __init__(self, url): self.avatar = type('obj', (object,), {'url': url})

    class MockUser:
        def __init__(self, username, avatar_url):
            self.username = username
            self.profile = MockProfile(avatar_url)

    class MockVideo:
        def __init__(self, url): self.url = url

    class MockBird:
        def __init__(self, id, video_url, username, avatar_url, content, likes, comments):
            self.id = id
            self.video = MockVideo(video_url)
            self.author = MockUser(username, avatar_url)
            self.content = content
            self.likes = type('obj', (object,), {'count': likes})
            self.comments = type('obj', (object,), {'count': comments})

    return [
        MockBird(
            901,
            'https://joy1.videvo.net/videvo_files/video/free/2019-09/large_watermarked/190828_27_Supertrees_Drone_003_preview.mp4',
            'viajante_br',
            'https://i.pravatar.cc/150?u=travel',
            'Singapura é de outro mundo! 🌳✨ #travel #future',
            12500, 342
        ),
        MockBird(
            902,
            'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
            'surf_vibe',
            'https://i.pravatar.cc/150?u=surf',
            'A paz que o mar traz... 🌊 #nature #vibes',
            8200, 120
        ),
        MockBird(
            903,
            'https://assets.mixkit.co/videos/preview/mixkit-young-mother-playing-with-her-daughter-4566-large.mp4',
            'familia_feliz',
            'https://i.pravatar.cc/150?u=fam',
            'Momentos preciosos ❤️',
            22000, 800
        )
    ]