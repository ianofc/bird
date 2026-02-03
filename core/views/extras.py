from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.http import require_POST

# ========================================================
# ⚙️ CONFIGURAÇÕES (SETTINGS)
# ========================================================

@login_required
def settings_view(request):
    """
    Painel de controle do usuário.
    Gerencia: Perfil, Segurança, Preferências e Notificações.
    """
    if request.method == 'POST':
        form_type = request.POST.get('form_type')

        # 1. Atualização de Perfil Básico
        if form_type == 'profile':
            user = request.user
            user.first_name = request.POST.get('first_name', user.first_name)
            user.last_name = request.POST.get('last_name', user.last_name)
            user.email = request.POST.get('email', user.email)
            user.save()
            messages.success(request, "Perfil atualizado com sucesso!")

        # 2. Atualização de Senha/Segurança (Stub)
        elif form_type == 'security':
            # Aqui entraria a lógica de PasswordChangeForm
            messages.info(request, "Solicitação de alteração de senha enviada para o email.")

        # 3. Preferências de Notificação (Stub)
        elif form_type == 'notifications':
            # Aqui salvaria no model Profile
            messages.success(request, "Preferências de notificação salvas.")

        return redirect('settings')
        
    return render(request, 'pages/settings.html')


# ========================================================
# 🎨 TEMAS E APARÊNCIA
# ========================================================

@login_required
def set_theme(request, theme_name):
    """
    Alterna o tema visual e salva na sessão do usuário.
    Opções: 'light', 'dark', 'aurora'
    """
    valid_themes = ['light', 'dark', 'aurora']
    
    if theme_name in valid_themes:
        # Salva na sessão (persistência temporária)
        # O ideal é salvar no Profile do banco de dados também
        request.session['theme'] = theme_name
        messages.success(request, f"Tema alterado para {theme_name.title()}!")
    
    # Redireciona para a página de onde o usuário veio
    return redirect(request.META.get('HTTP_REFERER', 'home'))


# ========================================================
# 🆘 SUPORTE E AJUDA
# ========================================================

@login_required
def support_view(request):
    """
    Central de ajuda com FAQs e contato.
    """
    # Dados Mockados de FAQ para a UI
    faqs = [
        {
            'question': 'Como criar um novo Grupo?',
            'answer': 'Vá até a aba "Comunidades" no menu lateral e clique no botão "Criar Grupo".'
        },
        {
            'question': 'Como funciona o upload de vídeos?',
            'answer': 'Clique no ícone de vídeo na caixa de criação. Seu vídeo será processado em segundo plano e aparecerá no feed em breve.'
        },
        {
            'question': 'O que é o NioCortex?',
            'answer': 'É a inteligência artificial integrada ao Bird que ajuda a organizar seu conteúdo e sugerir conexões.'
        },
        {
            'question': 'Como mudar meu tema para Aurora?',
            'answer': 'Acesse Configurações > Aparência e selecione o tema "Aurora Glass".'
        }
    ]

    return render(request, 'pages/support.html', {'faqs': faqs})