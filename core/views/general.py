# Arquivo: bird/social/views/general.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.contrib import messages
from django.contrib.auth import get_user_model

User = get_user_model()

# Importação segura dos models para evitar quebras
try:
    from ..models import Post, Notification
except ImportError:
    Post = Notification = None

# ========================================================
# 🧭 EXPLORAR & REELS
# ========================================================

@login_required
def explore_view(request):
    """
    Grid de Mídia (Masonry) - Mostra posts com imagens/vídeos.
    """
    media_posts = []
    if Post:
        media_posts = Post.objects.exclude(imagem='', video='').order_by('-created_at')[:50]
        
    return render(request, 'social/search/explore.html', {'media_posts': media_posts})

@login_required
def reels_view(request):
    """
    Visualização estilo TikTok.
    """
    # Aqui você carregaria os Reels do banco
    return render(request, 'social/reels/index.html')

# ========================================================
# 🔍 BUSCA & HASHTAGS
# ========================================================

@login_required
def search_view(request):
    """
    Busca global: Usuários e Posts.
    """
    query = request.GET.get('q', '')
    users = []
    posts = []

    if query:
        # Busca usuários
        users = User.objects.filter(
            Q(username__icontains=query) | 
            Q(first_name__icontains=query)
        ).distinct()[:10]

        # Busca posts (apenas se models estiverem carregados)
        if Post:
            posts = Post.objects.filter(
                Q(conteudo__icontains=query) & Q(visibilidade='publico')
            ).order_by('-created_at')[:20]

    context = {
        'query': query,
        'users': users,
        'posts': posts
    }
    return render(request, 'social/search/explore.html', context)

@login_required
def hashtag_detail(request, tag_slug):
    """
    Exibe posts contendo uma hashtag específica (simulação simples via texto).
    """
    posts = []
    if Post:
        # Procura posts que contenham #tag no texto
        posts = Post.objects.filter(
            conteudo__icontains=f"#{tag_slug}",
            visibilidade='publico'
        ).order_by('-created_at')

    return render(request, 'social/search/explore.html', {'posts': posts, 'hashtag': tag_slug})

# ========================================================
# 🔔 NOTIFICAÇÕES
# ========================================================

@login_required
def notifications_view(request):
    """
    Lista as notificações do usuário.
    """
    notifs = []
    if Notification:
        notifs = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
        
        # Marca todas como lidas ao abrir a página (opcional)
        # notifs.update(is_read=True)

    return render(request, 'social/notifications/list.html', {'notifications': notifs})

@login_required
def mark_notification_read(request, notif_id):
    """
    Marca uma notificação específica como lida via AJAX/HTMX.
    """
    if Notification:
        notif = get_object_or_404(Notification, id=notif_id, recipient=request.user)
        notif.is_read = True
        notif.save()
    
    return redirect('bird_social:notifications')

# ========================================================
# ⚙️ CONFIGURAÇÕES E PÁGINAS ESTÁTICAS
# ========================================================

@login_required
def settings_view(request):
    return render(request, 'social/pages/settings.html')

@login_required
def support_view(request):
    return render(request, 'social/pages/support.html')

@login_required
def theme_view(request):
    return render(request, 'social/pages/themes.html')