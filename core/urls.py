from django.urls import path
from core.views import (
    feed, profile, posts, interactions, settings, 
    discovery, chat, events, groups, network, auth, general
)

urlpatterns = [
    # --- Feed & Home ---
    path('', feed.home_view, name='home'),

    # --- Perfis ---
    path('profile/<str:username>/', profile.profile_view, name='profile_detail'),
    path('profile/edit/submit/', profile.edit_profile, name='edit_profile'), # Rota Nova
    path('p/<str:username>/', profile.profile_view, name='profile'), # Alias

    # --- Posts (CRUD) ---
    path('bird/create/', posts.create_bird, name='create_bird'),
    path('bird/<int:bird_id>/', posts.bird_detail, name='bird_detail'),
    path('bird/<int:bird_id>/delete/', posts.delete_bird, name='delete_bird'),
    
    # --- Interações (HTMX) ---
    path('bird/<int:bird_id>/like/', interactions.toggle_like, name='toggle_like'),
    
    # --- Configurações ---
    path('settings/', settings.settings_view, name='settings'),
    
    # --- Auth ---
    path('login/', auth.login_view, name='login'),
    
    # --- Extras ---
    path('explore/', discovery.explore_view, name='explore'),
    path('network/', network.network_view, name='network_dashboard'),
    path('messages/', chat.chat_index, name='chat_index'),
    path('groups/', groups.groups_index, name='groups'),
    path('reels/', general.reels_view, name='reels'),
]