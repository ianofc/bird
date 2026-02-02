from django.shortcuts import render
from ..models import Bird

def reels_view(request):
    """Feed estilo TikTok: Apenas vídeos verticais em tela cheia"""
    videos = Bird.objects.filter(post_type='video').order_by('?')[:10] # '?' pega aleatório
    return render(request, 'pages/reels.html', {'videos': videos})

def explore_view(request):
    """Feed estilo Pinterest: Grade de imagens (Masonry Layout)"""
    images = Bird.objects.filter(post_type='image').order_by('-created_at')[:50]
    return render(request, 'pages/explore.html', {'images': images})