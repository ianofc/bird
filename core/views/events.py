from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib import messages

# Importação segura dos models
try:
    from ..models import Evento
except ImportError:
    Evento = None

@login_required
def events_list_view(request):
    """
    Lista de eventos futuros.
    """
    events = []
    if Evento:
        # Pega eventos que ainda não aconteceram
        events = Evento.objects.filter(
            data_inicio__gte=timezone.now()
        ).order_by('data_inicio')

    return render(request, 'social/events/list.html', {'events': events})

@login_required
def event_detail_view(request, event_id):
    """
    Detalhes do evento e lista de participantes.
    """
    event = get_object_or_404(Evento, id=event_id)
    
    # Verifica se o usuário já confirmou presença
    is_participating = event.participantes.filter(id=request.user.id).exists()

    context = {
        'event': event,
        'is_participating': is_participating
    }
    return render(request, 'social/events/detail.html', context)

@login_required
def calendar_view(request):
    """
    Visualização de calendário (placeholder ou integração JS).
    """
    return render(request, 'social/events/calendar.html')

@login_required
def event_attend(request, event_id):
    """
    Alterna a participação do usuário no evento (Confirmar/Desistir).
    """
    event = get_object_or_404(Evento, id=event_id)
    
    if event.participantes.filter(id=request.user.id).exists():
        event.participantes.remove(request.user)
        messages.info(request, f"Você desistiu do evento {event.titulo}.")
    else:
        event.participantes.add(request.user)
        messages.success(request, f"Presença confirmada em {event.titulo}!")
        
    return redirect('bird_social:event_detail', event_id=event.id)