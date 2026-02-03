from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib import messages
from datetime import timedelta

# Importação segura dos models (Permite rodar sem o app Events criado)
try:
    from ..models import Evento
except ImportError:
    Evento = None

# ========================================================
# 📅 LISTA DE EVENTOS
# ========================================================

@login_required
def events_list_view(request):
    """
    Exibe eventos futuros.
    Suporta modo Híbrido (DB ou Mock).
    """
    events = []
    using_mock = False

    if Evento:
        # Busca eventos reais no banco
        events = Evento.objects.filter(
            data_inicio__gte=timezone.now()
        ).order_by('data_inicio')
    else:
        # Modo Mock: Dados visuais para desenvolvimento
        events = get_mock_events()
        using_mock = True

    context = {
        'events': events,
        'using_mock': using_mock
    }
    return render(request, 'events/list.html', context)


# ========================================================
# 🔍 DETALHES DO EVENTO
# ========================================================

@login_required
def event_detail_view(request, event_id):
    """
    Mostra detalhes, mapa e participantes.
    """
    event = None
    is_participating = False

    if Evento:
        event = get_object_or_404(Evento, id=event_id)
        is_participating = event.participantes.filter(id=request.user.id).exists()
    else:
        # Busca no Mock
        mock_events = get_mock_events()
        event = next((e for e in mock_events if str(e['id']) == str(event_id)), None)
        
        if not event:
            messages.error(request, "Evento não encontrado (Modo Mock).")
            return redirect('events_list')
            
        # Simula participação (Visual)
        is_participating = False 

    context = {
        'event': event,
        'is_participating': is_participating
    }
    return render(request, 'events/detail.html', context)


# ========================================================
# 🎫 CONFIRMAÇÃO DE PRESENÇA
# ========================================================

@login_required
def event_attend(request, event_id):
    """
    Alterna a participação (Join/Leave).
    """
    if not Evento:
        messages.info(request, "Modo de demonstração: Participação simulada.")
        return redirect('event_detail', event_id=event_id)

    event = get_object_or_404(Evento, id=event_id)
    
    if event.participantes.filter(id=request.user.id).exists():
        event.participantes.remove(request.user)
        messages.warning(request, f"Você cancelou sua presença em: {event.titulo}")
    else:
        event.participantes.add(request.user)
        messages.success(request, f"Presença confirmada! Nos vemos em: {event.titulo}")
        
    return redirect('event_detail', event_id=event.id)


# ========================================================
# 🗓️ CALENDÁRIO (VIEW)
# ========================================================

@login_required
def calendar_view(request):
    """
    Visualização de calendário (Pode ser integrado com FullCalendar.js).
    """
    return render(request, 'events/calendar.html')


# ========================================================
# 🛠️ MOCK DATA GENERATOR
# ========================================================

def get_mock_events():
    """Gera eventos falsos para popular a UI"""
    now = timezone.now()
    return [
        {
            'id': 1,
            'titulo': 'Bird Tech Summit 2026',
            'descricao': 'O maior evento de tecnologia e inovação do ecossistema Bird. Palestras sobre IA, Django e Design System.',
            'local': 'Auditório NioCortex, Bahia',
            'data_inicio': now + timedelta(days=5),
            'imagem': {'url': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'},
            'participantes': {'count': 142}
        },
        {
            'id': 2,
            'titulo': 'Workshop: Python para Web',
            'descricao': 'Aprenda a criar aplicações modernas com Django e HTMX em um final de semana.',
            'local': 'Online (Google Meet)',
            'data_inicio': now + timedelta(days=12),
            'imagem': {'url': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80'},
            'participantes': {'count': 56}
        },
        {
            'id': 3,
            'titulo': 'Meetup: Design System Aurora',
            'descricao': 'Dissecando os princípios visuais do Glassmorphism e como aplicá-los.',
            'local': 'Coworking Central',
            'data_inicio': now + timedelta(days=20),
            'imagem': {'url': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80'},
            'participantes': {'count': 89}
        }
    ]