import re
from datetime import timedelta

import requests
from django.db.models import Case, Count, F, IntegerField, Q, Value, When
from django.shortcuts import render
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from core.models import Lyv, Connection, SavedPost


HASHTAG_RE = re.compile(r"#([\w_]{2,40})", re.UNICODE)
User = get_user_model()


def _recommended_lyvs_from_ai(user):
    """Busca recomendações do motor externo e preserva a ordem devolvida."""
    recommend_url = f"http://tas-engine:8000/api/v1/recommend/?user_id={user.id}"

    try:
        response = requests.get(recommend_url, timeout=1.5)
        if response.status_code != 200:
            return []

        lyv_ids = response.json().get('recommendations', [])
        if not lyv_ids:
            return []

        lyvs_query = Lyv.objects.filter(id__in=lyv_ids).select_related('author', 'author__profile')
        lyvs_dict = {lyv.id: lyv for lyv in lyvs_query}
        return [lyvs_dict[lyv_id] for lyv_id in lyv_ids if lyv_id in lyvs_dict]
    except Exception:
        # Se o motor cair, a aplicação continua com ranking local.
        return []


def _build_local_feed(user, feed_mode='for_you', search=''):
    """Ranking local: prioriza conexões reais + engajamento recente."""
    following_ids = Connection.objects.filter(
        follower=user,
        status='active',
    ).values_list('target_id', flat=True)

    lyvs = Lyv.objects.filter(visibility='public').select_related('author', 'author__profile')

    if feed_mode == 'following':
        lyvs = lyvs.filter(author_id__in=following_ids)

    if search:
        lyvs = lyvs.filter(
            Q(content__icontains=search)
            | Q(author__username__icontains=search)
            | Q(author__profile__full_name__icontains=search)
        )

    one_day_ago = timezone.now() - timedelta(days=1)
    two_hours_ago = timezone.now() - timedelta(hours=2)

    return lyvs.annotate(
        likes_count=Count('likes', distinct=True),
        comments_count=Count('comments', distinct=True),
        following_boost=Case(
            When(author_id__in=following_ids, then=Value(25)),
            default=Value(0),
            output_field=IntegerField(),
        ),
        fresh_boost=Case(
            When(created_at__gte=two_hours_ago, then=Value(12)),
            default=Value(0),
            output_field=IntegerField(),
        ),
        recent_boost=Case(
            When(created_at__gte=one_day_ago, then=Value(6)),
            default=Value(0),
            output_field=IntegerField(),
        ),
        engagement=F('likes_count') * 2 + F('comments_count') * 3,
    ).order_by('-following_boost', '-fresh_boost', '-recent_boost', '-engagement', '-created_at')[:50]


def _extract_trends(lyvs, limit=5):
    trend_counter = {}

    for lyv in lyvs:
        if not lyv.content:
            continue
        for tag in HASHTAG_RE.findall(lyv.content.lower()):
            trend_counter[tag] = trend_counter.get(tag, 0) + 1

    trends = sorted(trend_counter.items(), key=lambda item: item[1], reverse=True)
    return trends[:limit]


def _suggested_users(user, limit=5):
    following_ids = list(
        Connection.objects.filter(
            follower=user,
            status='active',
        ).values_list('target_id', flat=True)
    )

    mutuals_qs = (
        Connection.objects.filter(
            follower_id__in=following_ids,
            status='active',
        )
        .exclude(target=user)
        .values('target_id')
        .annotate(total=Count('id'))
    )
    mutuals_map = {item['target_id']: item['total'] for item in mutuals_qs}

    candidates = (
        User.objects.exclude(id__in=following_ids + [user.id])
        .select_related('profile')
        .order_by('-date_joined')[:40]
    )

    suggestions = []
    for candidate in candidates:
        profile = getattr(candidate, 'profile', None)
        suggestions.append(
            {
                'username': candidate.username,
                'full_name': getattr(profile, 'full_name', '') if profile else '',
                'avatar_url': profile.avatar.url if profile and profile.avatar else '',
                'mutuals': mutuals_map.get(candidate.id, 0),
            }
        )

    suggestions.sort(key=lambda item: (item['mutuals'], item['username']), reverse=True)
    return suggestions[:limit]

@login_required
def home_view(request):
    """Feed social completo: para você, seguindo, tendências e sugestões."""
    user = request.user

    feed_mode = request.GET.get('mode', 'for_you')
    if feed_mode not in {'for_you', 'following'}:
        feed_mode = 'for_you'

    search = request.GET.get('q', '').strip()

    feed_lyvs = []
    if feed_mode == 'for_you' and not search:
        feed_lyvs = _recommended_lyvs_from_ai(user)

    if not feed_lyvs:
        feed_lyvs = _build_local_feed(user=user, feed_mode=feed_mode, search=search)

    recent_public_lyvs = Lyv.objects.filter(visibility='public').only('content').order_by('-created_at')[:150]

    saved_post_ids = set(SavedPost.objects.filter(user=user).values_list('post_id', flat=True))

    context = {
        'lyvs': feed_lyvs,
        'feed_mode': feed_mode,
        'search_term': search,
        'trending_topics': _extract_trends(recent_public_lyvs),
        'suggested_users': _suggested_users(user),
        'stories': Lyv.objects.filter(post_type='story').select_related('author', 'author__profile').order_by('-created_at')[:15],
        'saved_post_ids': saved_post_ids,
    }
    return render(request, 'pages/feed.html', context)
