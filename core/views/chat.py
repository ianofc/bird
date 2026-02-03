from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Max  # <--- Max adicionado para ordenação
from django.utils import timezone
from django.http import Http404

User = get_user_model()

# Tenta importar os modelos reais. 
# Se não existirem (ainda não criamos o app 'chat'), usamos None para ativar o Modo Mock.
try:
    from ..models import Room, Message
except ImportError:
    Room = Message = None

# ========================================================
# 💬 VIEW PRINCIPAL (LISTA & DETALHE)
# ========================================================

@login_required
def chat_index(request, room_id=None):
    """
    Controlador Mestre do Chat.
    Renderiza tanto a lista de conversas quanto uma conversa ativa.
    """
    user = request.user
    
    # 1. DADOS DAS CONVERSAS (SIDEBAR)
    rooms = []
    
    if Room:
        # Busca salas reais onde o usuário está e ordena pela mensagem mais recente
        rooms = Room.objects.filter(participants=user).annotate(
            last_msg_time=Max('messages__created_at')
        ).order_by('-last_msg_time')
    else:
        # MOCK DATA: Para visualização do layout
        rooms = get_mock_rooms()

    # 2. DADOS DA CONVERSA ATIVA (CENTRO)
    active_room = None
    messages = []

    if room_id:
        if Room:
            # Busca sala real e garante segurança (usuário deve ser participante)
            active_room = get_object_or_404(Room, id=room_id, participants=user)
            messages = active_room.messages.all().order_by('created_at')
            
            # Marca mensagens como lidas (Lógica futura)
            # active_room.messages.exclude(sender=user).update(is_read=True)
        else:
            # MOCK DATA: Pega a sala falsa pelo ID
            active_room = next((r for r in rooms if str(r['id']) == str(room_id)), None)
            if active_room:
                messages = get_mock_messages(active_room)

    context = {
        'rooms': rooms,
        'active_room': active_room,
        'messages': messages,
        'is_messenger_mode': True # Flag para ajustar o layout (esconder sidebars globais)
    }
    
    # Renderiza o template específico de chat (Full Height)
    return render(request, 'pages/chat.html', context)


# ========================================================
# 🚀 LÓGICA DE INÍCIO (START CHAT)
# ========================================================

@login_required
def start_chat(request, username):
    """
    Encontra ou cria uma sala privada com o usuário alvo.
    """
    target_user = get_object_or_404(User, username=username)
    
    # Impede conversa consigo mesmo
    if target_user == request.user:
        return redirect('chat_index')

    if Room:
        # 1. Verifica se já existe sala privada entre os dois
        # Lógica: Sala com exatamente 2 participantes que são (user, target)
        existing_room = Room.objects.annotate(count=Count('participants')).filter(
            count=2
        ).filter(participants=request.user).filter(participants=target_user).first()

        if existing_room:
            return redirect('chat_room', room_id=existing_room.id)
        
        # 2. Se não existe, cria nova
        new_room = Room.objects.create(is_group=False)
        new_room.participants.add(request.user, target_user)
        return redirect('chat_room', room_id=new_room.id)

    else:
        # Fallback Mock: Redireciona para a sala fictícia 1 se não houver backend
        return redirect('chat_room', room_id=1)


# ========================================================
# 🧪 MOCK DATA GENERATORS (VISUAL APENAS)
# ========================================================

def get_mock_rooms():
    """Gera lista de contatos fake para teste de UI"""
    return [
        {
            'id': 1,
            'name': 'Equipe NioCortex',
            'avatar_url': 'https://ui-avatars.com/api/?name=NC&background=6366f1&color=fff',
            'last_message': 'O deploy foi realizado com sucesso! 🚀',
            'timestamp': '10:42',
            'unread_count': 2,
            'is_online': True
        },
        {
            'id': 2,
            'name': 'Lívia (Esposa)',
            'avatar_url': 'https://ui-avatars.com/api/?name=Livia&background=ec4899&color=fff',
            'last_message': 'Não esquece de comprar leite.',
            'timestamp': 'Ontem',
            'unread_count': 0,
            'is_online': False
        },
        {
            'id': 3,
            'name': 'Grupo da Igreja',
            'avatar_url': 'https://ui-avatars.com/api/?name=IP&background=22c55e&color=fff',
            'last_message': 'Culto de domingo confirmado.',
            'timestamp': 'Terça',
            'unread_count': 5,
            'is_online': False
        }
    ]

def get_mock_messages(room):
    """Gera mensagens fake baseadas na sala"""
    if str(room['id']) == '1':
        return [
            {'sender_is_me': False, 'content': 'Ian, como está o status do Bird?', 'time': '10:30'},
            {'sender_is_me': True, 'content': 'Está ficando incrível. Acabei de implementar o Aurora UI.', 'time': '10:35'},
            {'sender_is_me': False, 'content': 'Excelente! Mande prints.', 'time': '10:36'},
            {'sender_is_me': False, 'content': 'O deploy foi realizado com sucesso! 🚀', 'time': '10:42'},
        ]
    return [
        {'sender_is_me': False, 'content': 'Olá!', 'time': '09:00'},
        {'sender_is_me': True, 'content': 'Tudo bem?', 'time': '09:05'},
    ]