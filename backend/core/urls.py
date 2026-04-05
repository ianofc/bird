from django.urls import path
from core.views import feed, profile, posts, interactions, settings, discovery, post, events, groups, network, auth, general
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    # --- ROTA CRÍTICA DO PERFIL (Auth) ---
    # O prefixo '/api/' já vem do lyv/urls.py, então aqui usamos apenas 'auth/me/'
    # URL Final: /api/auth/me/
    path('auth/me/', auth.current_user_django, name='current_user_api'),
    
    # Home e Feed
    path('', feed.home_view, name='home'),
    
    # ...
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    
    # Perfis
    path('profile/edit/submit/', profile.edit_profile, name='edit_profile'),
    path('profile/<str:username>/', profile.profile_view, name='profile_detail'),
    path('p/<str:username>/', profile.profile_view, name='profile_short'),
    
    # Interações
    path('profile/<str:username>/follow/', interactions.toggle_follow, name='toggle_follow'),
    path('lyv/<int:lyv_id>/like/', interactions.toggle_like, name='toggle_like'),
    path('lyv/<int:lyv_id>/comment/', interactions.add_comment, name='add_comment'),
    path('lyv/<int:lyv_id>/save/', interactions.toggle_save, name='toggle_save'),
    path('lyv/<int:lyv_id>/share/', interactions.share_post, name='share_post'),
    path('comment/<int:comment_id>/delete/', interactions.delete_comment, name='delete_comment'),

    # Chat

    # Chat API (SPA/React)
    path('chat/rooms/', post.chat_rooms_api, name='chat_rooms_api'),
    path('chat/rooms/<int:room_id>/messages/', post.chat_messages_api, name='chat_messages_api'),
    path('chat/start-dm/', post.start_dm_api, name='chat_start_dm_api'),
    path('start_chat/<str:username>/', post.start_dm, name='start_chat'),
    path('messages/', post.chat_index, name='chat_index'),
    path('messages/t/<str:username>/', post.start_dm, name='start_dm'),
    path('messages/<int:room_id>/', post.chat_room, name='chat_room'),

    # Posts (Lyvs)
    path('lyv/create/', posts.create_lyv, name='create_lyv'),
    path('lyv/<int:lyv_id>/', posts.lyv_detail, name='lyv_detail'),
    path('lyv/<int:lyv_id>/delete/', posts.delete_lyv, name='delete_lyv'),

    # Outros
    path('settings/', settings.settings_view, name='settings'),
    path('login/', auth.login_view, name='login_page'), # Página de login clássica (HTML)
    path('explore/', discovery.explore_view, name='explore'),
    path('network/', network.network_view, name='network_dashboard'),
    path('groups/', groups.groups_index, name='groups'),
    path('groups/create/', groups.create_group, name='create_group'),
    path('groups/<int:group_id>/', groups.group_detail, name='group_detail'),
    path('groups/<int:group_id>/join/', groups.join_group, name='join_group'),
    path('groups/<int:group_id>/leave/', groups.leave_group, name='leave_group'),
    path('events/', events.events_list_view, name='events_list'),
    path('events/<int:event_id>/', events.event_detail_view, name='event_detail'),
    path('events/<int:event_id>/attend/', events.event_attend, name='event_attend'),
    path('network/bond/<int:request_id>/<str:action>/', network.manage_bond, name='manage_bond'),
    path('reels/', general.reels_view, name='reels'),
]