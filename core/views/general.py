from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.contrib import messages
from django.contrib.auth import get_user_model

User = get_user_model()

# Importação dos Modelos Reais
try:
    from ..models import Bird, Notification, Profile
except ImportError:
    Bird = Notification = Profile = None

# ========================================================
# 🔍 BUSCA GLOBAL & HASHTAGS
# ========================================================

@login_required
def search_view(request):
    """
    Central de Busca: Procura por Pessoas e Posts.
    """
    query = request.GET.get('q', '').strip()
    users = []
    posts = []

    if query:
        # 1. Busca Usuários (Pelo Username ou Nome no Perfil)
        if Profile:
            users = Profile.objects.filter(
                Q(user__username__icontains=query) | 
                Q(full_name__icontains=query) |
                Q(bio__icontains=query)
            ).select_related('user')[:5] # Top 5 usuários

        # 2. Busca Conteúdo (Birds de texto, imagem ou vídeo)
        if Bird:
            posts = Bird.objects.filter(
                Q(content__icontains=query)
            ).exclude(post_type='story').order_by('-created_at')[:20]

    context = {
        'query': query,
        'users': users,
        'posts': posts,
        'is_search': True
    }
    # Reutilizamos o layout do Explore, mas com os resultados da busca
    return render(request, 'pages/explore.html', context)


@login_required
def hashtag_detail(request, tag_slug):
    """
    Filtra posts por hashtag.
    """
    posts = []
    tag = tag_slug.replace('#', '') # Remove # se vier na URL

    if Bird:
        # Busca simples por texto (Idealmente seria um modelo ManyToMany de Tags)
        posts = Bird.objects.filter(
            content__icontains=f"#{tag}"
        ).exclude(post_type='story').order_by('-created_at')

    context = {
        'posts': posts,
        'query': f"#{tag}", # Simula uma busca para a UI
        'is_hashtag': True
    }
    return render(request, 'pages/explore.html', context)


# ========================================================
# 🔔 CENTRAL DE NOTIFICAÇÕES (PÁGINA COMPLETA)
# ========================================================

@login_required
def notifications_view(request):
    """
    Página dedicada para ver histórico de notificações.
    """
    notifs = []
    
    if Notification:
        # Pega todas as notificações
        notifs = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
        
        # Opcional: Marcar todas como lidas ao abrir a página dedicada
        # notifs.filter(is_read=False).update(is_read=True)

    return render(request, 'pages/notifications.html', {'notifications': notifs})


@login_required
def mark_notification_read(request, notif_id):
    """
    Ação para marcar uma notificação específica como lida e redirecionar.
    """
    if Notification:
        notif = get_object_or_404(Notification, id=notif_id, recipient=request.user)
        notif.is_read = True
        notif.save()
        
        # Se tiver link, vai para o link. Se não, volta para a lista.
        if notif.link:
            return redirect(notif.link)
    
    return redirect('notifications')


# ========================================================
# ⚙️ PÁGINAS ESTÁTICAS / AUXILIARES
# ========================================================

@login_required
def settings_landing(request):
    """
    Redireciona para a view principal de settings em extras.py
    """
    return redirect('settings')

@login_required
def support_landing(request):
    """
    Redireciona para a view de suporte em extras.py
    """
    return redirect('support')