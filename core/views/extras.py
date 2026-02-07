# core/views/extras.py
import logging
import mercadopago
from django.shortcuts import render, redirect, get_object_or_404  
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib import messages
from django.conf import settings
from django.utils import timezone

# Configuração do Logger de Auditoria via Thalamus
audit_logger = logging.getLogger('audit')

# ========================================================
# 💳 MOTOR DE PAGAMENTOS (MERCADO PAGO)
# ========================================================

@login_required
def create_subscription_payment(request):
    """
    Inicia o checkout para Bird Premium.
    Implementa o Ponto 4 (Integração de Pagamentos).
    """
    if not settings.MERCADOPAGO_ACCESS_TOKEN:
        audit_logger.error(f"Payment failure: Token missing for user {request.user.id}", 
                          extra={'user_id': request.user.id, 'ip': request.META.get('REMOTE_ADDR')})
        messages.error(request, "O sistema de pagamentos está temporariamente indisponível.")
        return redirect('settings')

    sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
    
    # Preferência estruturada para o Plano Aurora
    preference_data = {
        "items": [
            {
                "title": "Bird Premium - Soberania Digital Ativa",
                "quantity": 1,
                "unit_price": 29.90,
                "currency_id": "BRL",
                "category_id": "subscriptions"
            }
        ],
        "payer": {
            "email": request.user.email,
            "first_name": request.user.first_name or request.user.username
        },
        "external_reference": str(request.user.id),
        "notification_url": f"{request.scheme}://{request.get_host()}/payments/webhook/",
        "back_urls": {
            "success": f"{request.scheme}://{request.get_host()}/settings/?tab=account&status=success",
            "failure": f"{request.scheme}://{request.get_host()}/settings/?status=failure",
            "pending": f"{request.scheme}://{request.get_host()}/settings/?status=pending"
        },
        "auto_return": "approved",
    }

    try:
        preference_response = sdk.preference().create(preference_data)
        init_point = preference_response["response"]["init_point"]
        
        audit_logger.info(f"Payment initiated by user {request.user.id}", 
                         extra={'user_id': request.user.id, 'ip': request.META.get('REMOTE_ADDR')})
        
        return redirect(init_point)
    except Exception as e:
        audit_logger.exception(f"Mercado Pago SDK Error: {str(e)}")
        messages.error(request, "Erro ao processar checkout. Tente novamente.")
        return redirect('settings')

# ========================================================
# ⚙️ GESTÃO DE SOBERANIA E CONFIGURAÇÕES
# ========================================================

@login_required
def settings_view(request):
    """
    Módulo central de controle do usuário.
    Garante a soberania pregada pelo Thalamus (Ponto 1 e 3).
    """
    user = request.user
    profile = user.profile
    password_form = PasswordChangeForm(user)

    if request.method == 'POST':
        form_type = request.POST.get('form_type')

        # Log de Auditoria JSON (Ponto 5)
        audit_logger.info(f"Settings update: {form_type} for user {user.username}", 
                         extra={'user_id': user.id, 'ip': request.META.get('REMOTE_ADDR')})

        if form_type == 'account':
            user.email = request.POST.get('email', user.email)
            user.first_name = request.POST.get('first_name', user.first_name)
            user.save()
            messages.success(request, "Dados da conta atualizados com sucesso.")
            return redirect('settings')

        elif form_type == 'security':
            password_form = PasswordChangeForm(user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)
                messages.success(request, "Sua senha foi fortalecida.")
                return redirect('settings')
            messages.error(request, "Erro na validação da senha. Tente novamente.")

        elif form_type == 'privacy':
            # Implementação técnica da Soberania de Dados (Toggle do Thalamus)
            current = profile.privacy_settings or {}
            current.update({
                'is_private': request.POST.get('is_private') == 'on',
                'thalamus_protection': request.POST.get('thalamus_protection') == 'on',
                'sara_indexing': request.POST.get('sara_indexing') == 'on',
                'data_sovereignty_active': True,
                'last_updated': str(timezone.now())
            })
            profile.privacy_settings = current
            profile.save()
            messages.success(request, "Suas chaves de soberania foram atualizadas.")
            return redirect('settings')

    context = {
        'password_form': password_form,
        'privacy': profile.privacy_settings or {},
        'active_tab': request.GET.get('tab', 'account'),
        'mp_ready': bool(settings.MERCADOPAGO_ACCESS_TOKEN)
    }
    return render(request, 'pages/settings.html', context)

# ========================================================
# 🎨 TEMAS E ZONA DE SEGURANÇA
# ========================================================

@login_required
def set_theme(request, theme_name):
    """Ajusta o ambiente visual e loga preferências para o Accumbens."""
    valid = ['light', 'dark', 'aurora', 'midnight']
    theme = theme_name if theme_name in valid else 'aurora'
    
    response = redirect(request.META.get('HTTP_REFERER', 'home'))
    request.session['theme'] = theme
    response.set_cookie('theme', theme, max_age=31536000) # Persistência de 1 ano
    
    audit_logger.info(f"Interface change: {theme} for user {request.user.id}", 
                     extra={'user_id': request.user.id, 'ip': request.META.get('REMOTE_ADDR')})
    return response

@login_required
def delete_account(request):
    """Soft Delete com log de auditoria crítica."""
    if request.method == 'POST':
        user = request.user
        audit_logger.warning(f"DEACTIVATION REQUEST: User {user.id}", 
                            extra={'user_id': user.id, 'ip': request.META.get('REMOTE_ADDR')})
        
        user.is_active = False
        user.save()
        messages.warning(request, "Sua conta foi desativada e seus dados preservados sob sua soberania.")
        return redirect('account_login')
    return redirect('settings')

@login_required
def support_view(request):
    """FAQ focado na transparência do sistema."""
    faqs = [
        {
            'q': 'Como o Thalamus protege meus dados?', 
            'a': 'O Thalamus atua como um firewall de privacidade, impedindo que algoritmos processem seus dados sem seu consentimento explícito.'
        },
        {
            'q': 'O que é a Busca Vibe do SARA?', 
            'a': 'É uma busca semântica que entende o contexto e sentimento, não apenas palavras-chave.'
        },
        {
            'q': 'Posso exportar meus dados?', 
            'a': 'Sim. No painel de soberania, você pode solicitar um dump completo de seus Birds e interações.'
        }
    ]
    return render(request, 'pages/support.html', {'faqs': faqs})