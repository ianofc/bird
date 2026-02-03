from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.utils import timezone
import json
import random
from datetime import date

# Tenta importar o modelo de Notificação. 
# Se não existir ainda, o sistema usa Mock Data para não quebrar o frontend.
try:
    from ..models import Notification
except ImportError:
    Notification = None

User = get_user_model()

# ========================================================
# 🔔 SISTEMA DE NOTIFICAÇÕES (AJAX)
# ========================================================

@login_required
@require_GET
def get_notifications(request):
    """
    Retorna as últimas notificações. Se o model não existir, retorna dados de teste.
    """
    data = []
    unread_count = 0

    # CENÁRIO 1: O Modelo Existe (Produção)
    if Notification:
        notifs = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:20]
        unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()

        for n in notifs:
            # Lógica visual de ícones
            icon, color = get_notification_style(n.tipo)
            
            # Formata tempo
            time_str = format_time_ago(n.created_at)

            data.append({
                'id': n.id,
                'actor_name': n.sender.username if n.sender else "Sistema",
                'actor_avatar': n.sender.profile.avatar.url if (n.sender and n.sender.profile.avatar) else f"https://ui-avatars.com/api/?name={n.sender.username if n.sender else 'Sys'}&background=random",
                'message': n.message,
                'time_ago': time_str,
                'icon': icon,
                'color': color,
                'is_read': n.is_read,
                'url': n.link if n.link else "#"
            })

    # CENÁRIO 2: Mock Data (Para testes visuais quando não há dados)
    else:
        # Apenas para você ver o menu funcionando bonito
        unread_count = 2
        data = [
            {
                'id': 1,
                'actor_name': 'Zios AI',
                'actor_avatar': 'https://ui-avatars.com/api/?name=Zios&background=6366f1&color=fff',
                'message': 'Bem-vindo ao Bird! Sua conta foi configurada.',
                'time_ago': 'Agora',
                'icon': 'fas fa-robot',
                'color': 'text-indigo-500 bg-indigo-50',
                'is_read': False,
                'url': '#'
            },
            {
                'id': 2,
                'actor_name': 'Equipe Bird',
                'actor_avatar': 'https://ui-avatars.com/api/?name=Bird&background=0f172a&color=fff',
                'message': 'Novo recurso: Grupos e Comunidades disponíveis.',
                'time_ago': '1h atrás',
                'icon': 'fas fa-layer-group',
                'color': 'text-blue-500 bg-blue-50',
                'is_read': False,
                'url': '/groups/'
            }
        ]

    return JsonResponse({'notifications': data, 'unread_count': unread_count})


@login_required
@require_POST
def mark_as_read(request):
    """
    Marca todas como lidas.
    """
    if Notification:
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'status': 'ok'})


# ========================================================
# 🛠️ UTILITÁRIOS INTERNOS
# ========================================================

def get_notification_style(type):
    """Retorna (Icon Class, Color Class) baseado no tipo"""
    if type == 'like':
        return "fas fa-heart", "text-rose-500 bg-rose-50"
    elif type == 'comment':
        return "fas fa-comment", "text-blue-500 bg-blue-50"
    elif type == 'follow':
        return "fas fa-user-plus", "text-emerald-500 bg-emerald-50"
    elif type == 'system':
        return "fas fa-shield-alt", "text-slate-500 bg-slate-100"
    return "fas fa-bell", "text-slate-500 bg-slate-100"

def format_time_ago(timestamp):
    diff = timezone.now() - timestamp
    if diff.days > 0:
        return f"{diff.days}d"
    elif diff.seconds > 3600:
        return f"{diff.seconds // 3600}h"
    elif diff.seconds > 60:
        return f"{diff.seconds // 60}m"
    return "Agora"


# ========================================================
# 🤖 INTEGRAÇÃO ZIOS & FAST-TRACK
# ========================================================

def api_zios_chat(request): 
    """Stub para futuro chatbot"""
    return JsonResponse({'reply': 'ZIOS Nural Link: Sistema Aurora operante.'})

@csrf_exempt
@require_POST
def api_finalize(request):
    """
    Criação rápida de usuários (Ex: Via App Mobile ou Totem).
    """
    try:
        body_data = json.loads(request.body)
        
        # Gera identidade única
        base_id = random.randint(10000, 99999)
        username = f"user.{base_id}"
        matricula = f"{date.today().year}{base_id}"
        
        # Cria usuário
        user = User.objects.create(
            username=username,
            first_name="Novo",
            last_name="Usuário",
            email=f"{username}@bird.social",
            is_active=True
        )
        user.set_password('bird123') # Senha temporária padrão
        user.save()
        
        # Cria perfil associado se necessário (dependendo do signals.py)
        # Profile.objects.create(user=user) 
        
        return JsonResponse({
            'status': 'success', 
            'username': username,
            'matricula': matricula,
            'message': 'Conta Fast-Track criada.',
            'redirect': '/login/'
        })
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)