from django.shortcuts import render
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.decorators import login_required
from ..models import Bird, Connection

# ========================================================
# 🎨 DADOS DE DEMONSTRAÇÃO (MOCKS)
# ========================================================
# Estes dados aparecem apenas se você não tiver posts reais no banco.
# Ajuda a visualizar o layout durante o desenvolvimento.

def get_placeholder_data(now):
    placeholder_stories = [
        {
            'author': {
                'username': 'ian_dev', 
                'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=1'}}
            }, 
            'is_active': True
        },
        {
            'author': {
                'username': 'niocortex', 
                'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=2'}}
            }, 
            'is_active': True
        },
    ]

    placeholder_birds = [
        {
            'id': 999, 
            'author': {'username': 'niocortex', 'full_name': 'Nio Cortex', 'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=2'}, 'is_verified': True}},
            'content': 'O layout Frankenstein do Bird está ganhando vida! 🚀 Misturando a fluidez do Instagram com a agilidade do X.',
            'created_at': now,
            'like_count': 124,
            'image': {'url': 'https://picsum.photos/seed/picsum/600/400'},
            'post_type': 'image',
            'likes': [], # Mock lista vazia
        },
        {
            'id': 998,
            'author': {'username': 'ian_dev', 'full_name': 'Ian Santos', 'profile': {'avatar': {'url': 'https://i.pravatar.cc/150?u=1'}, 'is_verified': False}},
            'content': 'A barra lateral Glassmorphism ficou sensacional. O próximo passo é integrar o serviço de IA na 8003.',
            'created_at': now - timedelta(minutes=10),
            'like_count': 89,
            'image': None,
            'post_type': 'text',
            'likes': [],
        }
    ]
    return placeholder_stories, placeholder_birds

# ========================================================
# 🏠 FEED PRINCIPAL
# ========================================================

@login_required
def index(request):
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
    following_ids = list(Connection.objects.filter(
        follower=user, 
        status='active'
    ).values_list('target_id', flat=True))

    # Inclui o próprio usuário na lista para ver seus próprios posts
    following_ids.append(user.id)

    # 2. Busca Posts (Query Otimizada)
    # select_related: Traz dados do Autor e Perfil num único JOIN (evita queries extras)
    # prefetch_related: Traz os likes de forma eficiente
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
    real_stories = Bird.objects.filter(
        author__id__in=following_ids,
        post_type='story',
        created_at__gte=now - timedelta(hours=24)
    ).select_related(
        'author', 'author__profile'
    ).order_by('-created_at')

    # 4. Montagem do Contexto
    # Se existirem posts reais, usamos eles. Senão, usamos os Mocks.
    
    context = {}

    if real_birds.exists():
        context['birds'] = real_birds
    else:
        # Se preferir que o feed fique vazio quando não tem post, remova esta linha:
        _, context['birds'] = get_placeholder_data(now) 
        # Ou deixe uma lista vazia para ver a mensagem "Tudo quieto por aqui":
        # context['birds'] = []

    if real_stories.exists():
        context['stories'] = real_stories
    else:
        context['stories'], _ = get_placeholder_data(now)

    return render(request, 'pages/feed.html', context)