from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.contrib import messages
import json

# Tenta importar models, evitando erro circular se o projeto estiver iniciando
try:
    from ..models import Bird, Connection, Profile, WorkExperience, Education, SocialBond
except ImportError:
    # Fallback seguro (apenas para evitar crash na importação, em runtime vai precisar dos models)
    Bird = Connection = Profile = WorkExperience = Education = SocialBond = None

User = get_user_model()

# ========================================================
# 👤 VISUALIZAÇÃO DE PERFIL
# ========================================================

@login_required
def profile_view(request, username):
    """
    Exibe o perfil completo do usuário.
    Suporta visualização própria ('me') ou de terceiros.
    """
    # 1. Resolver quem é o usuário do perfil
    if username == 'me' or username == request.user.username:
        profile_user = request.user
    else:
        profile_user = get_object_or_404(User, username=username)

    # Garante que o perfil existe (Signals devem ter criado, mas safety first)
    try:
        profile = profile_user.profile
    except AttributeError:
        # Se não tiver perfil, cria um on-the-fly (fallback de segurança)
        profile = Profile.objects.create(user=profile_user)

    is_own_profile = (request.user == profile_user)
    
    # 2. Estatísticas Sociais
    stats = {
        'followers': 0,
        'following': 0,
        'posts_count': 0,
        'friends_count': 0
    }
    
    if Connection and Bird:
        stats['followers'] = Connection.objects.filter(target=profile_user, status='active').count()
        stats['following'] = Connection.objects.filter(follower=profile_user, status='active').count()
        stats['posts_count'] = Bird.objects.filter(author=profile_user).count()
        
    if SocialBond:
        # Conta amigos (Conexões recíprocas do tipo 'friend')
        # Lógica simplificada: Conta SocialBond ativos onde o usuário participa
        stats['friends_count'] = SocialBond.objects.filter(
            (Q(requester=profile_user) | Q(target=profile_user)),
            status='active',
            type='friend'
        ).count()

    # 3. Estado do Relacionamento (Visitante -> Dono)
    relationship = {
        'is_following': False,
        'is_mutual': False, # Se os dois se seguem
        'bond_type': None,
        'bond_status': None,
    }

    if not is_own_profile and Connection:
        # Verifica Follow
        relationship['is_following'] = Connection.objects.filter(
            follower=request.user, target=profile_user, status='active'
        ).exists()
        
        # Verifica se é mútuo (Ambos se seguem)
        is_followed_back = Connection.objects.filter(
            follower=profile_user, target=request.user, status='active'
        ).exists()
        relationship['is_mutual'] = relationship['is_following'] and is_followed_back

        # Verifica Laços Sociais
        if SocialBond:
            bond = SocialBond.objects.filter(
                (Q(requester=request.user, target=profile_user) | 
                 Q(requester=profile_user, target=request.user))
            ).first()
            if bond:
                relationship['bond_type'] = bond.type
                relationship['bond_status'] = bond.status

    # 4. Dados Complementares (Currículo e Família)
    work_history = profile.work_experiences.all().order_by('-start_date') if hasattr(profile, 'work_experiences') else []
    education_history = profile.education_history.all().order_by('-start_date') if hasattr(profile, 'education_history') else []
    
    family_members = []
    if SocialBond:
        # Busca conexões que NÃO sejam apenas 'friend' ou 'dating' (consideramos família o resto)
        # Ou podemos listar todos os amigos aqui. Vamos listar TODOS os SocialBonds ativos.
        bonds = SocialBond.objects.filter(
            (Q(requester=profile_user) | Q(target=profile_user)),
            status='active'
        )
        for bond in bonds:
            other_user = bond.target if bond.requester == profile_user else bond.requester
            family_members.append({
                'user': other_user,
                'role': bond.get_type_display() # Ex: "Amigo", "Pai", "Namorado"
            })

    # 5. Feed do Perfil (Apenas posts do usuário)
    posts = []
    if Bird:
        posts = Bird.objects.filter(author=profile_user)\
            .exclude(post_type='story')\
            .order_by('-created_at')

    context = {
        'profile_user': profile_user,
        'profile': profile,
        'stats': stats,
        'posts': posts,
        'is_own_profile': is_own_profile,
        'relationship': relationship,
        'work_history': work_history,
        'education_history': education_history,
        'family_members': family_members,
    }
    
    return render(request, 'pages/profile.html', context)


# ========================================================
# ✏️ PROCESSADOR DE EDIÇÃO (BACKEND)
# ========================================================

@login_required
def edit_profile(request):
    """
    Controlador central para edições de perfil.
    Gerencia uploads rápidos (AJAX/Form) e edição completa.
    """
    if request.method == 'POST':
        user = request.user
        profile = user.profile
        action_type = request.POST.get('action_type')

        # --- CASO 1: Upload Rápido de Capa ---
        if action_type == 'update_cover':
            if 'cover_image' in request.FILES:
                profile.cover_image = request.FILES['cover_image']
                profile.save()
                messages.success(request, 'Nova capa definida!')
            return redirect('profile_detail', username=user.username)

        # --- CASO 2: Upload Rápido de Avatar ---
        elif action_type == 'update_avatar':
            if 'avatar' in request.FILES:
                profile.avatar = request.FILES['avatar']
                profile.save()
                messages.success(request, 'Foto de perfil atualizada!')
            return redirect('profile_detail', username=user.username)

        # --- CASO 3: Edição de Informações (Modal/Formulário) ---
        else:
            # Dados do Usuário (Auth)
            if 'first_name' in request.POST: user.first_name = request.POST['first_name']
            if 'last_name' in request.POST: user.last_name = request.POST['last_name']
            user.save()

            # Dados do Perfil
            profile.full_name = request.POST.get('full_name', profile.full_name)
            profile.bio = request.POST.get('bio', profile.bio)
            profile.current_city = request.POST.get('current_city', profile.current_city)
            profile.hometown = request.POST.get('hometown', profile.hometown)
            
            # Atualiza JSON de Interesses (Preservando dados antigos)
            current_interests = profile.interests or {}
            
            # Captura campos específicos se existirem no POST
            if 'music' in request.POST: current_interests['music'] = request.POST['music']
            if 'movies' in request.POST: current_interests['movies'] = request.POST['movies']
            if 'games' in request.POST: current_interests['games'] = request.POST['games']
            
            profile.interests = current_interests
            profile.save()

            messages.success(request, 'Perfil atualizado com sucesso.')
            return redirect('profile_detail', username=user.username)

    # Se acessar via GET, redireciona para o próprio perfil
    return redirect('profile_detail', username=request.user.username)