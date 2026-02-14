from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

# Importação Segura dos Modelos (Adaptado para o novo models.py)
try:
    from ..models import Bird, Connection, Notification, Profile, Comment
    # Tenta importar modelos secundários ou define como None
    try:
        from ..models import SavedPost
    except ImportError:
        SavedPost = None
except ImportError:
    Bird = Connection = Notification = Profile = Comment = None

# ========================================================
# ❤️ LIKES (COM HTMX E NOTIFICAÇÃO)
# ========================================================

@login_required
def toggle_like(request, bird_id):
    """
    Alterna o like em um Bird (Post).
    Suporta HTMX para atualização sem refresh.
    """
    if not Bird:
        return HttpResponse("Erro: Modelos não carregados.", status=500)

    bird = get_object_or_404(Bird, id=bird_id)
    user = request.user
    
    # Verifica se já curtiu (Many-to-Many)
    if bird.likes.filter(id=user.id).exists():
        bird.likes.remove(user)
        user_liked = False
    else:
        bird.likes.add(user)
        user_liked = True
        
        # 🔔 Gera Notificação (apenas se não for o próprio autor)
        if bird.author != user and Notification:
            # Evita spam de notificações (verifica se já notificou recentemente)
            already_notified = Notification.objects.filter(
                recipient=bird.author, sender=user, tipo='like', link=f"/bird/{bird.id}/"
            ).exists()
            
            if not already_notified:
                Notification.objects.create(
                    recipient=bird.author,
                    sender=user,
                    tipo='like',
                    message=f"curtiu sua publicação: {bird.content[:30]}...",
                    link=f"/bird/{bird.id}/" # Link direto pro post
                )

    # Se for uma requisição HTMX (AJAX), retorna apenas o botão atualizado
    if request.headers.get('HX-Request'):
        context = {
            'bird': bird,
            'user_liked': user_liked
        }
        # Precisamos ter este template parcial criado
        return render(request, 'components/partials/like_button.html', context)
    
    # Se for normal, recarrega a página
    return redirect(request.META.get('HTTP_REFERER', 'home'))


# ========================================================
# 💬 COMENTÁRIOS
# ========================================================

@login_required
def add_comment(request, bird_id):
    """
    Adiciona um comentário usando o modelo Comment.
    """
    if request.method == 'POST':
        bird = get_object_or_404(Bird, id=bird_id)
        content = request.POST.get('content')
        
        if content and Comment:
            Comment.objects.create(author=request.user, post=bird, content=content)
            
            # 🔔 Notificação
            if bird.author != request.user and Notification:
                Notification.objects.create(
                    recipient=bird.author,
                    sender=request.user,
                    tipo='comment',
                    message=f"comentou: {content[:40]}...",
                    link=f"/bird/{bird.id}/"
                )
        
    return redirect(request.META.get('HTTP_REFERER', 'home'))

@login_required
def delete_comment(request, comment_id):
    if Comment:
        comment = get_object_or_404(Comment, id=comment_id)
        # Permissão: Dono do comentário OU Dono do post original
        if request.user == comment.author or request.user == comment.post.author:
            comment.delete()
            messages.success(request, "Comentário removido.")
            
    return redirect(request.META.get('HTTP_REFERER', 'home'))


# ========================================================
# 📡 SEGUIR / CONEXÕES (CONNECTION MODEL)
# ========================================================

@login_required
def toggle_follow(request, username):
    """
    Gerencia seguir/deixar de seguir usando o modelo Connection.
    """
    target_user = get_object_or_404(User, username=username)
    
    if target_user == request.user:
        return redirect('profile_detail', username=username)

    if Connection:
        # Busca conexão existente
        conn = Connection.objects.filter(follower=request.user, target=target_user).first()
        
        if conn:
            # Se já existe, remove (Unfollow)
            conn.delete()
            # messages.info(request, f"Você deixou de seguir @{username}")
        else:
            # Se não existe, cria (Follow)
            Connection.objects.create(
                follower=request.user, 
                target=target_user, 
                status='active'
            )
            
            # 🔔 Gera Notificação
            if Notification:
                Notification.objects.create(
                    recipient=target_user,
                    sender=request.user,
                    tipo='follow',
                    message="começou a seguir você.",
                    link=f"/profile/{request.user.username}/"
                )
                
    return redirect('profile_detail', username=username)


# ========================================================
# 🛡️ BLOQUEIO E SEGURANÇA
# ========================================================

@login_required
def block_user(request, username):
    """
    Bloqueia um usuário criando uma Connection com status 'blocked'.
    """
    target_user = get_object_or_404(User, username=username)
    
    if Connection:
        # 1. Verifica/Cria a conexão de bloqueio
        block_conn, created = Connection.objects.get_or_create(
            follower=request.user, 
            target=target_user
        )
        
        # 2. Se já estava bloqueado, desbloqueia (delete)
        if not created and block_conn.status == 'blocked':
            block_conn.delete()
            messages.success(request, f"Usuário @{username} desbloqueado.")
        else:
            # 3. Se não, aplica o bloqueio
            block_conn.status = 'blocked'
            block_conn.save()
            
            # 4. Força o "Unfollow" da outra parte (Destrói a conexão inversa se existir)
            # Assim, quem foi bloqueado deixa de seguir quem bloqueou
            Connection.objects.filter(follower=target_user, target=request.user).delete()
            
            messages.warning(request, f"Você bloqueou @{username}.")
            
    return redirect('home')


# ========================================================
# 💾 SALVAR E COMPARTILHAR (FEATURES EXTRAS)
# ========================================================

@login_required
def toggle_save(request, bird_id):
    bird = get_object_or_404(Bird, id=bird_id)
    
    if SavedPost:
        saved, created = SavedPost.objects.get_or_create(user=request.user, post=bird)
        if not created:
            saved.delete()
            messages.info(request, "Item removido dos salvos.")
        else:
            messages.success(request, "Item salvo!")
            
    return redirect(request.META.get('HTTP_REFERER', 'home'))

@login_required
def share_post(request, bird_id):
    # Futuramente: Criar um Bird tipo 'repost'
    messages.success(request, "Link copiado para a área de transferência! (Simulado)")
    return redirect(request.META.get('HTTP_REFERER', 'home'))