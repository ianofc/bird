from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

# Importação Segura dos Novos Modelos
try:
    from ..models import Connection, SocialBond, Notification
except ImportError:
    Connection = SocialBond = Notification = None

# ========================================================
# 🌐 REDE PRINCIPAL (DASHBOARD)
# ========================================================

@login_required
def network_view(request):
    """
    Painel central de relacionamentos.
    Lista: Seguidores, Seguindo e Laços Afetivos (Família/Amigos).
    """
    user = request.user
    
    # 1. Dados de Seguir (Twitter Style)
    followers = []
    following = []
    
    if Connection:
        followers_rel = Connection.objects.filter(target=user, status='active').select_related('follower')
        followers = [rel.follower for rel in followers_rel]

        following_rel = Connection.objects.filter(follower=user, status='active').select_related('target')
        following = [rel.target for rel in following_rel]

    # 2. Dados de Laços Afetivos (Facebook/Life Style)
    # Busca laços onde sou o requisitante OU o alvo, mas que estejam ACEITOS
    bonds = []
    connections = [] # Lista de User objects para o template
    
    if SocialBond:
        active_bonds = SocialBond.objects.filter(
            (Q(requester=user) | Q(target=user)) & Q(status='active')
        ).select_related('requester', 'target')
        
        for bond in active_bonds:
            other_user = bond.target if bond.requester == user else bond.requester
            connections.append(other_user) # Adiciona o objeto User

    # 3. Solicitações Pendentes (Contador)
    pending_requests_count = 0
    friend_requests = []
    if SocialBond:
        friend_requests = SocialBond.objects.filter(target=user, status='pending')
        pending_requests_count = friend_requests.count()

    context = {
        'followers': followers,
        'following': following,
        'connections': connections, # Passamos a lista de usuários conectados
        'friend_requests': friend_requests,
        'pending_requests_count': pending_requests_count,
        'section': 'network'
    }
    return render(request, 'pages/network.html', context)


# ========================================================
# 💡 SUGESTÕES (DISCOVERY)
# ========================================================

@login_required
def suggestions_view(request):
    """
    Sugere pessoas baseadas em exclusão (quem eu ainda não sigo).
    """
    suggestions = []
    
    if Connection and SocialBond:
        # Pega IDs de quem eu já sigo
        following_ids = list(Connection.objects.filter(follower=request.user).values_list('target_id', flat=True))
        
        # Pega IDs de quem eu tenho laço (pai, mãe, amigo)
        bonds_ids_1 = SocialBond.objects.filter(requester=request.user).values_list('target_id', flat=True)
        bonds_ids_2 = SocialBond.objects.filter(target=request.user).values_list('requester_id', flat=True)
        
        # Junta todos os IDs "bloqueados" (já conectados)
        exclude_ids = following_ids + list(bonds_ids_1) + list(bonds_ids_2) + [request.user.id]

        # Busca aleatórios que não estão na lista
        suggestions = User.objects.exclude(id__in=exclude_ids).order_by('?')[:20]

    # Como não temos um template separado, renderizamos o network com a aba ativa 'suggestions'
    # Mas se quiser uma view JSON ou parcial, pode adaptar.
    # Aqui, redirecionamos para o dashboard com um parametro (opcional) ou renderizamos.
    return render(request, 'pages/network.html', {'suggestions': suggestions, 'currentTab': 'suggestions'})


# ========================================================
# 📩 SOLICITAÇÕES PENDENTES (REQUESTS)
# ========================================================

@login_required
def requests_view(request):
    """
    Lista pedidos pendentes de Relacionamento (Ex: Alguém pediu para ser seu Pai/Namorado).
    """
    # Redireciona para o dashboard, pois lá já listamos as requests na aba 'requests'
    return redirect('network_dashboard')


# ========================================================
# ⚡ AÇÕES DE LAÇOS (ENVIAR / ACEITAR / RECUSAR)
# ========================================================

@login_required
def request_bond(request, username, bond_type):
    """
    Envia um pedido de relacionamento (Ex: "Quero ser seu Pai", "Quero namorar você").
    """
    target_user = get_object_or_404(User, username=username)
    
    if target_user == request.user:
        messages.error(request, "Você não pode criar um laço consigo mesmo.")
        return redirect('profile_detail', username=username)

    if SocialBond:
        # Verifica se já existe qualquer laço entre os dois
        exists = SocialBond.objects.filter(
            (Q(requester=request.user, target=target_user) | 
             Q(requester=target_user, target=request.user))
        ).exists()

        if exists:
            messages.warning(request, "Já existe um vínculo ou solicitação pendente com este usuário.")
        else:
            # Cria a solicitação
            SocialBond.objects.create(
                requester=request.user,
                target=target_user,
                type=bond_type, # 'father', 'dating', 'friend', etc.
                status='pending'
            )
            
            # Notificação
            if Notification:
                Notification.objects.create(
                    recipient=target_user,
                    sender=request.user,
                    tipo='bond',
                    message=f"enviou uma solicitação de: {bond_type}.",
                    link="/network/" # Link para o dashboard de rede
                )
            
            messages.success(request, f"Solicitação de {bond_type} enviada para @{username}!")

    return redirect('profile_detail', username=username)


@login_required
def manage_bond(request, bond_id, action):
    """
    Aceita ou Rejeita uma solicitação.
    Action: 'accept' ou 'reject'.
    """
    if not SocialBond:
        return redirect('home')

    bond = get_object_or_404(SocialBond, id=bond_id, target=request.user)
    
    if action == 'accept':
        bond.status = 'active'
        bond.save()
        
        # Cria Follow Mútuo Automático (Opcional, mas comum em redes sociais)
        if Connection:
            Connection.objects.get_or_create(follower=request.user, target=bond.requester, status='active')
            Connection.objects.get_or_create(follower=bond.requester, target=request.user, status='active')

        messages.success(request, f"Você aceitou o vínculo com @{bond.requester.username}!")
        
        # Notifica o requisitante que foi aceito
        if Notification:
            Notification.objects.create(
                recipient=bond.requester,
                sender=request.user,
                tipo='bond',
                message=f"aceitou sua solicitação de {bond.get_type_display()}.",
                link=f"/profile/{request.user.username}/"
            )

    elif action == 'reject':
        bond.delete()
        messages.info(request, "Solicitação recusada e removida.")
        
    return redirect('network_dashboard')