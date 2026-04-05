from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from core.models import Lyv, SavedPost

@login_required
def create_lyv(request):
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

            new_lyv = Lyv.objects.create(
                author=request.user,
                content=content,
                image=image,
                video=video,
                post_type=post_type
            )
            
            # SE FOR HTMX (Ajax): Retorna apenas o card do novo post
            if request.headers.get('HX-Request'):
                return render(request, 'components/lyv_item.html', {'lyv': new_lyv, 'saved_post_ids': set(), 'single_mode': False})
                
            # Fallback para navegação normal
            messages.success(request, "Lyv publicado!")
        else:
            if not request.headers.get('HX-Request'):
                messages.warning(request, "O post não pode estar vazio.")
            
    next_url = request.POST.get('next')
    if next_url:
        return redirect(next_url)
    return redirect('home')

@login_required
def delete_lyv(request, lyv_id):
    lyv = get_object_or_404(Lyv, id=lyv_id)
    
    if request.user == lyv.author:
        lyv.delete()
        # Se for HTMX, retorna vazio para remover o elemento da tela
        if request.headers.get('HX-Request'):
            return render(request, 'components/partials/empty.html') 
        messages.success(request, "Post removido.")
    
    return redirect('home')

@login_required
def lyv_detail(request, lyv_id):
    lyv = get_object_or_404(Lyv.objects.select_related('author', 'author__profile'), id=lyv_id)
    saved_post_ids = set(SavedPost.objects.filter(user=request.user).values_list('post_id', flat=True))
    return render(request, 'pages/feed.html', {'lyvs': [lyv], 'single_mode': True, 'saved_post_ids': saved_post_ids, 'stories': []})
