
from django.contrib import admin
from django.urls import path, include
from core.views import api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', api.login_api, name='api_login'),
]
