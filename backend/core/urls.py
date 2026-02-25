from django.urls import path
from core.views import feed, profile, posts, interactions, settings, discovery, chat, groups, network, auth, general
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    # --- ROTA CRÍTICA DO PERFIL (Auth) ---
    # O prefixo '/api/' já vem do bird/urls.py, então aqui usamos apenas 'auth/me/'
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
    path('bird/<int:bird_id>/like/', interactions.toggle_like, name='toggle_like'),

    # Chat
    path('start_chat/<str:username>/', chat.start_dm, name='start_chat'),
    path('messages/', chat.chat_index, name='chat_index'),
    path('messages/t/<str:username>/', chat.start_dm, name='start_dm'),
    path('messages/<int:room_id>/', chat.chat_room, name='chat_room'),

    # Posts (Birds)
    path('bird/create/', posts.create_bird, name='create_bird'),
    path('bird/<int:bird_id>/', posts.bird_detail, name='bird_detail'),
    path('bird/<int:bird_id>/delete/', posts.delete_bird, name='delete_bird'),

    # Outros
    path('settings/', settings.settings_view, name='settings'),
    path('login/', auth.login_view, name='login_page'), # Página de login clássica (HTML)
    path('explore/', discovery.explore_view, name='explore'),
    path('network/', network.network_view, name='network_dashboard'),
    path('groups/', groups.groups_index, name='groups'),
    path('reels/', general.reels_view, name='reels'),
]