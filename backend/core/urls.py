from django.urls import path
from core.views import feed, profile, posts, interactions, settings, discovery, chat, events, groups, network, auth, general

urlpatterns = [
    path('', feed.home_view, name='home'),
    path('profile/<str:username>/', profile.profile_view, name='profile_detail'),
    path('profile/edit/submit/', profile.edit_profile, name='edit_profile'),
    path('p/<str:username>/', profile.profile_view, name='profile'),
    
    # Interações do Perfil
    path('profile/<str:username>/follow/', interactions.toggle_follow, name='toggle_follow'),
    path('start_chat/<str:username>/', chat.start_dm, name='start_chat'),

    # API Auth - APENAS AQUI (remova do bird/urls.py ou mantenha apenas uma)
    path('api/auth/me/', auth.current_user_django, name='current_user_api'),  # Use current_user_django (mais estável)
    
    # Posts
    path('bird/create/', posts.create_bird, name='create_bird'),
    path('bird/<int:bird_id>/', posts.bird_detail, name='bird_detail'),
    path('bird/<int:bird_id>/delete/', posts.delete_bird, name='delete_bird'),
    path('bird/<int:bird_id>/like/', interactions.toggle_like, name='toggle_like'),
    
    # Outros
    path('settings/', settings.settings_view, name='settings'),
    path('login/', auth.login_view, name='login'),
    path('messages/', chat.chat_index, name='chat_index'),
    path('messages/t/<str:username>/', chat.start_dm, name='start_dm'),
    path('messages/<int:room_id>/', chat.chat_room, name='chat_room'),
    path('explore/', discovery.explore_view, name='explore'),
    path('network/', network.network_view, name='network_dashboard'),
    path('groups/', groups.groups_index, name='groups'),
    path('reels/', general.reels_view, name='reels'),
]