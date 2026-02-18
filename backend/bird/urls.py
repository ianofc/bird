from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rota para obter o Token (Login)
    path('api-token-auth/', views.obtain_auth_token),
    
    # Inclui as rotas do app 'core' com o prefixo 'api/'
    path('api/', include('core.urls')),
]