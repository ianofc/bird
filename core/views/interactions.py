from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.contrib import messages
from django.contrib.auth import get_user_model

# Importa os modelos. Se der erro de importação circular, ajustaremos depois.
try:
    from ..models import Post, Comentario, Like, Follow, Block, SavedPost
except ImportError:
    # Fallback apenas para evitar quebra total se models estiver com erro
    Post = Comentario = Like = Follow = Block = SavedPost = None

User = get_user_model()

@login_required
def toggle_like(request, post_id):
    if not str(post_id).isdigit():
        return HttpResponse(status=400)

    post = get_object_or_404(Post, id=post_id)
    
    like_qs = Like.objects.filter(user=request.user, post=post)
    if like_qs.exists():
        like_qs.delete()
        user_liked = False
    else:
        Like.objects.create(user=request.user, post=post)
        user_liked = True

    # Para HTMX
    context = {
        'post': post,
        'user_liked': user_liked
    }
    return render(request, 'social/components/partials/like_button.html', context)

@login_required
def add_comment(request, post_id):
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)
        conteudo = request.POST.get('conteudo')
        if conteudo:
            Comentario.objects.create(user=request.user, post=post, conteudo=conteudo)
    return redirect(request.META.get('HTTP_REFERER', 'bird_social:home'))

@login_required
def delete_comment(request, comment_id):
    comment = get_object_or_404(Comentario, id=comment_id)
    # Só o dono do comentário ou do post pode deletar
    if request.user == comment.user or request.user == comment.post.autor:
        comment.delete()
    return redirect(request.META.get('HTTP_REFERER', 'bird_social:home'))

@login_required
def reply_comment(request, comment_id):
    # Lógica para responder comentário (nested)
    parent_comment = get_object_or_404(Comentario, id=comment_id)
    if request.method == 'POST':
        conteudo = request.POST.get('conteudo')
        if conteudo:
            Comentario.objects.create(
                user=request.user, 
                post=parent_comment.post, 
                conteudo=conteudo,
                parent=parent_comment
            )
    return redirect(request.META.get('HTTP_REFERER', 'bird_social:home'))

@login_required
def toggle_save(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    saved_qs = SavedPost.objects.filter(user=request.user, post=post)
    
    if saved_qs.exists():
        saved_qs.delete()
        is_saved = False
    else:
        SavedPost.objects.create(user=request.user, post=post)
        is_saved = True
        
    return redirect(request.META.get('HTTP_REFERER', 'bird_social:home'))

@login_required
def share_post(request, post_id):
    # Por enquanto, apenas um placeholder para a função de compartilhar
    messages.success(request, "Post compartilhado no seu feed!")
    return redirect(request.META.get('HTTP_REFERER', 'bird_social:home'))

@login_required
def report_content(request, post_id):
    # Lógica de Compliance
    messages.info(request, "Obrigado por reportar. Nossa equipe analisará o conteúdo.")
    return redirect(request.META.get('HTTP_REFERER', 'bird_social:home'))

@login_required
def toggle_follow(request, username):
    user_to_follow = get_object_or_404(User, username=username)
    
    if user_to_follow == request.user:
        return HttpResponse(status=400) # Não pode seguir a si mesmo

    follow_qs = Follow.objects.filter(user_from=request.user, user_to=user_to_follow)
    
    if follow_qs.exists():
        follow_qs.delete()
    else:
        Follow.objects.create(user_from=request.user, user_to=user_to_follow)
        
    return redirect('bird_social:profile_detail', username=username)

@login_required
def block_user(request, username):
    user_to_block = get_object_or_404(User, username=username)
    
    if Block.objects.filter(blocker=request.user, blocked=user_to_block).exists():
        Block.objects.filter(blocker=request.user, blocked=user_to_block).delete()
        messages.success(request, f"Você desbloqueou {username}")
    else:
        Block.objects.create(blocker=request.user, blocked=user_to_block)
        # Remove follow se existir
        Follow.objects.filter(user_from=request.user, user_to=user_to_block).delete()
        Follow.objects.filter(user_from=user_to_block, user_to=request.user).delete()
        messages.warning(request, f"Você bloqueou {username}")
        
    return redirect('bird_social:home')