from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),

    # Auth e Post (que já fizemos)
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('create-bird/', views.create_bird, name='create_bird'),

    # NOVAS ROTAS
    path('reels/', views.reels_view, name='reels'),
    path('explore/', views.explore_view, name='explore'),
    path('groups/', views.list_groups, name='groups'),
    path('groups/create/', views.create_group, name='create_group'),
    path('groups/<slug:slug>/', views.group_detail, name='group_detail'),
]