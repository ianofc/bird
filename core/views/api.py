# Arquivo: bird/social/views/api.py
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.utils import timezone
import json
import random
from datetime import date

# Importação segura do modelo
try:
    from ..models import Notification
except ImportError:
    Notification = None

User = get_user_model()

# ========================================================
# 🔔 NOTIFICAÇÕES (AJAX)
# ========================================================

@login_required
def get_notifications(request):
    """
    Retorna as últimas notificações do usuário formatadas para o frontend.
    """
    if not Notification:
        return JsonResponse({'notifications': [], 'unread_count': 0})

    # Busca as últimas 20 notificações
    notifs = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:20]
    unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    
    data = []
    
    for n in notifs:
        # 1. Definição de Ícones e Cores (Visual)
        icon = "fas fa-bell"
        color = "bg-slate-500"
        
        if n.tipo == 'like':
            icon = "fas fa-heart"
            color = "bg-rose-500"
        elif n.tipo == 'comment':
            icon = "fas fa-comment"
            color = "bg-blue-500"
        elif n.tipo == 'follow':
            icon = "fas fa-user-plus"
            color = "bg-emerald-500"
        elif n.tipo == 'system':
            icon = "fas fa-shield-alt"
            color = "bg-indigo-600"

        # 2. Dados do Ator (Quem gerou a notificação)
        actor_name = "Sistema"
        actor_avatar = "https://ui-avatars.com/api/?name=System&background=334155&color=fff"
        
        if n.sender:
            actor_name = n.sender.get_full_name() or n.sender.username
            # Tenta pegar avatar se o perfil existir
            if hasattr(n.sender, 'profile') and n.sender.profile.avatar:
                actor_avatar = n.sender.profile.avatar.url
            else:
                actor_avatar = f"https://ui-avatars.com/api/?name={n.sender.first_name}&background=random"

        # 3. URL de Destino (Para onde o clique leva)
        url = "#"
        if n.link:
            url = n.link
        elif n.post:
            url = f"/social/post/{n.post.id}/" # Vai para o detalhe do post

        # 4. Formatação da Data (Simples)
        time_diff = timezone.now() - n.created_at
        if time_diff.days > 0:
            time_str = f"{time_diff.days}d atrás"
        elif time_diff.seconds > 3600:
            time_str = f"{time_diff.seconds // 3600}h atrás"
        else:
            time_str = f"{time_diff.seconds // 60}m atrás"

        data.append({
            'id': n.id,
            'actor_name': actor_name,
            'actor_avatar': actor_avatar,
            'message': n.message,
            'time_ago': time_str,
            'icon': icon,
            'color': color,
            'is_read': n.is_read,
            'url': url
        })

    return JsonResponse({'notifications': data, 'unread_count': unread_count})

@login_required
@require_POST
def mark_as_read(request):
    """
    Marca todas as notificações do usuário como lidas.
    """
    if Notification:
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'status': 'ok'})

# ========================================================
# 🤖 INTEGRAÇÃO ZIOS (API)
# ========================================================

def api_zios_chat(request): 
    return JsonResponse({'reply': 'ZIOS Nural Link: Ativo e aguardando comandos.'})

@csrf_exempt
@require_POST
def api_finalize(request):
    """
    Endpoint para criação rápida de contas (Fast-Track) via IA.
    Gera um usuário com matrícula automática.
    """
    try:
        data = json.loads(request.body)
        
        # Gera credenciais únicas
        # Formato: user.XXXXX
        base_id = random.randint(10000, 99999)
        username = f"user.{base_id}"
        
        # Formato Matrícula: ANO + 99 + ID
        matricula = f"{date.today().year}99{base_id}"
        
        # Criação do Usuário
        user = User.objects.create(
            username=username,
            first_name="Novo",
            last_name="Usuário",
            email=f"{matricula}@niocortex.temp", # Email temporário
            is_active=True
        )
        # Senha padrão (Deve ser forçada a troca no primeiro login)
        user.set_password('123456')
        user.save()
        
        return JsonResponse({
            'status': 'success', 
            'matricula': matricula, 
            'username': username,
            'message': 'Usuário criado com sucesso no NioCortex.',
            'redirect': '/social/login/'
        })
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)