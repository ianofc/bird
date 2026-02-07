import logging
import mercadopago
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib import messages
from django.conf import settings
from django.http import JsonResponse

# Configuração do Logger de Auditoria (Ponto 5 da sua lista)
audit_logger = logging.getLogger('audit')

# ========================================================
# 💳 INTEGRAÇÃO DE PAGAMENTOS (Ponto 4)
# ========================================================

@login_required
def create_subscription_payment(request):
    """
    Inicia o fluxo de pagamento para assinaturas premium ou impulsionamento.
    Ativa o Mercado Pago já presente nos requisitos.
    """
    if not settings.MERCADOPAGO_ACCESS_TOKEN:
        messages.error(request, "Serviço de pagamento não configurado.")
        return redirect('settings')

    sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
    
    # Exemplo de preferência para "Plano Aurora Premium"
    preference_data = {
        "items": [
            {
                "title": "Bird Premium - Soberania Digital",
                "quantity": 1,
                "unit_price": 29.90,
                "currency_id": "BRL"
            }
        ],
        "payer": {
            "email": request.user.email
        },
        "external_reference": str(request.user.id),
        "notification_url": f"{request.scheme}://{request.get_host()}/payments/webhook/",
        "back_urls": {
            "success": f"{request.scheme}://{request.get_host()}/settings/?tab=account",
            "failure": f"{request.scheme}://{request.get_host()}/settings/",
        },
        "auto_return": "approved",
    }

    preference_response = sdk.preference().create(preference_data)
    preference = preference_response["response"]
    
    # Redireciona para o Checkout do Mercado Pago
    return redirect(preference["init_point"])

# ========================================================
# ⚙️ CONFIGURAÇÕES MESTRE (Ponto 1 e 3)
# ========================================================

@login_required
def settings_view(request):
    user = request.user
    profile = user.profile
    password_form = PasswordChangeForm(user)

    if request.method == 'POST':
        form_type = request.POST.get('form_type')

        # Auditoria via Thalamus (Ponto 5)
        audit_logger.info(f"User {user.id} accessed {form_type} settings update", 
                         extra={'user_id': user.id, 'ip': request.META.get('REMOTE_ADDR')})

        if form_type == 'account':
            user.email = request.POST.get('email', user.email)
            user.save()
            messages.success(request, "Informações da conta salvas!")
            return redirect('settings')

        elif form_type == 'security':
            password_form = PasswordChangeForm(user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)
                messages.success(request, "Senha alterada com sucesso!")
                return redirect('settings')

        elif form_type == 'privacy':
            # Implementação da Soberania de Dados (Ponto 3)
            current_settings = profile.privacy_settings or {}
            new_settings = {
                'is_private': request.POST.get('is_private') == 'on',
                'data_sovereignty': request.POST.get('data_sovereignty') == 'on', # Thalamus Toggle
                'allow_ai_training': request.POST.get('allow_ai_training') == 'on'
            }
            current_settings.update(new_settings)
            profile.privacy_settings = current_settings
            profile.save()
            messages.success(request, "Preferências de soberania e privacidade atualizadas.")
            return redirect('settings')

    context = {
        'password_form': password_form,
        'privacy': profile.privacy_settings or {},
        'active_tab': request.GET.get('tab', 'account'),
        'mp_enabled': bool(settings.MERCADOPAGO_ACCESS_TOKEN)
    }
    return render(request, 'pages/settings.html', context)

# ========================================================
# 🎨 TEMA & APARÊNCIA
# ========================================================

@login_required
def set_theme(request, theme_name):
    valid_themes = ['light', 'dark', 'aurora', 'midnight']
    theme_name = theme_name if theme_name in valid_themes else 'aurora'
    
    next_url = request.META.get('HTTP_REFERER', 'home')
    response = redirect(next_url)
    request.session['theme'] = theme_name
    response.set_cookie('theme', theme_name, max_age=31536000)
    
    # Log de preferência estética para o motor Accumbens
    audit_logger.info(f"User {request.user.id} changed theme to {theme_name}", 
                     extra={'user_id': request.user.id, 'ip': request.META.get('REMOTE_ADDR')})
    
    return response

# ========================================================
# ⚠️ ZONA DE PERIGO (SOFT DELETE)
# ========================================================

@login_required
def delete_account(request):
    if request.method == 'POST':
        user = request.user
        # Log Crítico de Auditoria (Ponto 5)
        audit_logger.warning(f"CRITICAL: User {user.id} requested account deactivation", 
                            extra={'user_id': user.id, 'ip': request.META.get('REMOTE_ADDR')})
        
        user.is_active = False
        user.save()
        messages.warning(request, "Sua conta Bird foi desativada.")
        return redirect('account_login')
    return redirect('settings')

# ========================================================
# 🆘 SUPORTE (Ponto 3 - Transparência Thalamus)
# ========================================================

@login_required
def support_view(request):
    faqs = [
        {'q': 'O que é a Soberania Thalamus?', 'a': 'É o seu controle total. Você decide se a IA processa seus dados ou não.'},
        {'q': 'Meus dados são vendidos?', 'a': 'Não. O Bird lucra com assinaturas e impulsionamentos éticos, não com seus dados.'},
        {'q': 'Como funciona o Mercado Pago no Bird?', 'a': 'Usamos para transações seguras de assinaturas e suporte a criadores.'},
    ]
    return render(request, 'pages/support.html', {'faqs': faqs})