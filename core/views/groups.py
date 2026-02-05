from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views

# Importando TODOS os módulos de visualização
from core.views import (
    home,           # Feed e Registro
    posts,          # CRUD de Posts
    profile,        # Perfil e Edição
    network,        # Rede, Sugestões e Solicitações
    discovery,      # Explorar e Reels
    extras,         # Configurações e Temas
    interactions,   # Likes, Comentários, Share (Arquivo Existente)
    groups,         # Comunidades (Arquivo Existente)
    events,         # Eventos (Arquivo Existente)
    chat,           # Mensagens (Arquivo Existente)
    general         # Notificações e Busca Geral (Arquivo Existente)
)

urlpatterns = [
    # ==============================
    # 👮 ADMINISTRAÇÃO
    # ==============================
    path('admin/', admin.site.urls),

    # ==============================
    # 🏠 FEED & AUTH
    # ==============================
    path('', home.home_view, name='home'),
    
    # Autenticação
    path('login/', auth_views.LoginView.as_view(template_name='pages/auth/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('register/', home.register_view, name='register'),

    # ==============================
    # 🦅 POSTS (BIRDS)
    # ==============================
    path('bird/create/', posts.create_bird, name='create_bird'),
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
    # 👤 PERFIL & IDENTIDADE
    # ==============================
    path('profile/edit/', profile.edit_profile, name='edit_profile'),
    path('profile/<str:username>/', profile.profile_view, name='profile_detail'),
    
    # Ações de Bloqueio/Follow rápido
    path('follow/<str:username>/', interactions.toggle_follow, name='toggle_follow'),
    path('block/<str:username>/', interactions.block_user, name='block_user'),

    # ==============================
    # 🌐 REDE (NETWORK)
    # ==============================
    path('network/', network.network_view, name='network_dashboard'),
    path('network/suggestions/', network.suggestions_view, name='network_suggestions'),
    path('network/requests/', network.requests_view, name='network_requests'),
    
    # Gestão de Laços (Família, Namoro, Amigos)
    path('network/connect/<str:username>/<str:bond_type>/', network.request_bond, name='request_bond'),
    path('network/manage/<int:bond_id>/<str:action>/', network.manage_bond, name='manage_bond'),

    # ==============================
    # 🧭 DESCOBERTA & GERAL
    # ==============================
    path('explore/', discovery.explore_view, name='explore'),
    path('reels/', discovery.reels_view, name='reels'),
    
    # Busca e Notificações (Usando seu arquivo general.py existente)
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
    # ⚙️ EXTRAS & CONFIGURAÇÕES
    # ==============================
    path('settings/', extras.settings_view, name='settings'),
    path('settings/delete/', extras.delete_account, name='delete_account'),
    path('support/', extras.support_view, name='support'),
    path('theme/<str:theme_name>/', extras.set_theme, name='set_theme'),
]

# Configuração para servir mídia durante o desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)