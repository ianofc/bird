from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from core.models import Bird, SavedPost

@login_required
def create_bird(request):
    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        image = request.FILES.get('image')
        video = request.FILES.get('video')
        
        # Validação básica: tem de ter conteúdo ou pelo menos uma mídia
        if content or image or video:
            post_type = 'text'
            if video:
                post_type = 'video'
            elif image:
                post_type = 'image'

            new_bird = Bird.objects.create(
                author=request.user,
                content=content,
                image=image,
                video=video,
                post_type=post_type
            )
            
            # SE FOR HTMX (Ajax): Retorna apenas o card do novo post
            if request.headers.get('HX-Request'):
                return render(request, 'components/bird_item.html', {'bird': new_bird, 'saved_post_ids': set(), 'single_mode': False})
                
            # Fallback para navegação normal
            messages.success(request, "Bird publicado!")
        else:
            if not request.headers.get('HX-Request'):
                messages.warning(request, "O post não pode estar vazio.")
            
    return redirect('home')

@login_required
def delete_bird(request, bird_id):
    bird = get_object_or_404(Bird, id=bird_id)
    
    if request.user == bird.author:
        bird.delete()
        # Se for HTMX, retorna vazio para remover o elemento da tela
        if request.headers.get('HX-Request'):
            return render(request, 'components/partials/empty.html') 
        messages.success(request, "Post removido.")
    
    return redirect('home')

@login_required
def bird_detail(request, bird_id):
    bird = get_object_or_404(Bird.objects.select_related('author', 'author__profile'), id=bird_id)
    saved_post_ids = set(SavedPost.objects.filter(user=request.user).values_list('post_id', flat=True))
    return render(request, 'pages/feed.html', {'birds': [bird], 'single_mode': True, 'saved_post_ids': saved_post_ids, 'stories': []})
