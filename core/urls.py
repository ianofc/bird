from django.urls import path
from django.contrib.auth import views as auth_views

# =============================================================
# 📦 IMPORTAÇÕES ESPECÍFICAS (DIRETO DOS ARQUIVOS)
# =============================================================
# Isso evita o erro de "ImportError" no __init__.py
from core.views import feed
from core.views import auth
from core.views import posts
from core.views import profile
from core.views import network
from core.views import discovery
from core.views import extras

# Tentativa de importar módulos opcionais (evita quebra se não existirem)
try:
    from core.views import interactions
except ImportError:
    interactions = None

try:
    from core.views import groups
except ImportError:
    groups = None

try:
    from core.views import events
except ImportError:
    events = None

try:
    from core.views import chat
except ImportError:
    chat = None

try:
    from core.views import general
except ImportError:
    general = None


urlpatterns = [
    # ==============================
    # 🏠 FEED & AUTH
    # ==============================
    path('', feed.home_view, name='home'),
    
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('register/', auth.register_view, name='register'),

    # ==============================
    # 🦅 POSTS
    # ==============================
    path('bird/create/', posts.create_bird, name='create_bird'),
    path('bird/<int:bird_id>/', posts.bird_detail, name='bird_detail'),
    path('bird/<int:bird_id>/delete/', posts.delete_bird, name='delete_bird'),

    # ==============================
    # 👤 PERFIL
    # ==============================
    path('profile/edit/', profile.edit_profile, name='edit_profile'),
    path('profile/<str:username>/', profile.profile_view, name='profile_detail'),

    # ==============================
    # 🌐 REDE
    # ==============================
    path('network/', network.network_view, name='network_dashboard'),
    path('network/suggestions/', network.suggestions_view, name='network_suggestions'),
    path('network/requests/', network.requests_view, name='network_requests'),
    path('network/connect/<str:username>/<str:bond_type>/', network.request_bond, name='request_bond'),
    path('network/manage/<int:bond_id>/<str:action>/', network.manage_bond, name='manage_bond'),

    # ==============================
    # 🧭 DESCOBERTA
    # ==============================
    path('explore/', discovery.explore_view, name='explore'),
    path('reels/', discovery.reels_view, name='reels'),
    path('search/', discovery.search_view if hasattr(discovery, 'search_view') else discovery.explore_view, name='search'),

    # ==============================
    # ⚙️ EXTRAS
    # ==============================
    path('settings/', extras.settings_view, name='settings'),
    path('settings/delete/', extras.delete_account, name='delete_account'),
    path('support/', extras.support_view, name='support'),
    path('theme/<str:theme_name>/', extras.set_theme, name='set_theme'),
]

# =============================================================
# 🧩 ROTAS DOS MÓDULOS OPCIONAIS
# =============================================================

if interactions:
    urlpatterns += [
        path('like/<int:bird_id>/', interactions.toggle_like, name='toggle_like'),
        path('comment/<int:bird_id>/', interactions.add_comment, name='add_comment'),
        path('delete-comment/<int:comment_id>/', interactions.delete_comment, name='delete_comment'),
        path('save/<int:bird_id>/', interactions.toggle_save, name='toggle_save'),
        path('share/<int:bird_id>/', interactions.share_post, name='share_post'),
        path('follow/<str:username>/', interactions.toggle_follow, name='toggle_follow'),
        path('block/<str:username>/', interactions.block_user, name='block_user'),
    ]

if groups:
    urlpatterns += [
        path('groups/', groups.list_groups, name='groups'),
        path('groups/create/', groups.create_group, name='create_group'),
        path('groups/<slug:slug>/', groups.group_detail, name='group_detail'),
        path('groups/<slug:slug>/join/', groups.join_group, name='join_group'),
        path('groups/<slug:slug>/leave/', groups.leave_group, name='leave_group'),
    ]

if events:
    urlpatterns += [
        path('events/', events.events_list_view, name='events_list'),
        path('events/<int:event_id>/', events.event_detail_view, name='event_detail'),
        path('events/<int:event_id>/attend/', events.event_attend, name='event_attend'),
    ]

if chat:
    urlpatterns += [
        path('chat/', chat.chat_index, name='chat_index'),
        path('chat/<int:room_id>/', chat.chat_index, name='chat_room'),
        path('chat/start/<str:username>/', chat.start_chat, name='start_chat'),
    ]

if general:
    urlpatterns += [
        path('notifications/', general.notifications_view, name='notifications'),
        path('notifications/read/<int:notif_id>/', general.mark_notification_read, name='mark_notification_read'),
    ]