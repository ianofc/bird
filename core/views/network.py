# Arquivo: bird/social/views/network.py
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

# Importação segura
try:
    from ..models import Follow
except ImportError:
    Follow = None

@login_required
def network_view(request):
    """
    Página principal da rede ('Amigos').
    Exibe abas de Seguidores e Seguindo.
    """
    followers_list = []
    following_list = []
    
    if Follow:
        # Quem segue o usuário logado
        followers_list = Follow.objects.filter(user_to=request.user).select_related('user_from')
        
        # Quem o usuário logado segue
        following_list = Follow.objects.filter(user_from=request.user).select_related('user_to')

    context = {
        'followers': followers_list,
        'following': following_list,
        'section': 'network'
    }
    return render(request, 'social/friends/list.html', context)

@login_required
def suggestions_view(request):
    """
    Sugestões de novas conexões (Pessoas que você talvez conheça).
    """
    suggestions = []
    if Follow:
        # Pega IDs de quem eu já sigo
        following_ids = Follow.objects.filter(user_from=request.user).values_list('user_to', flat=True)
        
        # Busca usuários que NÃO sigo e NÃO sou eu mesmo
        # Lógica simples: Pega aleatórios (order_by '?')
        suggestions = User.objects.exclude(
            id__in=following_ids
        ).exclude(
            id=request.user.id
        ).order_by('?')[:20]

    return render(request, 'social/friends/suggestions.html', {'suggestions': suggestions})

@login_required
def requests_view(request):
    """
    Solicitações de amizade (se o sistema for fechado) ou notificações de novos seguidores.
    """
    # Como estamos usando modelo "Follow" (Assíncrono tipo Insta/Twitter), 
    # geralmente não há "aceitar solicitação", mas podemos listar quem começou a seguir recentemente.
    
    recent_followers = []
    if Follow:
        recent_followers = Follow.objects.filter(user_to=request.user).order_by('-created_at')[:10]

    return render(request, 'social/friends/requests.html', {'recent_followers': recent_followers})