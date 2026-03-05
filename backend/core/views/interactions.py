from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.urls import reverse


User = get_user_model()

try:
    from ..models import Bird, Connection, Notification, Profile, Comment
    try:
        from ..models import SavedPost
    except ImportError:
        SavedPost = None
except ImportError:
    Bird = Connection = Notification = Profile = Comment = None


def _create_notification(recipient, text):
    if Notification and recipient and text:
        Notification.objects.create(recipient=recipient, text=text)


def _comment_relation_kwargs(bird):
    # Compatibilidade defensiva: alguns ambientes antigos podem usar `post` em vez de `bird`.
    comment_fields = {f.name for f in Comment._meta.get_fields()} if Comment else set()
    if 'bird' in comment_fields:
        return {'bird': bird}
    if 'post' in comment_fields:
        return {'post': bird}
    return {'bird': bird}


def _comment_target_author(comment):
    target = getattr(comment, 'bird', None) or getattr(comment, 'post', None)
    return getattr(target, 'author', None)


@login_required
def toggle_like(request, bird_id):
    if not Bird:
        return HttpResponse("Erro: Modelos não carregados.", status=500)

    bird = get_object_or_404(Bird, id=bird_id)
    user = request.user

    if bird.likes.filter(id=user.id).exists():
        bird.likes.remove(user)
    else:
        bird.likes.add(user)
        if bird.author != user:
            _create_notification(bird.author, f"@{user.username} curtiu sua publicação.")

    if request.headers.get('HX-Request'):
        icon_class = 'fas text-rose-500' if bird.likes.filter(id=user.id).exists() else 'far text-gray-500 group-hover:text-rose-500'
        likes = bird.likes.count()
        count_html = f'<span class="text-sm font-medium text-gray-600">{likes}</span>' if likes > 0 else ''
        like_url = reverse('toggle_like', args=[bird.id])
        return HttpResponse(
            f'''<button hx-post="{like_url}" hx-swap="outerHTML" class="flex items-center gap-2 group transition-colors">
'''
            f'''<i class="{icon_class} fa-heart text-xl"></i>{count_html}</button>'''
        )

    return redirect(request.META.get('HTTP_REFERER', 'home'))


@login_required
def add_comment(request, bird_id):
    if request.method == 'POST':
        bird = get_object_or_404(Bird, id=bird_id)
        content = request.POST.get('content', '').strip()

        if content and Comment:
            Comment.objects.create(author=request.user, content=content, **_comment_relation_kwargs(bird))
            if bird.author != request.user:
                _create_notification(bird.author, f"@{request.user.username} comentou no seu post.")

    return redirect(request.META.get('HTTP_REFERER', 'home'))


@login_required
def delete_comment(request, comment_id):
    if Comment:
        comment = get_object_or_404(Comment, id=comment_id)
        if request.user == comment.author or request.user == _comment_target_author(comment):
            comment.delete()
            messages.success(request, "Comentário removido.")

    return redirect(request.META.get('HTTP_REFERER', 'home'))


@login_required
def toggle_follow(request, username):
    target_user = get_object_or_404(User, username=username)

    if target_user == request.user:
        return redirect('profile_detail', username=username)

    if Connection:
        conn = Connection.objects.filter(follower=request.user, target=target_user).first()

        if conn and conn.status == 'active':
            conn.delete()
            messages.info(request, f"Você deixou de seguir @{target_user.username}.")
        else:
            if conn:
                conn.status = 'active'
                conn.save(update_fields=['status'])
            else:
                Connection.objects.create(follower=request.user, target=target_user, status='active')
            _create_notification(target_user, f"@{request.user.username} começou a seguir você.")
            messages.success(request, f"Agora você segue @{target_user.username}.")

    next_url = request.POST.get('next') or request.GET.get('next')
    if next_url:
        return redirect(next_url)
    return redirect('profile_detail', username=username)


@login_required
def block_user(request, username):
    target_user = get_object_or_404(User, username=username)

    if Connection:
        block_conn, created = Connection.objects.get_or_create(follower=request.user, target=target_user)

        if not created and block_conn.status == 'blocked':
            block_conn.delete()
            messages.success(request, f"Usuário @{username} desbloqueado.")
        else:
            block_conn.status = 'blocked'
            block_conn.save()
            Connection.objects.filter(follower=target_user, target=request.user).delete()
            messages.warning(request, f"Você bloqueou @{username}.")

    return redirect('home')


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
    messages.success(request, "Link copiado para a área de transferência! (Simulado)")
    return redirect(request.META.get('HTTP_REFERER', 'home'))
