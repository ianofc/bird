from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from ..models import Bird

@login_required
@require_http_methods(["POST"])
def create_bird(request):
    content = request.POST.get('content')
    image = request.FILES.get('image')
    
    if content:
        bird = Bird.objects.create(
            author=request.user,
            content=content,
            image=image,
            post_type='text' if not image else 'image'
        )
        # Retorna apenas o HTML do novo post para o HTMX injetar no feed
        return render(request, 'components/bird_item.html', {'bird': bird})
    
    return render(request, 'components/empty.html') # Retorno vazio se der erro