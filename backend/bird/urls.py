from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rota de Login (O Frontend chama essa URL exata)
    path('api-token-auth/', views.obtain_auth_token), 
    
    # Rotas da API principal
    path('api/', include('core.urls')), 
]