# backend/bird/urls.py - CORRIGIDO
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rota de Login
    path('api-token-auth/', views.obtain_auth_token), 
    
    # Rotas da API principal (inclui /api/auth/me/)
    path('api/', include('core.urls')),

]