from django.shortcuts import render
from django.db.models import Q
from ..models import Bird

# ========================================================
# 🎬 REELS (TIKTOK STYLE)
# ========================================================

def reels_view(request):
    """
    Feed imersivo de vídeos verticais em tela cheia.
    Tenta buscar vídeos reais do banco. Se não houver, exibe demonstração.
    """
    
    # 1. Tenta buscar vídeos reais (Uploads do usuário)
    # Filtra apenas vídeos processados (opcional, se tiver flag)
    real_videos = Bird.objects.filter(post_type='video').order_by('-created_at')[:10]

    if real_videos.exists():
        videos = real_videos
        using_mock = False
    else:
        # 2. Fallback: Mock Data para a UI não ficar vazia
        videos = get_mock_reels()
        using_mock = True

    context = {
        'videos': videos,
        'using_mock': using_mock
    }

    return render(request, 'pages/reels.html', context)


# ========================================================
# 🧭 EXPLORE (INSTAGRAM GRID)
# ========================================================

def explore_view(request):
    """
    Grade de mídia mista (Vídeos e Imagens).
    """
    query = request.GET.get('q')
    
    # Busca apenas mídias (exclui posts só de texto)
    if query:
        posts = Bird.objects.filter(
            Q(content__icontains=query)
        ).exclude(post_type='text').order_by('-created_at')
    else:
        # Pega aleatórios para descoberta
        posts = Bird.objects.exclude(post_type='text').order_by('?')[:30]

    return render(request, 'pages/explore.html', {'posts': posts, 'query': query})


# ========================================================
# 🛠️ UTILITÁRIOS (MOCK DATA)
# ========================================================

def get_mock_reels():
    """Retorna vídeos de stock para preencher o feed de Reels"""
    return [
        {
            'id': 901,
            'video': {'url': 'https://joy1.videvo.net/videvo_files/video/free/2019-09/large_watermarked/190828_27_Supertrees_Drone_003_preview.mp4'},
            'author': {'username': 'viajante_br', 'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=travel'}}},
            'content': 'Singapura é de outro mundo! 🌳✨ #travel #future',
            'likes': {'count': 12500},
            'comments': 342
        },
        {
            'id': 902,
            'video': {'url': 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4'},
            'author': {'username': 'surf_vibe', 'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=surf'}}},
            'content': 'A paz que o mar traz... 🌊 #nature #vibes',
            'likes': {'count': 8200},
            'comments': 120
        },
        {
            'id': 903,
            'video': {'url': 'https://assets.mixkit.co/videos/preview/mixkit-young-mother-playing-with-her-daughter-4566-large.mp4'},
            'author': {'username': 'familia_feliz', 'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=fam'}}},
            'content': 'Momentos preciosos ❤️',
            'likes': {'count': 22000},
            'comments': 800
        }
    ]