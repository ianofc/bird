from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

# Tenta importar modelos de chat se existirem (Talkio app externo ou interno)
try:
    from talkio.chat.models import Room, Message
except ImportError:
    Room = Message = None

@login_required
def chat_view(request):
    """
    Tela principal do Messenger (Talkio).
    Lista as conversas recentes.
    """
    conversations = []
    
    # Se os modelos existirem, busca conversas reais
    if Room:
        conversations = Room.objects.filter(participants=request.user).order_by('-updated_at')

    context = {
        'conversations': conversations,
        'is_messenger': True
    }
    return render(request, 'social/talkio/index.html', context)

@login_required
def chat_detail(request, chat_id):
    """
    Abre uma conversa específica.
    """
    conversation = None
    messages = []
    
    if Room:
        conversation = get_object_or_404(Room, id=chat_id, participants=request.user)
        messages = conversation.messages.all().order_by('created_at')

    context = {
        'conversation': conversation,
        'messages': messages,
        'active_chat_id': chat_id,
        'is_messenger': True
    }
    # Reutiliza o index mas carregando a conversa no painel direito
    return render(request, 'social/talkio/index.html', context)

@login_required
def start_chat(request, user_id):
    """
    Inicia ou recupera uma conversa com um usuário específico.
    """
    target_user = get_object_or_404(User, id=user_id)
    
    if Room:
        # Tenta encontrar sala existente entre os dois
        # Lógica simples para sala 1x1
        rooms = Room.objects.filter(participants=request.user).filter(participants=target_user)
        
        if rooms.exists():
            room = rooms.first()
        else:
            # Cria nova sala
            room = Room.objects.create()
            room.participants.add(request.user, target_user)
            room.save()
            
        return redirect('bird_social:talkio_detail', chat_id=room.id)
    
    # Fallback se não tiver backend de chat configurado
    return redirect('bird_social:talkio_app')