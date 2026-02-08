from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from core.models import Room

@login_required
def chat_index(request):
    # Garante que existe pelo menos uma sala global (ID 1)
    room, created = Room.objects.get_or_create(id=1, defaults={'is_group': True, 'name': 'Global'})
    
    # Carrega as últimas 50 mensagens dessa sala
    messages = room.messages.select_related('sender', 'sender__profile').order_by('created_at')[:50]
    
    return render(request, 'groups/chat.html', {
        'room': room,
        'messages': messages
    })