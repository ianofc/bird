from django.urls import path
from core.views import (
    auth, feed, posts, profile, discovery, 
    interactions, network, groups, general, events, extras, chat
)

urlpatterns = [
    # ==============================
    # 🏠 FEED & AUTH
    # ==============================
    path('', feed.index, name='home'),
    path('login/', auth.login_view, name='login'),
    path('register/', auth.register_view, name='register'),
    path('logout/', auth.logout_view, name='logout'),

    # ==============================
    # 🦅 POSTS (BIRDS)
    # ==============================
    path('bird/create/', posts.create_bird, name='create_bird'),
    
    # CORREÇÃO: Usamos apenas <int:bird_id> pois seus models usam IDs numéricos
    path('bird/<int:bird_id>/', posts.bird_detail, name='bird_detail'),
    
    path('bird/delete/<int:bird_id>/', posts.delete_bird, name='delete_bird'),

    # ==============================
    # ❤️ INTERAÇÕES
    # ==============================
    path('like/<int:bird_id>/', interactions.toggle_like, name='toggle_like'),
    path('comment/<int:bird_id>/', interactions.add_comment, name='add_comment'),
    path('delete-comment/<int:comment_id>/', interactions.delete_comment, name='delete_comment'),
    path('save/<int:bird_id>/', interactions.toggle_save, name='toggle_save'),
    path('share/<int:bird_id>/', interactions.share_post, name='share_post'),

    # ==============================
    # 👤 PERFIL & REDE
    # ==============================
    path('profile/edit/', profile.edit_profile, name='edit_profile'),
    path('profile/<str:username>/', profile.profile_view, name='profile_detail'),
    
    # Network (Seguir/Bloquear)
    path('follow/<str:username>/', interactions.toggle_follow, name='toggle_follow'),
    path('block/<str:username>/', interactions.block_user, name='block_user'),
    
    # Network (Laços/Família/Amigos)
    path('network/', network.network_view, name='network_dashboard'),
    path('network/suggestions/', network.suggestions_view, name='network_suggestions'),
    path('network/requests/', network.requests_view, name='network_requests'),
    path('network/request-bond/<str:username>/<str:bond_type>/', network.request_bond, name='request_bond'),
    path('network/manage/<int:bond_id>/<str:action>/', network.manage_bond, name='manage_bond'),

    # ==============================
    # 🧭 DESCOBERTA & GERAL
    # ==============================
    path('explore/', discovery.explore_view, name='explore'),
    path('reels/', discovery.reels_view, name='reels'),
    path('search/', general.search_view, name='search'),
    path('notifications/', general.notifications_view, name='notifications'),
    path('notifications/read/<int:notif_id>/', general.mark_notification_read, name='mark_notification_read'),

    # ==============================
    # 👥 GRUPOS (COMUNIDADES)
    # ==============================
    path('groups/', groups.list_groups, name='groups'),
    path('groups/create/', groups.create_group, name='create_group'),
    path('groups/<slug:slug>/', groups.group_detail, name='group_detail'),
    path('groups/<slug:slug>/join/', groups.join_group, name='join_group'),
    path('groups/<slug:slug>/leave/', groups.leave_group, name='leave_group'),

    # ==============================
    # 📅 EVENTOS
    # ==============================
    path('events/', events.events_list_view, name='events_list'),
    path('events/<int:event_id>/', events.event_detail_view, name='event_detail'),
    path('events/<int:event_id>/attend/', events.event_attend, name='event_attend'),

    # ==============================
    # 💬 CHAT
    # ==============================
    path('chat/', chat.chat_index, name='chat_index'),
    path('chat/<int:room_id>/', chat.chat_index, name='chat_room'),
    path('chat/start/<str:username>/', chat.start_chat, name='start_chat'),

    # ==============================
    # ⚙️ EXTRAS
    # ==============================
    path('settings/', extras.settings_view, name='settings'),
    path('support/', extras.support_view, name='support'),
    path('theme/<str:theme_name>/', extras.set_theme, name='set_theme'),
]