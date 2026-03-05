from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from core.models import Connection, SocialBond


@login_required
def network_view(request):
    followers_ids = Connection.objects.filter(target=request.user, status='active').values_list('follower_id', flat=True)
    following_ids = Connection.objects.filter(follower=request.user, status='active').values_list('target_id', flat=True)

    followers = request.user.__class__.objects.filter(id__in=followers_ids).select_related('profile')
    following = request.user.__class__.objects.filter(id__in=following_ids).select_related('profile')
    friends = request.user.__class__.objects.filter(id__in=set(followers_ids).intersection(set(following_ids))).select_related('profile')

    pending_requests = SocialBond.objects.filter(target=request.user, status='pending').select_related('requester', 'requester__profile')

    context = {
        'followers': followers,
        'following': following,
        'friends': friends,
        'connections': friends,
        'friend_requests': pending_requests,
        'pending_requests_count': pending_requests.count(),
    }
    return render(request, 'pages/network.html', context)


@login_required
def manage_bond(request, request_id: int, action: str):
    bond = get_object_or_404(SocialBond, id=request_id, target=request.user, status='pending')
    if action == 'accept':
        bond.status = 'active'
        bond.save(update_fields=['status'])
        messages.success(request, f'Conexão com @{bond.requester.username} aceita.')
    elif action == 'reject':
        bond.status = 'rejected'
        bond.save(update_fields=['status'])
        messages.info(request, f'Pedido de @{bond.requester.username} recusado.')
    return redirect('network_dashboard')
