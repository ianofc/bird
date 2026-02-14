from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# Importamos o arquivo de views de API que acabamos de criar
from core.views import api 

urlpatterns = [
    # ==========================================
    # 1. ADMIN & AUTH (SSR)
    # ==========================================
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')), # Login Social / Web Padrão

    # ==========================================
    # 2. API ENDPOINTS (React / Mobile / AJAX)
    # ==========================================
    path('api/auth/login/', api.login_api, name='api_login'),
    path('api/notifications/', api.get_notifications, name='api_notifications'),
    path('api/notifications/read/', api.mark_as_read, name='api_mark_read'),
    path('api/zios/chat/', api.api_zios_chat, name='api_zios_chat'),
    path('api/fast-track/finalize/', api.api_finalize, name='api_fast_track'),

    # ==========================================
    # 3. APP PRINCIPAL (Core / Zios)
    # ==========================================
    path('', include('core.urls')),
]

# Servir arquivos de mídia e estáticos em modo Debug
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)