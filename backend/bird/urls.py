from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken import views as drf_views

# Importamos todas as nossas visões mágicas
from core import api_views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 🔐 DRF Token Auth (Login)
    path('api-token-auth/', drf_views.obtain_auth_token, name='api-token-auth'),

    # ==========================================
    # 🌐 REST API (React Frontend)
    # ==========================================
    
    # --- Auth & Perfil ---
    path('api/auth/register/', api_views.api_register, name='api-register'),
    path('api/auth/me/', api_views.api_me, name='api-me'),
    path('api/auth/profile/', api_views.api_update_profile, name='api-update-profile'),
    
    # --- Feed & Posts (Momentos) ---
    path('api/feed/', api_views.api_feed, name='api-feed'),
    path('api/lyvs/', api_views.api_create_lyv, name='api-create-lyv'),
    path('api/lyvs/<int:lyv_id>/', api_views.api_lyv_detail, name='api-lyv-detail'),
    path('api/lyvs/<int:lyv_id>/delete/', api_views.api_delete_lyv, name='api-delete-lyv'),
    path('api/lyvs/<int:lyv_id>/like/', api_views.api_toggle_like, name='api-like'),
    path('api/lyvs/<int:lyv_id>/save/', api_views.api_toggle_save, name='api-save'),
    path('api/lyvs/<int:lyv_id>/comments/', api_views.api_comments, name='api-comments'),
    
    # --- Social & Rede ---
    path('api/users/<str:username>/', api_views.api_profile, name='api-profile'),
    path('api/users/<str:username>/posts/', api_views.api_user_posts, name='api-user-posts'),
    path('api/users/<str:username>/follow/', api_views.api_toggle_follow, name='api-follow'),
    
    # --- TAS & Íris (Descoberta e Busca Universal) ---
    path('api/suggested/', api_views.api_suggested_users, name='api-suggested'),
    path('api/search/', api_views.api_search, name='api-search'),
    path('api/trending/', api_views.api_trending, name='api-trending'),
    path('api/explore/', api_views.api_explore_posts, name='api-explore'),
    
    # --- Heimdall (Segurança e Notificações) ---
    path('api/notifications/', api_views.api_notifications, name='api-notifications'),
    path('api/notifications/read/', api_views.api_mark_notifications_read, name='api-notif-read'),
    
    # --- Gaia (O Mensageiro) ---
    path('api/chat/rooms/', api_views.api_chat_rooms, name='api-chat-rooms'),
    path('api/chat/rooms/<int:room_id>/messages/', api_views.api_chat_messages, name='api-chat-messages'),
    path('api/chat/start-dm/', api_views.api_start_dm, name='api-start-dm'),
    
    # --- Stories (O Agora) ---
    path('api/stories/', api_views.api_stories, name='api-stories'),

    # --- Canais (Lives e Transmissões) ---
    path('api/streams/', api_views.api_active_streams, name='api-streams'),

    # --- Marketplace (A Loja) ---
    path('api/marketplace/', api_views.api_marketplace, name='api-marketplace'),
]

# Libera o Django para servir as imagens e vídeos (Media) em ambiente de desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)