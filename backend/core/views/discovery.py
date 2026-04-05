from django.contrib.auth.decorators import login_required
from django.db.models import Count, F, Q
from django.shortcuts import render

from core.models import Lyv, Connection


@login_required
def explore_view(request):
    """Explorar inspirado em UX de Instagram: grade, filtro por mídia e busca."""
    media = request.GET.get('media', 'all')
    query = request.GET.get('q', '').strip()

    following_ids = Connection.objects.filter(
        follower=request.user,
        status='active',
    ).values_list('target_id', flat=True)

    lyvs = Lyv.objects.filter(visibility='public').select_related('author', 'author__profile')

    if media == 'images':
        lyvs = lyvs.filter(image__isnull=False)
    elif media == 'videos':
        lyvs = lyvs.filter(video__isnull=False)
    elif media == 'following':
        lyvs = lyvs.filter(author_id__in=following_ids)

    if query:
        lyvs = lyvs.filter(
            Q(content__icontains=query)
            | Q(author__username__icontains=query)
            | Q(author__profile__full_name__icontains=query)
        )

    lyvs = lyvs.annotate(
        likes_count=Count('likes', distinct=True),
        comments_count=Count('comments', distinct=True),
        popularity=F('likes_count') * 2 + F('comments_count') * 3,
    ).order_by('-popularity', '-created_at')[:90]

    context = {
        'lyvs': lyvs,
        'active_media': media,
        'query': query,
    }
    return render(request, 'pages/explore.html', context)
