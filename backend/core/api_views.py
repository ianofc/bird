import json
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from core.models import (
    Bird, Comment, Connection, Profile, Room, Message,
    Notification, SavedPost
)

User = get_user_model()

# ==========================================
# SERIALIZADORES MANUAIS OTIMIZADOS
# ==========================================
def _serialize_user(user, request_user=None):
    profile = getattr(user, 'profile', None)
    avatar_url = profile.avatar.url if profile and profile.avatar else None
    
    followers_count = Connection.objects.filter(target=user, status='active').count()
    following_count = Connection.objects.filter(follower=user, status='active').count()
    posts_count = Bird.objects.filter(author=user, visibility='public').count()

    is_following = False
    if request_user and request_user.is_authenticated and request_user != user:
        is_following = Connection.objects.filter(follower=request_user, target=user, status='active').exists()

    initials = user.username[:2].upper()
    if user.first_name and user.last_name:
        initials = (user.first_name[0] + user.last_name[0]).upper()

    return {
        'id': str(user.id),
        'username': user.username,
        'name': profile.full_name if profile and profile.full_name else user.get_full_name() or user.username,
        'handle': f'@{user.username}',
        'email': user.email,
        'initials': initials,
        'avatar': avatar_url,
        'bio': profile.bio if profile else '',
        'isPremium': profile.is_verified if profile else False,
        'followers': followers_count,
        'following': following_count,
        'posts': posts_count,
        'is_following': is_following,
    }

def _serialize_bird(bird, request_user=None):
    profile = getattr(bird.author, 'profile', None)
    avatar_url = profile.avatar.url if profile and profile.avatar else None

    is_liked = False
    is_saved = False
    if request_user and request_user.is_authenticated:
        is_liked = bird.likes.filter(id=request_user.id).exists()
        is_saved = SavedPost.objects.filter(user=request_user, post=bird).exists()

    media = []
    if bird.image: media.append({'id': f'img-{bird.id}', 'type': 'image', 'url': bird.image.url})
    if bird.video: media.append({'id': f'vid-{bird.id}', 'type': 'video', 'url': bird.video.url})

    return {
        'id': str(bird.id),
        'content': bird.content,
        'author': _serialize_user(bird.author),
        'media': media,
        'layoutPreference': 'single' if len(media) == 1 else ('grid' if len(media) > 1 else 'text'),
        'likes': bird.likes.count(),
        'comments': bird.comments.count(),
        'shares': 0,
        'createdAt': bird.created_at.isoformat(),
        'liked': is_liked,
        'saved': is_saved,
        'post_type': bird.post_type,
    }

# ==========================================
# ROTAS DA API
# ==========================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_me(request):
    """Retorna os dados do usuário logado baseado no Token"""
    return Response(_serialize_user(request.user, request.user))

@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    """Registra uma nova conta na rede"""
    data = request.data
    username = data.get('username', '').strip().lower()
    name = data.get('name', '').strip()
    password = data.get('password', '')
    email = data.get('email', '').strip()

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Usuário já existe.'}, status=400)

    user = User.objects.create_user(username=username, password=password, email=email, first_name=name.split(' ')[0])
    Profile.objects.get_or_create(user=user, defaults={'full_name': name})
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({'token': token.key, 'user': _serialize_user(user)}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_feed(request):
    """Retorna os posts do banco de dados, mais recentes primeiro"""
    birds = Bird.objects.filter(visibility='public').select_related('author', 'author__profile').prefetch_related('likes', 'comments').order_by('-created_at')[:30]
    return Response({'results': [_serialize_bird(b, request.user) for b in birds]})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def api_create_bird(request):
    """Cria um novo post no banco de dados"""
    content = request.data.get('content', '').strip()
    image = request.FILES.get('image')
    video = request.FILES.get('video')

    if not content and not image and not video:
        return Response({'error': 'Post não pode estar vazio.'}, status=400)

    post_type = 'video' if video else ('image' if image else 'text')
    bird = Bird.objects.create(author=request.user, content=content, image=image, video=video, post_type=post_type, visibility='public')
    
    return Response(_serialize_bird(bird, request.user), status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_toggle_like(request, bird_id):
    """Curte ou descurte um post"""
    try: bird = Bird.objects.get(id=bird_id)
    except Bird.DoesNotExist: return Response({'error': 'Post não encontrado.'}, status=404)

    if bird.likes.filter(id=request.user.id).exists():
        bird.likes.remove(request.user)
        liked = False
    else:
        bird.likes.add(request.user)
        liked = True
        
    return Response({'liked': liked, 'likes': bird.likes.count()})