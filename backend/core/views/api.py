from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
import json
import random
from datetime import date

# Rest Framework Imports
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

# Tenta importar o modelo de Notificação. 
try:
    from ..models import Notification
except ImportError:
    Notification = None

User = get_user_model()

# ========================================================
# 🔑 AUTHENTICATION API (REACT / MOBILE)
# ========================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    """
    Endpoint para autenticação via Token. Recebe 'handle' e 'password'.
    """
    handle = request.data.get('handle')
    password = request.data.get('password')

    if not handle or not password:
        return Response({'error': 'Por favor, preencha todos os campos.'}, status=400)

    # Limpeza simples do handle (remove @ se tiver)
    clean_handle = handle.replace('@', '')
    
    # Tenta autenticar
    user = authenticate(username=clean_handle, password=password)

    if user:
        # Cria ou recupera o token para o React
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'handle': f"@{user.username}",
                'initials': (user.first_name[0] if user.first_name else user.username[0]).upper(),
                'following': 0, 
                'followers': 0,
                'color': 'bg-blue-500 text-white'
            }
        })
    else:
        return Response({'error': 'Usuário ou senha inválidos.'}, status=400)


# ========================================================
# 🔔 SISTEMA DE NOTIFICAÇÕES (AJAX / DASHBOARD)
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
            icon, color = get_notification_style(n.tipo)
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

    # CENÁRIO 2: Mock Data (Para testes visuais)
    else:
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
    """Marca todas as notificações do usuário como lidas."""
    if Notification:
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'status': 'ok'})


# ========================================================
# 🤖 INTEGRAÇÃO ZIOS & FAST-TRACK
# ========================================================

def api_zios_chat(request): 
    """Stub para futuro chatbot Aurora Link."""
    return JsonResponse({'reply': 'ZIOS Nural Link: Sistema Aurora operante.'})


@csrf_exempt
@require_POST
def api_finalize(request):
    """Criação rápida de usuários (Fast-Track)."""
    try:
        body_data = json.loads(request.body)
        
        base_id = random.randint(10000, 99999)
        username = f"user.{base_id}"
        matricula = f"{date.today().year}{base_id}"
        
        user = User.objects.create(
            username=username,
            first_name="Novo",
            last_name="Usuário",
            email=f"{username}@bird.social",
            is_active=True
        )
        user.set_password('bird123') 
        user.save()
        
        return JsonResponse({
            'status': 'success', 
            'username': username,
            'matricula': matricula,
            'message': 'Conta Fast-Track criada.',
            'redirect': '/login/'
        })
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


# ========================================================
# 🛠️ UTILITÁRIOS INTERNOS
# ========================================================

def get_notification_style(type):
    """Retorna o estilo visual (ícone/cor) da notificação."""
    styles = {
        'like': ("fas fa-heart", "text-rose-500 bg-rose-50"),
        'comment': ("fas fa-comment", "text-blue-500 bg-blue-50"),
        'follow': ("fas fa-user-plus", "text-emerald-500 bg-emerald-50"),
        'system': ("fas fa-shield-alt", "text-slate-500 bg-slate-100"),
    }
    return styles.get(type, ("fas fa-bell", "text-slate-500 bg-slate-100"))


def format_time_ago(timestamp):
    """Calcula o tempo decorrido de forma amigável."""
    diff = timezone.now() - timestamp
    if diff.days > 0:
        return f"{diff.days}d"
    elif diff.seconds > 3600:
        return f"{diff.seconds // 3600}h"
    elif diff.seconds > 60:
        return f"{diff.seconds // 60}m"
    return "Agora"