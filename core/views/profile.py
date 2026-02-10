from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.contrib import messages
from core.models import Bird, Connection, Profile, SocialBond

User = get_user_model()

@login_required
def profile_view(request, username):
    if username == 'me' or username == request.user.username:
        profile_user = request.user
    else:
        profile_user = get_object_or_404(User, username=username)

    if not hasattr(profile_user, 'profile'):
        Profile.objects.create(user=profile_user)
    
    profile = profile_user.profile
    is_own_profile = (request.user == profile_user)
    
    stats = {
        'followers': Connection.objects.filter(target=profile_user, status='active').count(),
        'following': Connection.objects.filter(follower=profile_user, status='active').count(),
        'posts_count': Bird.objects.filter(author=profile_user).count(),
        'friends_count': SocialBond.objects.filter(
            (Q(requester=profile_user) | Q(target=profile_user)),
            status='active'
        ).count()
    }

    relationship = {'is_following': False}
    if not is_own_profile:
        relationship['is_following'] = Connection.objects.filter(
            follower=request.user, target=profile_user, status='active'
        ).exists()

    posts = Bird.objects.filter(author=profile_user).order_by('-created_at')

    context = {
        'profile_user': profile_user,
        'profile': profile,
        'stats': stats,
        'posts': posts,
        'is_own_profile': is_own_profile,
        'relationship': relationship,
        'family_members': [],
        'work_history': [], 
        'education_history': []
    }
    
    return render(request, 'pages/profile.html', context)

@login_required
def edit_profile(request):
    if request.method == 'POST':
        profile = request.user.profile
        action = request.POST.get('action_type')
        
        if action == 'update_cover' and request.FILES.get('cover_image'):
            profile.cover_image = request.FILES['cover_image']
            profile.save()
            messages.success(request, 'Capa atualizada!')
        
        elif action == 'update_avatar' and request.FILES.get('avatar'):
            profile.avatar = request.FILES['avatar']
            profile.save()
            messages.success(request, 'Avatar atualizado!')
            
    return redirect('profile_detail', username=request.user.username)