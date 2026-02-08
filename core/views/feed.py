import requests
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from core.models import Bird

@login_required
def home_view(request):
    """
    Feed Híbrida (Algorítmica + Cronológica).
    Substitui a antiga feed_view/home_view.
    """
    user = request.user
    
    # URL interna do Docker para o motor de recomendação
    recommend_url = f"http://tas-engine:8000/api/v1/recommend/?user_id={user.id}"
    
    feed_birds = []
    
    try:
        # Tenta buscar a lista de IDs recomendados pela IA
        response = requests.get(recommend_url, timeout=1.5)
        
        if response.status_code == 200:
            data = response.json()
            bird_ids = data.get('recommendations', [])
            
            if bird_ids:
                # Busca os objetos mantendo a ordem da IA
                birds_query = Bird.objects.filter(id__in=bird_ids).select_related('author', 'author__profile')
                birds_dict = {b.id: b for b in birds_query}
                feed_birds = [birds_dict[bid] for bid in bird_ids if bid in birds_dict]
            
    except Exception:
        # Falha silenciosa se a IA estiver offline ou der erro
        pass

    # Se a IA não retornou nada, usa o fallback cronológico (SQL padrão)
    if not feed_birds:
        feed_birds = Bird.objects.filter(
            visibility='public'
        ).select_related('author', 'author__profile').order_by('-created_at')[:50]

    return render(request, 'pages/feed.html', {'birds': feed_birds})