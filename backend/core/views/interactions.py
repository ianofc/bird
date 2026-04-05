from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.urls import reverse


User = get_user_model()

try:
    from ..models import Lyv, Connection, Notification, Profile, Comment
    try:
        from ..models import SavedPost
    except ImportError:
        SavedPost = None
except ImportError:
    Lyv = Connection = Notification = Profile = Comment = None


def _create_notification(recipient, text):
    if Notification and recipient and text:
        Notification.objects.create(recipient=recipient, text=text)


def _comment_relation_kwargs(lyv):
    # Compatibilidade defensiva: alguns ambientes antigos podem usar `post` em vez de `lyv`.
    comment_fields = {f.name for f in Comment._meta.get_fields()} if Comment else set()
    if 'lyv' in comment_fields:
        return {'lyv': lyv}
    if 'post' in comment_fields:
        return {'post': lyv}
    return {'lyv': lyv}


def _comment_target_author(comment):
    target = getattr(comment, 'lyv', None) or getattr(comment, 'post', None)
    return getattr(target, 'author', None)


@login_required
def toggle_like(request, lyv_id):
    if not Lyv:
        return HttpResponse("Erro: Modelos não carregados.", status=500)

    lyv = get_object_or_404(Lyv, id=lyv_id)
    user = request.user

    if lyv.likes.filter(id=user.id).exists():
        lyv.likes.remove(user)
    else:
        lyv.likes.add(user)
        if lyv.author != user:
            _create_notification(lyv.author, f"@{user.username} curtiu sua publicação.")

    if request.headers.get('HX-Request'):
        icon_class = 'fas text-rose-500' if lyv.likes.filter(id=user.id).exists() else 'far text-gray-500 group-hover:text-rose-500'
        likes = lyv.likes.count()
        count_html = f'<span class="text-sm font-medium text-gray-600">{likes}</span>' if likes > 0 else ''
        like_url = reverse('toggle_like', args=[lyv.id])
        return HttpResponse(
            f'''<button hx-post="{like_url}" hx-swap="outerHTML" class="flex items-center gap-2 group transition-colors">
'''
            f'''<i class="{icon_class} fa-heart text-xl"></i>{count_html}</button>'''
        )

    return redirect(request.META.get('HTTP_REFERER', 'home'))


@login_required
def add_comment(request, lyv_id):
    if request.method == 'POST':
        lyv = get_object_or_404(Lyv, id=lyv_id)
        content = request.POST.get('content', '').strip()

        if content and Comment:
            Comment.objects.create(author=request.user, content=content, **_comment_relation_kwargs(lyv))
            if lyv.author != request.user:
                _create_notification(lyv.author, f"@{request.user.username} comentou no seu post.")

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
def toggle_save(request, lyv_id):
    lyv = get_object_or_404(Lyv, id=lyv_id)

    if SavedPost:
        saved, created = SavedPost.objects.get_or_create(user=request.user, post=lyv)
        if not created:
            saved.delete()
            messages.info(request, "Item removido dos salvos.")
        else:
            messages.success(request, "Item salvo!")

    next_url = request.POST.get('next') or request.GET.get('next')
    if next_url:
        return redirect(next_url)
    return redirect(request.META.get('HTTP_REFERER', 'home'))


@login_required
def share_post(request, lyv_id):
    lyv = get_object_or_404(Lyv, id=lyv_id)
    share_url = request.build_absolute_uri(reverse('lyv_detail', args=[lyv.id]))
    messages.success(request, f"Link da publicação: {share_url}")
    next_url = request.POST.get('next') or request.GET.get('next')
    if next_url:
        return redirect(next_url)
    return redirect(request.META.get('HTTP_REFERER', 'home'))
