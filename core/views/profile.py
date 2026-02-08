from django.db import models

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from core.models import Profile, Bird, SocialBond

@login_required
def profile_view(request, username):
    profile_user = get_object_or_404(User, username=username)
    profile = profile_user.profile
    is_own_profile = (request.user == profile_user)

    # Estatísticas
    stats = {
        'followers': 0, # Placeholder
        'following': 0, # Placeholder
        'friends_count': SocialBond.objects.filter(
            (models.Q(requester=profile_user) | models.Q(target=profile_user)),
            status='active'
        ).count(),
        'posts_count': Bird.objects.filter(author=profile_user).count()
    }

    context = {
        'profile_user': profile_user,
        'profile': profile,
        'is_own_profile': is_own_profile,
        'stats': stats,
        'posts': Bird.objects.filter(author=profile_user).order_by('-created_at'),
        'family_members': [],
        'work_history': [],
        'education_history': [],
        'relationship': {}
    }
    return render(request, 'pages/profile.html', context)

@login_required
def edit_profile(request):
    """Processa o upload de avatar e capa via POST"""
    if request.method == 'POST':
        profile = request.user.profile
        action = request.POST.get('action_type')
        
        if action == 'update_avatar' and request.FILES.get('avatar'):
            profile.avatar = request.FILES['avatar']
            profile.save()
            messages.success(request, "Foto de perfil atualizada!")
            
        elif action == 'update_cover' and request.FILES.get('cover_image'):
            profile.cover_image = request.FILES['cover_image']
            profile.save()
            messages.success(request, "Capa atualizada!")
            
    return redirect('profile_detail', username=request.user.username)