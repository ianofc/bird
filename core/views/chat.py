from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Max
from django.http import HttpResponseForbidden
from ..models import Room, Message

User = get_user_model()

# ========================================================
# 💬 CHAT: LISTA & CONVERSA ATIVA
# ========================================================

@login_required
def chat_index(request, room_id=None):
    """
    Controlador Mestre do Chat.
    Exibe a sidebar com todas as conversas e, se selecionado, o chat ativo.
    """
    user = request.user
    
    # 1. LISTAR CONVERSAS (SIDEBAR)
    # Ordena salas pela mensagem mais recente recebida ou enviada
    rooms_qs = Room.objects.filter(participants=user).annotate(
        last_msg_time=Max('messages__created_at')
    ).order_by('-last_msg_time')

    chat_list = []
    for room in rooms_qs:
        # Define quem é o "outro" lado da conversa para exibir nome/foto
        # Se for grupo, o nome é o do grupo. Se for DM, é o do outro usuário.
        other_users = room.participants.exclude(id=user.id)
        
        chat_name = "Chat Desconhecido"
        chat_avatar = None
        
        if room.is_group:
            chat_name = room.name or "Grupo Sem Nome"
            # chat_avatar = room.cover_image.url ... (se tiver)
        elif other_users.exists():
            other = other_users.first()
            # Usa o nome do perfil se existir, senão username
            if hasattr(other, 'profile'):
                chat_name = other.profile.full_name or other.username
                if other.profile.avatar:
                    chat_avatar = other.profile.avatar.url
            else:
                chat_name = other.username

        # Pega a última mensagem para o preview
        last_message_obj = room.messages.order_by('-created_at').first()
        last_message_text = last_message_obj.content if last_message_obj else "Inicie a conversa..."

        chat_list.append({
            'id': room.id,
            'name': chat_name,
            'avatar': chat_avatar,
            'last_message': last_message_text,
            'timestamp': last_message_obj.created_at if last_message_obj else room.updated_at,
            'is_active': (room.id == room_id)
        })

    # 2. DADOS DA CONVERSA ATIVA (CENTRO)
    active_room = None
    messages = []
    other_user_obj = None

    if room_id:
        active_room = get_object_or_404(Room, id=room_id)
        
        # Segurança: Verifica se o usuário realmente participa desta sala
        if user not in active_room.participants.all():
            return HttpResponseForbidden("Você não tem permissão para ver esta conversa.")
            
        # Marca mensagens como lidas (exceto as minhas)
        active_room.messages.exclude(sender=user).filter(is_read=False).update(is_read=True)
        
        # Carrega histórico
        messages = active_room.messages.all().order_by('created_at')
        
        if not active_room.is_group:
            other_user_obj = active_room.participants.exclude(id=user.id).first()

        # --- PROCESSAR ENVIO DE MENSAGEM (POST) ---
        if request.method == 'POST':
            content = request.POST.get('content')
            if content:
                Message.objects.create(
                    room=active_room,
                    sender=user,
                    content=content
                )
                # Atualiza timestamp da sala para ela subir na lista
                active_room.save() 
                return redirect('chat_room', room_id=active_room.id)

    context = {
        'chat_list': chat_list,
        'active_room': active_room,
        'messages': messages,
        'other_user': other_user_obj,
        'section': 'chat'
    }
    
    return render(request, 'pages/chat.html', context)


# ========================================================
# 🚀 INICIAR CONVERSA (DM)
# ========================================================

@login_required
def start_chat(request, username):
    """
    Atalho para abrir chat com um usuário específico a partir do perfil.
    """
    target_user = get_object_or_404(User, username=username)
    user = request.user

    # Não pode conversar consigo mesmo
    if target_user == user:
        return redirect('chat_index')

    # 1. Verifica se já existe sala privada (DM) entre os dois
    # Lógica: Sala que não é grupo e contém ambos como participantes
    # Nota: Esta query pode ser aprimorada, mas funciona para MVP
    existing_rooms = Room.objects.filter(is_group=False, participants=user).filter(participants=target_user)
    
    if existing_rooms.exists():
        # Redireciona para a primeira sala encontrada
        return redirect('chat_room', room_id=existing_rooms.first().id)
    
    # 2. Se não existe, cria nova sala
    new_room = Room.objects.create(is_group=False)
    new_room.participants.add(user, target_user)
    
    return redirect('chat_room', room_id=new_room.id)