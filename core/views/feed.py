from django.shortcuts import render
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.decorators import login_required
from ..models import Bird, Connection

# ========================================================
# 🎨 DADOS DE DEMONSTRAÇÃO (MOCKS)
# ========================================================
def get_placeholder_data(now):
    """Gera dados falsos para preencher a tela quando não há posts reais."""
    
    placeholder_stories = [
        {
            'author': {
                'username': 'ian_dev', 
                'first_name': 'Ian',
                'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=1'}}
            }, 
            'is_active': True
        },
        {
            'author': {
                'username': 'niocortex', 
                'first_name': 'Nio',
                'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=2'}}
            }, 
            'is_active': True
        },
    ]

    placeholder_birds = [
        {
            'id': 999, 
            'author': {
                'username': 'niocortex', 
                'first_name': 'Nio Cortex', 
                'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=2'}, 'is_verified': True}
            },
            'content': 'O layout Frankenstein do Bird está ganhando vida! 🚀 Misturando a fluidez do Instagram com a agilidade do X.',
            'created_at': now,
            'likes': type('obj', (object,), {'count': lambda: 124}), # Mock count
            'image': {'url': 'https://picsum.photos/seed/picsum/600/400'},
            'post_type': 'image',
            'is_liked_by_user': False,
        },
        {
            'id': 998, 
            'author': {
                'username': 'ian_dev', 
                'first_name': 'Ian Santos', 
                'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=1'}, 'is_verified': False}
            },
            'content': 'A barra lateral Glassmorphism ficou sensacional. O próximo passo é integrar o serviço de IA na 8003.',
            'created_at': now - timedelta(minutes=10),
            'likes': type('obj', (object,), {'count': lambda: 89}),
            'image': None,
            'post_type': 'text',
            'is_liked_by_user': True,
        }
    ]
    return placeholder_stories, placeholder_birds


# ========================================================
# 🏠 FEED PRINCIPAL
# ========================================================

@login_required
def home_view(request):
    """
    Controlador da Home Page (Feed Principal).
    1. Verifica autenticação.
    2. Busca posts de quem o usuário segue + os dele.
    3. Se não houver nada, mostra mocks para teste visual.
    """
    user = request.user
    now = timezone.now()

    # 1. Recupera IDs de quem o usuário segue
    # values_list('target_id') é muito mais rápido que trazer os objetos inteiros
    following_ids = []
    if Connection:
        following_ids = list(Connection.objects.filter(
            follower=user, 
            status='active'
        ).values_list('target_id', flat=True))

    # Inclui o próprio usuário na lista para ver seus próprios posts
    following_ids.append(user.id)

    # 2. Busca Posts (Query Otimizada)
    real_birds = Bird.objects.none()
    if Bird:
        real_birds = Bird.objects.filter(
            author__id__in=following_ids
        ).exclude(
            post_type='story' 
        ).select_related(
            'author', 'author__profile'
        ).prefetch_related(
            'likes'
        ).order_by('-created_at')

    # 3. Busca Stories (Últimas 24h)
    real_stories = Bird.objects.none()
    if Bird:
        real_stories = Bird.objects.filter(
            author__id__in=following_ids,
            post_type='story',
            created_at__gte=now - timedelta(hours=24)
        ).select_related(
            'author', 'author__profile'
        ).order_by('-created_at')

    # 4. Montagem do Contexto
    context = {}
    mock_stories, mock_birds = get_placeholder_data(now)

    if real_birds.exists():
        context['birds'] = real_birds
    else:
        # Fallback: Se não tem post nenhum, mostra o mock
        context['birds'] = mock_birds

    if real_stories.exists():
        context['stories'] = real_stories
    else:
        # Fallback: Se não tem story, mostra mock
        context['stories'] = mock_stories

    return render(request, 'pages/feed.html', context)