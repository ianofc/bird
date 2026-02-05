from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from ..models import Bird

@login_required
def create_bird(request):
    if request.method == 'POST':
        content = request.POST.get('content')
        image = request.FILES.get('image')
        video = request.FILES.get('video')

        # Validação básica
        if not content and not image and not video:
            messages.error(request, 'Sua publicação não pode estar vazia.')
            return redirect('create_bird')

        # Cria o objeto Bird
        bird = Bird(author=request.user)
        bird.content = content

        # Lógica de Tipo de Post
        if video:
            bird.video = video
            bird.post_type = 'video'
            bird.is_processing = False 
        elif image:
            bird.image = image
            bird.post_type = 'image'
        else:
            bird.post_type = 'text'

        bird.save()
        messages.success(request, 'Publicado com sucesso!')
        return redirect('home')

    return render(request, 'pages/create_bird.html')

@login_required
def bird_detail(request, bird_id):
    bird = get_object_or_404(Bird, id=bird_id)
    return render(request, 'pages/bird_detail.html', {'bird': bird})

@login_required
def delete_bird(request, bird_id):
    bird = get_object_or_404(Bird, id=bird_id)
    if request.user == bird.author:
        bird.delete()
        messages.success(request, 'Publicação removida.')
    return redirect('home')
