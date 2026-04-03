from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from core.models import Event


@login_required
def events_list_view(request):
    events = Event.objects.select_related('organizer', 'organizer__profile').prefetch_related('participants').filter(date__gte=timezone.now()).order_by('date')
    return render(request, 'events/list.html', {'events': events, 'using_mock': False, 'section': 'events'})


@login_required
def event_detail_view(request, event_id):
    event = get_object_or_404(Event.objects.select_related('organizer', 'organizer__profile').prefetch_related('participants__profile'), id=event_id)
    is_participating = event.participants.filter(id=request.user.id).exists()
    return render(request, 'events/detail.html', {'event': event, 'is_participating': is_participating})


@login_required
def event_attend(request, event_id):
    event = get_object_or_404(Event, id=event_id)

    if event.participants.filter(id=request.user.id).exists():
        event.participants.remove(request.user)
        messages.info(request, f"Você cancelou presença em {event.title}.")
    else:
        event.participants.add(request.user)
        messages.success(request, f"Presença confirmada em {event.title}!")

    return redirect('event_detail', event_id=event.id)
