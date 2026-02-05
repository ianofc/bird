from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib import messages
from django.conf import settings

# ========================================================
# ⚙️ CONFIGURAÇÕES (SETTINGS CONTROLLER)
# ========================================================

@login_required
def settings_view(request):
    """
    Controlador mestre das configurações.
    Gerencia abas: Conta, Segurança, Privacidade e Aparência.
    """
    user = request.user
    profile = user.profile
    
    # Formulário de senha (instanciado vazios ou com dados POST)
    password_form = PasswordChangeForm(user)

    if request.method == 'POST':
        form_type = request.POST.get('form_type')

        # --- 1. ATUALIZAÇÃO DE CONTA ---
        if form_type == 'account':
            user.email = request.POST.get('email', user.email)
            # Username geralmente não se muda fácil, mas se quiser permitir:
            # user.username = request.POST.get('username', user.username)
            user.save()
            messages.success(request, "Informações da conta salvas!")
            return redirect('settings')

        # --- 2. SEGURANÇA (SENHA) ---
        elif form_type == 'security':
            password_form = PasswordChangeForm(user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                # Importante: Mantém o usuário logado após mudar a senha
                update_session_auth_hash(request, user)
                messages.success(request, "Sua senha foi alterada com sucesso!")
                return redirect('settings')
            else:
                messages.error(request, "Erro ao mudar senha. Verifique os campos.")

        # --- 3. PRIVACIDADE (JSON) ---
        elif form_type == 'privacy':
            # Atualiza o JSONField 'privacy_settings' do Profile
            current_settings = profile.privacy_settings or {}
            
            # Checkboxes HTML não enviam nada se desmarcados, então verificamos a presença
            new_settings = {
                'is_private': request.POST.get('is_private') == 'on',
                'show_activity': request.POST.get('show_activity') == 'on',
                'allow_sharing': request.POST.get('allow_sharing') == 'on'
            }
            
            current_settings.update(new_settings)
            profile.privacy_settings = current_settings
            profile.save()
            messages.success(request, "Preferências de privacidade atualizadas.")
            return redirect('settings')

    # Contexto para renderizar a página (com dados atuais)
    context = {
        'password_form': password_form,
        'privacy': profile.privacy_settings or {},
        'active_tab': request.GET.get('tab', 'account') # Para manter a aba ativa após refresh
    }
    
    return render(request, 'pages/settings.html', context)


# ========================================================
# 🎨 TEMA & APARÊNCIA
# ========================================================

@login_required
def set_theme(request, theme_name):
    """
    Define o tema visual (Light, Dark, Aurora).
    Salva em Cookie (persistência navegador) e Sessão.
    """
    valid_themes = ['light', 'dark', 'aurora', 'midnight']
    
    if theme_name not in valid_themes:
        theme_name = 'aurora' # Default

    # Define onde o usuário estava
    next_url = request.META.get('HTTP_REFERER', 'home')
    response = redirect(next_url)
    
    # 1. Salva na sessão (Backend)
    request.session['theme'] = theme_name
    
    # 2. Salva no Cookie (Frontend/CSS) - Duração de 1 ano
    response.set_cookie('theme', theme_name, max_age=31536000)
    
    messages.success(request, f"Tema alterado para {theme_name.title()}")
    return response


# ========================================================
# ⚠️ ZONA DE PERIGO (DELETAR CONTA)
# ========================================================

@login_required
def delete_account(request):
    """
    Desativa a conta do usuário (Soft Delete).
    Não apagamos dados do banco para segurança/auditoria.
    """
    if request.method == 'POST':
        user = request.user
        user.is_active = False
        user.save()
        messages.warning(request, "Sua conta foi desativada. Sentiremos sua falta!")
        return redirect('login')
    
    # Se tentar acessar via GET, manda de volta pras configs
    return redirect('settings')


# ========================================================
# 🆘 SUPORTE
# ========================================================

@login_required
def support_view(request):
    """Exibe FAQ e Contato"""
    faqs = [
        {'q': 'Como ganho o selo verificado?', 'a': 'O selo é concedido a perfis autênticos e notáveis.'},
        {'q': 'Como criar uma comunidade?', 'a': 'Vá em "Comunidades" > "Nova".'},
        {'q': 'O que é o modo Aurora?', 'a': 'É nosso design exclusivo focado em fluidez visual.'},
    ]
    return render(request, 'pages/support.html', {'faqs': faqs})