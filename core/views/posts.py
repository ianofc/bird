from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from core.models import Bird

@login_required
def create_bird(request):
    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        image = request.FILES.get('image')
        video = request.FILES.get('video')
        
        if content or image or video:
            new_bird = Bird.objects.create(
                author=request.user,
                content=content,
                image=image,
                video=video,
                post_type='image' if image else 'video' if video else 'text'
            )
            
            # Se for HTMX, retorna apenas o card do novo post para inserir na feed
            if request.headers.get('HX-Request'):
                return render(request, 'components/bird_item.html', {'bird': new_bird})
                
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
        if request.headers.get('HX-Request'):
            return render(request, 'components/partials/bird_deleted.html')
        messages.success(request, "Post removido.")
    return redirect('home')

@login_required
def bird_detail(request, bird_id):
    """View para visualizar um único post em detalhe"""
    bird = get_object_or_404(Bird, id=bird_id)
    return render(request, 'pages/feed.html', {'birds': [bird], 'single_mode': True})