from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken import views as drf_views
from core import api_views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # === REST API (React Frontend) ===
    path('api/auth/login/', drf_views.obtain_auth_token, name='api-login'),
    path('api/auth/register/', api_views.api_register, name='api-register'),
    path('api/auth/me/', api_views.api_me, name='api-me'),
    
    path('api/feed/', api_views.api_feed, name='api-feed'),
    path('api/birds/', api_views.api_create_bird, name='api-create-bird'),
    path('api/birds/<int:bird_id>/like/', api_views.api_toggle_like, name='api-like'),
    
    # Páginas legado (se existirem)
    path('', include('core.urls')),
]

# Servir imagens de upload durante o desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)