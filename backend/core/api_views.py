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

# Importação unificada de ABSOLUTAMENTE TODOS os modelos (incluindo Product e LiveStream)
from core.models import (
    Lyv, Comment, Connection, Profile, Room, Message,
    Notification, SavedPost, LiveStream, Product
)

User = get_user_model()


# ─────────────────────────────────────────
# HELPERS & SERIALIZADORES
# ─────────────────────────────────────────

def _serialize_user(user, request_user=None):
    profile = getattr(user, 'profile', None)
    avatar_url = profile.avatar.url if profile and profile.avatar else None
    cover_url = profile.cover_image.url if profile and profile.cover_image else None
    
    # Extraindo dados extras salvos no campo JSON 'interests'
    details = profile.interests if profile and isinstance(profile.interests, dict) else {}
    
    followers_count = Connection.objects.filter(target=user, status='active').count()
    following_count = Connection.objects.filter(follower=user, status='active').count()
    posts_count = Lyv.objects.filter(author=user, visibility='public').count()

    is_following = False
    if request_user and request_user.is_authenticated and request_user != user:
        is_following = Connection.objects.filter(follower=request_user, target=user, status='active').exists()

    initials = user.username[:2].upper()
    if user.first_name and user.last_name:
        initials = (user.first_name[0] + user.last_name[0]).upper()
    elif user.first_name:
        initials = user.first_name[:2].upper()

    return {
        'id': str(user.id),
        'username': user.username,
        'name': profile.full_name if profile and profile.full_name else user.get_full_name() or user.username,
        'handle': f'@{user.username}',
        'email': user.email,
        'initials': initials,
        'avatar': avatar_url,
        'cover': cover_url,
        'bio': profile.bio if profile else '',
        'location': details.get('location', ''),
        'work': details.get('work', ''),
        'education': details.get('education', ''),
        'relationship': details.get('relationship', ''),
        'isPremium': profile.is_verified if profile else False,
        'followers': followers_count,
        'following': following_count,
        'posts': posts_count,
        'is_following': is_following,
        'joinedDate': user.date_joined.strftime('%Y'),
    }


def _serialize_lyv(lyv, request_user=None):
    profile = getattr(lyv.author, 'profile', None)
    avatar_url = profile.avatar.url if profile and profile.avatar else None

    is_liked = False
    is_saved = False
    if request_user and request_user.is_authenticated:
        is_liked = lyv.likes.filter(id=request_user.id).exists()
        is_saved = SavedPost.objects.filter(user=request_user, post=lyv).exists()

    media = []
    if lyv.image: media.append({'id': f'img-{lyv.id}', 'type': 'image', 'url': lyv.image.url})
    if lyv.video: media.append({'id': f'vid-{lyv.id}', 'type': 'video', 'url': lyv.video.url})

    return {
        'id': str(lyv.id),
        'content': lyv.content,
        'author': _serialize_user(lyv.author),
        'media': media,
        'layoutPreference': 'single' if len(media) == 1 else ('grid' if len(media) > 1 else 'text'),
        'likes': lyv.likes.count(),
        'comments': lyv.comments.count(),
        'shares': 0,
        'createdAt': lyv.created_at.isoformat(),
        'liked': is_liked,
        'saved': is_saved,
        'post_type': lyv.post_type,
    }


def _serialize_message(msg):
    profile = getattr(msg.sender, 'profile', None)
    avatar_url = profile.avatar.url if profile and profile.avatar else None
    
    initials = msg.sender.username[:2].upper()
    if msg.sender.first_name:
        initials = msg.sender.first_name[:2].upper()

    return {
        'id': msg.id,
        'content': msg.content,
        'sender_id': str(msg.sender.id),
        'sender_username': msg.sender.username,
        'sender_name': profile.full_name if profile and profile.full_name else msg.sender.username,
        'sender_avatar': avatar_url,
        'sender_initials': initials,
        'timestamp': msg.created_at.isoformat(),
        'is_read': msg.is_read,
        'status': 'read' if msg.is_read else 'sent',
        'reply_to': msg.reply_to_id,
    }


def _create_notification_for_followers(user, text, ntype='post'):
    followers = Connection.objects.filter(target=user, status='active').values_list('follower_id', flat=True)
    notifs = [
        Notification(recipient_id=fid, text=f'@{user.username} {text}')
        for fid in followers
    ]
    if notifs:
        Notification.objects.bulk_create(notifs, ignore_conflicts=True)


# ─────────────────────────────────────────
# AUTH E PERFIL
# ─────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    data = request.data
    username = data.get('username', '').strip().lower()
    name = data.get('name', '').strip()
    password = data.get('password', '')
    email = data.get('email', '').strip()

    if not username or not password:
        return Response({'error': 'Usuário e senha são obrigatórios.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Este usuário já existe.'}, status=400)

    if email and User.objects.filter(email=email).exists():
        return Response({'error': 'Este e-mail já está em uso.'}, status=400)

    try:
        validate_password(password)
    except ValidationError as e:
        return Response({'error': e.messages[0]}, status=400)

    parts = name.split(' ', 1)
    first_name = parts[0] if parts else username
    last_name = parts[1] if len(parts) > 1 else ''

    user = User.objects.create_user(
        username=username, password=password, email=email,
        first_name=first_name, last_name=last_name,
    )

    Profile.objects.get_or_create(user=user, defaults={'full_name': name})
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': _serialize_user(user),
    }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_me(request):
    return Response(_serialize_user(request.user, request.user))


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def api_update_profile(request):
    user = request.user
    data = request.data
    profile, _ = Profile.objects.get_or_create(user=user)

    if 'name' in data:
        name = data['name']
        profile.full_name = name
        parts = name.split(' ', 1)
        user.first_name = parts[0]
        user.last_name = parts[1] if len(parts) > 1 else ''
        user.save(update_fields=['first_name', 'last_name'])

    if 'bio' in data: profile.bio = data['bio']
    
    # Salvando os dados estilo Facebook
    details = profile.interests if isinstance(profile.interests, dict) else {}
    if 'location' in data: details['location'] = data['location']
    if 'work' in data: details['work'] = data['work']
    if 'education' in data: details['education'] = data['education']
    if 'relationship' in data: details['relationship'] = data['relationship']
    profile.interests = details

    # Salvando Mídias (Avatar e Capa)
    if 'avatar' in request.FILES:
        profile.avatar = request.FILES['avatar']
    if 'cover' in request.FILES:
        profile.cover_image = request.FILES['cover']
        
    profile.save()
    return Response(_serialize_user(user, user))


# ─────────────────────────────────────────
# FEED E POSTS (LYVS)
# ─────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_feed(request):
    user = request.user
    mode = request.GET.get('mode', 'for_you')
    page = int(request.GET.get('page', 1))
    per_page = 15

    following_ids = list(Connection.objects.filter(
        follower=user, status='active'
    ).values_list('target_id', flat=True))

    if mode == 'following' and following_ids:
        lyvs = Lyv.objects.filter(
            author_id__in=following_ids, visibility='public'
        ).select_related('author', 'author__profile').prefetch_related('likes', 'comments')
    else:
        lyvs = Lyv.objects.filter(
            visibility='public'
        ).select_related('author', 'author__profile').prefetch_related('likes', 'comments')

    lyvs = lyvs.order_by('-created_at')

    total = lyvs.count()
    start = (page - 1) * per_page
    end = start + per_page
    page_lyvs = lyvs[start:end]

    return Response({
        'results': [_serialize_lyv(b, user) for b in page_lyvs],
        'count': total,
        'next': page + 1 if end < total else None,
        'has_next': end < total,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def api_create_lyv(request):
    content = request.data.get('content', '').strip()
    image = request.FILES.get('image')
    video = request.FILES.get('video')

    if not content and not image and not video:
        return Response({'error': 'Post não pode estar vazio.'}, status=400)

    post_type = 'text'
    if video: post_type = 'video'
    elif image: post_type = 'image'

    lyv = Lyv.objects.create(
        author=request.user,
        content=content,
        image=image,
        video=video,
        post_type=post_type,
        visibility='public',
    )

    _create_notification_for_followers(request.user, f'publicou um novo post: "{content[:50]}"', 'post')
    return Response(_serialize_lyv(lyv, request.user), status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_lyv_detail(request, lyv_id):
    try:
        lyv = Lyv.objects.select_related('author', 'author__profile').prefetch_related('likes').get(id=lyv_id)
    except Lyv.DoesNotExist:
        return Response({'error': 'Post não encontrado.'}, status=404)
    return Response(_serialize_lyv(lyv, request.user))


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_lyv(request, lyv_id):
    try:
        lyv = Lyv.objects.get(id=lyv_id, author=request.user)
    except Lyv.DoesNotExist:
        return Response({'error': 'Post não encontrado.'}, status=404)
    lyv.delete()
    return Response({'success': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_toggle_like(request, lyv_id):
    try:
        lyv = Lyv.objects.get(id=lyv_id)
    except Lyv.DoesNotExist:
        return Response({'error': 'Post não encontrado.'}, status=404)

    user = request.user
    if lyv.likes.filter(id=user.id).exists():
        lyv.likes.remove(user)
        liked = False
    else:
        lyv.likes.add(user)
        liked = True
        if lyv.author != user:
            Notification.objects.create(
                recipient=lyv.author,
                text=f'@{user.username} curtiu seu post.',
            )

    return Response({'liked': liked, 'likes': lyv.likes.count()})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_comments(request, lyv_id):
    try:
        lyv = Lyv.objects.get(id=lyv_id)
    except Lyv.DoesNotExist:
        return Response({'error': 'Post não encontrado.'}, status=404)

    if request.method == 'GET':
        comments = lyv.comments.select_related('author', 'author__profile').order_by('created_at')
        data = []
        for c in comments:
            profile = getattr(c.author, 'profile', None)
            avatar_url = profile.avatar.url if profile and profile.avatar else None
            initials = c.author.username[:2].upper()
            author_name = profile.full_name if profile and profile.full_name else c.author.username
            data.append({
                'id': c.id,
                'content': c.content,
                'author': {
                    'id': c.author.id,
                    'name': author_name,
                    'handle': c.author.username,
                    'avatar': avatar_url,
                    'initials': initials,
                },
                'createdAt': c.created_at.isoformat(),
            })
        return Response(data)

    content = request.data.get('content', '').strip()
    if not content:
        return Response({'error': 'Comentário não pode estar vazio.'}, status=400)

    comment = Comment.objects.create(lyv=lyv, author=request.user, content=content)

    if lyv.author != request.user:
        Notification.objects.create(recipient=lyv.author, text=f'@{request.user.username} comentou no seu post.')

    profile = getattr(request.user, 'profile', None)
    avatar_url = profile.avatar.url if profile and profile.avatar else None
    author_name = profile.full_name if profile and profile.full_name else request.user.username

    return Response({
        'id': comment.id,
        'content': comment.content,
        'author': {
            'id': request.user.id,
            'name': author_name,
            'handle': request.user.username,
            'avatar': avatar_url,
            'initials': request.user.username[:2].upper(),
        },
        'createdAt': comment.created_at.isoformat(),
    }, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_toggle_save(request, lyv_id):
    try:
        lyv = Lyv.objects.get(id=lyv_id)
    except Lyv.DoesNotExist:
        return Response({'error': 'Post não encontrado.'}, status=404)

    saved_obj = SavedPost.objects.filter(user=request.user, post=lyv).first()
    if saved_obj:
        saved_obj.delete()
        return Response({'saved': False})
    else:
        SavedPost.objects.create(user=request.user, post=lyv)
        return Response({'saved': True})


# ─────────────────────────────────────────
# FOLLOW & DADOS DE OUTROS PERFIS
# ─────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_toggle_follow(request, username):
    try:
        target = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado.'}, status=404)

    if target == request.user:
        return Response({'error': 'Você não pode seguir a si mesmo.'}, status=400)

    conn = Connection.objects.filter(follower=request.user, target=target).first()
    if conn:
        conn.delete()
        following = False
    else:
        Connection.objects.create(follower=request.user, target=target, status='active')
        following = True
        Notification.objects.create(recipient=target, text=f'@{request.user.username} começou a seguir você.')

    return Response({
        'following': following,
        'followers': Connection.objects.filter(target=target, status='active').count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_profile(request, username):
    try:
        user = User.objects.select_related('profile').get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado.'}, status=404)

    return Response(_serialize_user(user, request.user))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user_posts(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado.'}, status=404)

    lyvs = (Lyv.objects.filter(author=user, visibility='public')
             .select_related('author', 'author__profile')
             .prefetch_related('likes', 'comments')
             .order_by('-created_at')[:50])

    return Response([_serialize_lyv(b, request.user) for b in lyvs])


# ─────────────────────────────────────────
# SEARCH & TAS (TRENDING)
# ─────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_search(request):
    q = request.GET.get('q', '').strip()
    if not q: return Response({'users': [], 'posts': []})

    users = User.objects.filter(
        Q(username__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q)
    ).select_related('profile').exclude(id=request.user.id)[:10]

    posts = Lyv.objects.filter(
        Q(content__icontains=q), visibility='public'
    ).select_related('author', 'author__profile').prefetch_related('likes')[:15]

    return Response({
        'users': [_serialize_user(u, request.user) for u in users],
        'posts': [_serialize_lyv(b, request.user) for b in posts],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_suggested_users(request):
    following_ids = list(Connection.objects.filter(follower=request.user, status='active').values_list('target_id', flat=True))
    users = (User.objects.exclude(id__in=following_ids + [request.user.id]).select_related('profile').order_by('-date_joined')[:8])
    return Response([_serialize_user(u, request.user) for u in users])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_trending(request):
    import re
    HASHTAG_RE = re.compile(r'#([\w_]{2,40})', re.UNICODE)
    one_week_ago = timezone.now() - timedelta(days=7)
    recent_lyvs = Lyv.objects.filter(created_at__gte=one_week_ago, visibility='public').values_list('content', flat=True)

    trend_counter = {}
    for content in recent_lyvs:
        if not content: continue
        for tag in HASHTAG_RE.findall(content.lower()):
            trend_counter[tag] = trend_counter.get(tag, 0) + 1

    sorted_trends = sorted(trend_counter.items(), key=lambda x: x[1], reverse=True)[:10]

    result = []
    for tag, count in sorted_trends:
        result.append({'tag': f'#{tag}', 'count': count, 'posts': f'{count} posts'})

    if not result:
        result = [
            {'tag': '#LyvOS', 'count': 142, 'posts': '142 posts'},
            {'tag': '#Aurora', 'count': 89, 'posts': '89 posts'},
            {'tag': '#ZIOS', 'count': 67, 'posts': '67 posts'},
            {'tag': '#TAS', 'count': 54, 'posts': '54 posts'},
            {'tag': '#IA', 'count': 43, 'posts': '43 posts'},
        ]
    return Response(result)


# ─────────────────────────────────────────
# HEIMDALL (NOTIFICATIONS)
# ─────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_notifications(request):
    notifs = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
    data = []
    for n in notifs:
        data.append({
            'id': n.id,
            'text': n.text,
            'is_read': n.is_read,
            'createdAt': n.created_at.isoformat(),
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_mark_notifications_read(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'success': True})


# ─────────────────────────────────────────
# GAIA (MENSAGEIRO)
# ─────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_chat_rooms(request):
    user = request.user
    rooms = Room.objects.filter(participants=user).prefetch_related(
        'participants', 'participants__profile', 'messages'
    ).order_by('-created_at')

    data = []
    for room in rooms:
        other_participants = [p for p in room.participants.all() if p != user]
        last_msg = room.messages.order_by('-created_at').first()
        room_name = room.name if hasattr(room, 'name') and room.name else None
        room_avatar = None

        if room.type == 'dm' and other_participants:
            other = other_participants[0]
            profile = getattr(other, 'profile', None)
            room_name = profile.full_name if profile and profile.full_name else other.username
            if profile and profile.avatar:
                try: room_avatar = profile.avatar.url
                except Exception: pass

        unread = room.messages.filter(is_read=False).exclude(sender=user).count()

        data.append({
            'id': room.id,
            'type': room.type,
            'name': room_name or f'Sala {room.id}',
            'avatar': room_avatar,
            'last_message': last_msg.content if last_msg else '',
            'last_message_at': last_msg.created_at.isoformat() if last_msg else room.created_at.isoformat(),
            'unread_count': unread,
            'participants': [_serialize_user(p) for p in other_participants],
        })

    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_chat_messages(request, room_id):
    try:
        room = Room.objects.get(id=room_id, participants=request.user)
    except Room.DoesNotExist:
        return Response({'error': 'Sala não encontrada.'}, status=404)

    if request.method == 'GET':
        msgs = room.messages.select_related('sender', 'sender__profile').order_by('created_at')[:100]
        room.messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)
        return Response([_serialize_message(m) for m in msgs])

    content = request.data.get('content', '').strip()
    if not content: return Response({'error': 'Mensagem não pode estar vazia.'}, status=400)

    msg = Message.objects.create(room=room, sender=request.user, content=content)

    for participant in room.participants.exclude(id=request.user.id):
        Notification.objects.create(recipient=participant, text=f'@{request.user.username} te enviou uma mensagem no Gaia.')

    return Response(_serialize_message(msg), status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_start_dm(request):
    username = request.data.get('username', '').strip()
    try:
        target = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado.'}, status=404)

    if target == request.user:
        return Response({'error': 'Você não pode conversar consigo mesmo.'}, status=400)

    from django.db.models import Count as DbCount
    dm_room = (
        Room.objects.filter(type='dm', participants=request.user)
        .filter(participants=target)
        .annotate(participant_count=DbCount('participants'))
        .filter(participant_count=2)
        .first()
    )

    if not dm_room:
        dm_room = Room.objects.create(type='dm')
        dm_room.participants.add(request.user, target)

    return Response({'room_id': dm_room.id})


# ─────────────────────────────────────────
# STORIES & EXPLORE
# ─────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_stories(request):
    one_day_ago = timezone.now() - timedelta(days=1)
    following_ids = list(Connection.objects.filter(follower=request.user, status='active').values_list('target_id', flat=True))
    story_users_ids = list(set(following_ids + [request.user.id]))
    users_with_recent = (
        User.objects.filter(id__in=story_users_ids, lyvs__created_at__gte=one_day_ago, lyvs__visibility='public')
        .select_related('profile').distinct()[:10]
    )

    data = []
    for u in users_with_recent:
        profile = getattr(u, 'profile', None)
        avatar_url = profile.avatar.url if profile and profile.avatar else None
        name = profile.full_name if profile and profile.full_name else u.username
        data.append({
            'id': u.id, 'name': name, 'username': u.username,
            'avatar': avatar_url, 'initials': u.username[:2].upper(),
            'is_me': u.id == request.user.id,
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_explore_posts(request):
    category = request.GET.get('category', '')
    lyvs = (Lyv.objects.filter(visibility='public')
             .select_related('author', 'author__profile')
             .prefetch_related('likes', 'comments')
             .order_by('-created_at')[:60])

    if category and category != 'Para Você':
        lyvs = lyvs.filter(content__icontains=category)

    return Response([_serialize_lyv(b, request.user) for b in lyvs])

# ─────────────────────────────────────────
# CANAIS (LIVES E STREAMING)
# ─────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_active_streams(request):
    """Retorna todas as lives ativas no momento"""
    streams = LiveStream.objects.filter(is_active=True).select_related('host', 'host__profile').prefetch_related('guests', 'guests__profile').order_by('-viewers_count')
    
    data = []
    for stream in streams:
        host_profile = getattr(stream.host, 'profile', None)
        host_avatar = host_profile.avatar.url if host_profile and host_profile.avatar else None
        
        # Simula as URLs de vídeo para as Lives (Fallback de demo)
        default_video = "https://assets.mixkit.co/videos/preview/mixkit-woman-and-her-pet-cat-43286-large.mp4"
        
        participants = [{
            'id': str(stream.host.id),
            'name': host_profile.full_name if host_profile and host_profile.full_name else stream.host.username,
            'avatar': host_avatar,
            'videoUrl': default_video,
            'pkPoints': 12400 if stream.stream_type == 'pk' else None
        }]
        
        for guest in stream.guests.all():
            guest_profile = getattr(guest, 'profile', None)
            participants.append({
                'id': str(guest.id),
                'name': guest_profile.full_name if guest_profile and guest_profile.full_name else guest.username,
                'avatar': guest_profile.avatar.url if guest_profile and guest_profile.avatar else None,
                'videoUrl': "https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-neon-lit-room-4131-large.mp4",
                'pkPoints': 9800 if stream.stream_type == 'pk' else None
            })
            
        data.append({
            'id': stream.id,
            'type': stream.stream_type,
            'creator': participants[0]['name'],
            'viewers': f"{stream.viewers_count / 1000:.1f}k" if stream.viewers_count >= 1000 else str(stream.viewers_count),
            'img': stream.cover_image.url if stream.cover_image else "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
            'participants': participants
        })
        
    return Response(data)

# ─────────────────────────────────────────
# MARKETPLACE (LOJA)
# ─────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def api_marketplace(request):
    if request.method == 'GET':
        category = request.GET.get('category', '')
        query = request.GET.get('q', '')
        
        products = Product.objects.filter(is_active=True).select_related('seller', 'seller__profile').order_by('-created_at')
        
        if category and category != 'Todos':
            products = products.filter(category__icontains=category)
        if query:
            products = products.filter(title__icontains=query)
            
        data = []
        for p in products[:50]:
            profile = getattr(p.seller, 'profile', None)
            data.append({
                'id': p.id,
                'title': p.title,
                'description': p.description,
                'price': float(p.price),
                'category': p.category,
                'location': p.location,
                'image': p.image.url if p.image else 'https://placehold.co/600x600/1E293B/cyan?text=Sem+Foto',
                'seller': {
                    'name': profile.full_name if profile and profile.full_name else p.seller.username,
                    'avatar': profile.avatar.url if profile and profile.avatar else None,
                },
                'created_at': p.created_at.isoformat()
            })
        return Response(data)

    # POST: Criar novo produto
    title = request.data.get('title', '')
    price = request.data.get('price', 0)
    category = request.data.get('category', 'Geral')
    location = request.data.get('location', '')
    description = request.data.get('description', '')
    image = request.FILES.get('image')

    if not title or not price:
        return Response({'error': 'Título e preço são obrigatórios.'}, status=400)

    product = Product.objects.create(
        seller=request.user, title=title, price=price, 
        category=category, location=location, description=description, image=image
    )
    
    return Response({'success': True, 'id': product.id}, status=201)