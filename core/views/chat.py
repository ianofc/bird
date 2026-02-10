from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Max
from core.models import Room, Message

@login_required
def chat_index(request):
    """Lista de conversas com lógica para identificar o interlocutor"""
    user = request.user
    
    # 1. Buscar salas ordenadas pela última mensagem
    rooms = user.chat_rooms.annotate(
        last_msg_time=Max('messages__created_at')
    ).order_by('-last_msg_time')

    # 2. Processar cada sala para saber quem é o "outro"
    final_rooms = []
    for room in rooms:
        if room.is_group:
            room.chat_name = room.name or "Grupo"
            room.chat_avatar = None # O template usa ícone padrão
            room.is_online = False
        else:
            # Pega o participante que NÃO é o utilizador atual
            other = room.participants.exclude(id=user.id).first()
            if other:
                room.chat_name = other.profile.full_name or other.username
                room.chat_avatar = other.profile.avatar.url if other.profile.avatar else None
                room.target_username = other.username # Para o link
                room.is_online = True # Mockup, depois ligamos ao Redis
            else:
                continue # Sala vazia ou bugada
        
        # Pega a última mensagem real
        last_msg = room.messages.last()
        room.last_message = last_msg.content if last_msg else "Inicie a conversa..."
        room.last_date = last_msg.created_at if last_msg else room.updated_at
        
        final_rooms.append(room)

    return render(request, 'groups/chat_list.html', {'rooms': final_rooms})

@login_required
def start_dm(request, username):
    """Cria ou recupera uma sala privada"""
    target_user = get_object_or_404(User, username=username)
    
    if target_user == request.user:
        return redirect('chat_index')

    # Verifica se já existe uma sala EXCLUSIVAMENTE entre estes dois
    # Filtra salas privadas que contêm o target_user
    # (Como 'my_rooms' já filtra as minhas, a interseção é a nossa DM)
    my_rooms = request.user.chat_rooms.filter(is_group=False)
    dm_room = None
    
    for room in my_rooms:
        if room.participants.count() == 2 and target_user in room.participants.all():
            dm_room = room
            break

    if not dm_room:
        dm_room = Room.objects.create(is_group=False)
        dm_room.participants.add(request.user, target_user)

    return redirect('chat_room', room_id=dm_room.id)

@login_required
def chat_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    
    if request.user not in room.participants.all():
        return redirect('chat_index')

    messages = room.messages.select_related('sender', 'sender__profile').order_by('created_at')[:50]
    
    # Define dados do cabeçalho
    if room.is_group:
        chat_name = room.name
        other_user = None
    else:
        other_user = room.participants.exclude(id=request.user.id).first()
        chat_name = other_user.profile.full_name or other_user.username if other_user else "Utilizador Desconhecido"

    return render(request, 'groups/chat_room.html', {
        'room': room,
        'messages': messages,
        'chat_name': chat_name,
        'other_user': other_user
    })