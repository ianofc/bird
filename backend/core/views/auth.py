from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# ========================================================
# 🔐 REGISTRO DE USUÁRIO (HTML / Template)
# ========================================================

def register_view(request):
    """
    Cria uma nova conta de usuário, faz o login automático e redireciona.
    Usado pelas páginas HTML do Django (fallback).
    """
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Bem-vindo ao Lyv, @{user.username}!")
            return redirect('home')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{error}")
    else:
        form = UserCreationForm()
    
    return render(request, 'registration/register.html', {'form': form})


# ========================================================
# 🔑 LOGIN (HTML / Template)
# ========================================================

def login_view(request):
    """
    Autentica o usuário via formulário HTML.
    """
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            
            # Redirecionamento inteligente (next url)
            next_url = request.POST.get('next') or request.GET.get('next')
            if next_url and next_url != 'None':
                return redirect(next_url)
            
            return redirect('home')
        else:
            messages.error(request, "Usuário ou senha inválidos.")
    else:
        form = AuthenticationForm()

    return render(request, 'registration/login.html', {'form': form})


# ========================================================
# 🚪 LOGOUT (Geral)
# ========================================================

def logout_view(request):
    if request.user.is_authenticated:
        logout(request)
        messages.info(request, "Você saiu da sua conta.")
    return redirect('login_page')


# ========================================================
# 🔍 API - USUÁRIO LOGADO (React Integration)
# ========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_django(request):
    """
    Retorna os dados do usuário autenticado via Token (DRF).
    Esta é a função que o React chama em /api/auth/me/
    """
    user = request.user
    
    # Tenta pegar o perfil de forma segura (caso ainda não tenha sido criado pelo signal)
    avatar_url = None
    bio_text = ""
    
    if hasattr(user, 'profile'):
        if user.profile.avatar:
            avatar_url = user.profile.avatar.url
        bio_text = user.profile.bio or ""

    # Formata iniciais
    initials = user.username[:2].upper()
    if user.first_name and user.last_name:
        initials = (user.first_name[0] + user.last_name[0]).upper()

    return Response({
        'id': user.id,
        'username': user.username,
        'name': user.get_full_name() or user.username,
        'handle': f"@{user.username}",
        'email': user.email,
        'initials': initials,
        'avatar': avatar_url,
        'bio': bio_text,
        'is_authenticated': True,
        'following': 0, # Placeholder: Implementar lógica de contagem real depois
        'followers': 0, # Placeholder: Implementar lógica de contagem real depois
    })