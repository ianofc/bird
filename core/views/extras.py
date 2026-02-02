# Arquivo: bird/social/views/extras.py
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages

@login_required
def settings_view(request):
    """
    Página de configurações do usuário.
    """
    if request.method == 'POST':
        # Aqui você pode adicionar lógica para salvar preferências
        messages.success(request, "Configurações salvas com sucesso!")
        return redirect('bird_social:settings_page')
        
    return render(request, 'social/pages/settings.html')

@login_required
def theme_view(request):
    """
    Página de seleção de temas (Claro/Escuro/Neon).
    """
    return render(request, 'social/pages/themes.html')

@login_required
def support_view(request):
    """
    Central de ajuda e suporte.
    """
    return render(request, 'social/pages/support.html')