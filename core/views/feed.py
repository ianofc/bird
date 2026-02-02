from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from ..models import Bird, Connection

# @login_required  <-- Comentei temporariamente para você ver a tela mesmo sem login
def index(request):
    # Se o usuário não estiver logado, mostra uma versão pública ou redireciona
    if not request.user.is_authenticated:
        return render(request, 'layout/base_bird.html', {'birds': []})

    user = request.user
    
    # 1. Pegar IDs de quem o usuário segue
    following_ids = Connection.objects.filter(
        follower=user, 
        status='active'
    ).values_list('target_id', flat=True)

    # 2. Filtrar Posts (Feed)
    feed_birds = Bird.objects.filter(
        Q(author__in=following_ids) | Q(author=user)
    ).exclude(
        post_type='story'
    ).order_by('-created_at')

    # 3. Pegar Stories
    stories = Bird.objects.filter(
        author__in=following_ids,
        post_type='story'
    ).select_related('author__profile').order_by('-created_at')
    
    active_stories = [story for story in stories if story.is_active]

    context = {
        'birds': feed_birds,
        'stories': active_stories,
    }
    
    return render(request, 'pages/feed.html', context)