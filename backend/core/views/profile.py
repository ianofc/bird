from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from core.models import Lyv, Connection, Profile, SavedPost, SocialBond

User = get_user_model()


@login_required
def profile_view(request, username):
    if username in {'me', request.user.username}:
        profile_user = request.user
    else:
        profile_user = get_object_or_404(User, username=username)

    if not hasattr(profile_user, 'profile'):
        Profile.objects.create(user=profile_user)

    profile = profile_user.profile
    is_own_profile = request.user == profile_user

    followers_qs = Connection.objects.filter(target=profile_user, status='active')
    following_qs = Connection.objects.filter(follower=profile_user, status='active')

    follower_ids = list(followers_qs.values_list('follower_id', flat=True))
    following_ids = list(following_qs.values_list('target_id', flat=True))
    friend_ids = set(follower_ids).intersection(set(following_ids))

    stats = {
        'followers': len(follower_ids),
        'following': len(following_ids),
        'posts_count': Lyv.objects.filter(author=profile_user).count(),
        'friends_count': SocialBond.objects.filter(
            (Q(requester=profile_user) | Q(target=profile_user)),
            status='active',
        ).count(),
    }

    relationship = {'is_following': False}
    if not is_own_profile:
        relationship['is_following'] = Connection.objects.filter(
            follower=request.user,
            target=profile_user,
            status='active',
        ).exists()

    posts = Lyv.objects.filter(author=profile_user).select_related('author', 'author__profile').order_by('-created_at')
    photo_posts = posts.exclude(image='').exclude(image__isnull=True)[:18]

    followers_list = User.objects.filter(id__in=follower_ids).select_related('profile').order_by('username')
    following_list = User.objects.filter(id__in=following_ids).select_related('profile').order_by('username')
    friends_list = User.objects.filter(id__in=friend_ids).select_related('profile').order_by('username')
    friends_preview = friends_list[:6]

    saved_post_ids = set(SavedPost.objects.filter(user=request.user).values_list('post_id', flat=True))

    context = {
        'profile_user': profile_user,
        'profile': profile,
        'stats': stats,
        'posts': posts,
        'photo_posts': photo_posts,
        'friends_preview': friends_preview,
        'followers_list': followers_list,
        'following_list': following_list,
        'friends_list': friends_list,
        'is_own_profile': is_own_profile,
        'relationship': relationship,
        'work_history': profile.work_history.all().order_by('-start_date')[:3],
        'education_history': profile.education_history.all().order_by('-start_date')[:3],
        'saved_post_ids': saved_post_ids,
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

    next_url = request.POST.get('next')
    if next_url:
        return redirect(next_url)
    return redirect('profile_detail', username=request.user.username)