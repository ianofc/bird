from django.contrib.auth.decorators import login_required
from django.db.models import Count, F, Q
from django.shortcuts import render

from core.models import Bird, Connection


@login_required
def explore_view(request):
    """Explorar inspirado em UX de Instagram: grade, filtro por mídia e busca."""
    media = request.GET.get('media', 'all')
    query = request.GET.get('q', '').strip()

    following_ids = Connection.objects.filter(
        follower=request.user,
        status='active',
    ).values_list('target_id', flat=True)

    birds = Bird.objects.filter(visibility='public').select_related('author', 'author__profile')

    if media == 'images':
        birds = birds.filter(image__isnull=False)
    elif media == 'videos':
        birds = birds.filter(video__isnull=False)
    elif media == 'following':
        birds = birds.filter(author_id__in=following_ids)

    if query:
        birds = birds.filter(
            Q(content__icontains=query)
            | Q(author__username__icontains=query)
            | Q(author__profile__full_name__icontains=query)
        )

    birds = birds.annotate(
        likes_count=Count('likes', distinct=True),
        comments_count=Count('comments', distinct=True),
        popularity=F('likes_count') * 2 + F('comments_count') * 3,
    ).order_by('-popularity', '-created_at')[:90]

    context = {
        'birds': birds,
        'active_media': media,
        'query': query,
    }
    return render(request, 'pages/explore.html', context)
