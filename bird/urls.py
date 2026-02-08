from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin & Auth
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')), # Login Social/Allauth

    # App Principal (Sem namespace para facilitar {% url 'profile' %})
    path('', include('core.urls')),
]

# Servir arquivos de mídia em modo Debug (Imagens de perfil/posts)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)