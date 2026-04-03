from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Count, Max
from django.shortcuts import get_object_or_404, redirect, render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Message, Room


def _build_room_preview(room: Room, current_user):
    """Normaliza os dados da sala para render estilo mensageiro (Telegram-like)."""
    room.last_message_obj = room.messages.select_related('sender').order_by('-created_at').first()
    room.unread_count = room.messages.exclude(sender=current_user).filter(is_read=False).count()

    if room.is_group:
        room.chat_name = room.name or "Grupo"
        room.chat_avatar = room.icon.url if room.icon else None
        room.chat_handle = f"{room.participants.count()} membros"
        room.is_online = False
        room.room_type_label = dict(Room.ROOM_TYPES).get(room.type, "Grupo")
        return room

    other = room.participants.exclude(id=current_user.id).select_related('profile').first()
    if not other:
        return None

    room.chat_name = (other.profile.full_name or other.username).strip()
    room.chat_avatar = other.profile.avatar.url if getattr(other, 'profile', None) and other.profile.avatar else None
    room.chat_handle = f"@{other.username}"
    room.target_username = other.username
    room.is_online = True  # placeholder até presença distribuída
    room.room_type_label = "Mensagem direta"
    return room


@login_required
def chat_index(request):
    user = request.user

    rooms_qs = (
        user.chat_rooms
        .prefetch_related('participants__profile')
        .annotate(last_msg_time=Max('messages__created_at'))
        .order_by('-last_msg_time', '-updated_at')
    )

    rooms = []
    for room in rooms_qs:
        preview = _build_room_preview(room, user)
        if preview:
            rooms.append(preview)

    active_room = None
    active_messages = []

    room_id = request.GET.get('room')
    if room_id:
        active_room = get_object_or_404(user.chat_rooms, id=room_id)
    elif rooms:
        active_room = rooms[0]

    if active_room:
        active_messages = (
            active_room.messages
            .select_related('sender', 'sender__profile', 'reply_to')
            .order_by('created_at')[:120]
        )
        active_room.messages.exclude(sender=user).filter(is_read=False).update(is_read=True)

    return render(request, 'gorjeio/index_gorjeio.html', {
        'rooms': rooms,
        'active_room': active_room,
        'messages': active_messages,
    })


@login_required
def start_dm(request, username):
    target_user = get_object_or_404(User, username=username)
    if target_user == request.user:
        return redirect('chat_index')

    dm_room = (
        request.user.chat_rooms
        .filter(type='dm', participants=target_user)
        .annotate(participant_count=Count('participants'))
        .filter(participant_count=2)
        .first()
    )

    if not dm_room:
        dm_room = Room.objects.create(type='dm')
        dm_room.participants.add(request.user, target_user)

    return redirect(f"/messages/?room={dm_room.id}")


@login_required
def chat_room(request, room_id):
    # Mantém compatibilidade da URL antiga, levando para a experiência única do Gorjeio
    room = get_object_or_404(request.user.chat_rooms, id=room_id)
    return redirect(f"/messages/?room={room.id}")


def _participant_payload(user: User):
    profile = getattr(user, 'profile', None)
    full_name = (profile.full_name or '').strip() if profile else ''
    name = full_name or user.get_full_name() or user.username
    return {
        'id': user.id,
        'username': user.username,
        'name': name,
        'handle': f"@{user.username}",
        'initials': (name[:2] if len(name) >= 2 else user.username[:2]).upper(),
        'avatar': profile.avatar.url if profile and profile.avatar else None,
    }


def _message_payload(message: Message):
    return {
        'id': message.id,
        'room_id': message.room_id,
        'sender': _participant_payload(message.sender),
        'content': message.content or '',
        'created_at': message.created_at.isoformat(),
        'is_read': message.is_read,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_rooms_api(request):
    user = request.user

    rooms_qs = (
        user.chat_rooms
        .prefetch_related('participants__profile')
        .annotate(last_msg_time=Max('messages__created_at'))
        .order_by('-last_msg_time', '-updated_at')
    )

    payload = []
    for room in rooms_qs:
        participants = [_participant_payload(p) for p in room.participants.exclude(id=user.id)]
        last_message = room.messages.select_related('sender').order_by('-created_at').first()

        if room.type == 'dm' and participants:
            title = participants[0]['name']
            subtitle = participants[0]['handle']
        else:
            title = room.name or 'Grupo'
            subtitle = f"{room.participants.count()} membros"

        payload.append({
            'id': room.id,
            'type': room.type,
            'title': title,
            'subtitle': subtitle,
            'participants': participants,
            'last_message': _message_payload(last_message) if last_message else None,
            'unread_count': room.messages.exclude(sender=user).filter(is_read=False).count(),
        })

    return Response({'rooms': payload})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_messages_api(request, room_id: int):
    room = get_object_or_404(request.user.chat_rooms, id=room_id)
    messages = room.messages.select_related('sender', 'sender__profile').order_by('created_at')[:200]
    room.messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)

    return Response({
        'room_id': room.id,
        'messages': [_message_payload(m) for m in messages],
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_dm_api(request):
    username = (request.data.get('username') or '').strip()
    if not username:
        return Response({'detail': 'username é obrigatório.'}, status=400)

    target_user = get_object_or_404(User, username=username)
    if target_user == request.user:
        return Response({'detail': 'Não é possível criar chat com você mesmo.'}, status=400)

    dm_room = (
        request.user.chat_rooms
        .filter(type='dm', participants=target_user)
        .annotate(participant_count=Count('participants'))
        .filter(participant_count=2)
        .first()
    )

    if not dm_room:
        dm_room = Room.objects.create(type='dm')
        dm_room.participants.add(request.user, target_user)

    return Response({'room_id': dm_room.id})
