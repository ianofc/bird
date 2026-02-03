from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.contrib import messages
import json

User = get_user_model()

# Importação Segura dos Modelos
try:
    from ..models import Bird, Connection, Profile, WorkExperience, Education, SocialBond
except ImportError:
    Bird = Connection = Profile = WorkExperience = Education = SocialBond = None

# ========================================================
# 👤 VISUALIZAÇÃO DE PERFIL (DASHBOARD PESSOAL)
# ========================================================

def profile_view(request, username):
    """
    Exibe o perfil completo com Timeline, Sobre, Fotos e Relacionamentos.
    """
    # 1. Resolver o Usuário
    if username == 'me':
        if not request.user.is_authenticated:
            return redirect('login')
        profile_user = request.user
    else:
        profile_user = get_object_or_404(User, username=username)

    # Garante que o perfil existe (devido aos Signals, deve existir, mas segurança nunca é demais)
    try:
        profile = profile_user.profile
    except:
        profile = None

    is_own_profile = (request.user == profile_user)
    
    # 2. Estatísticas
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
        # Conta amigos aceitos (requisitante ou alvo)
        stats['friends_count'] = SocialBond.objects.filter(
            (Q(requester=profile_user) | Q(target=profile_user)) & Q(type='friend', status='active')
        ).count()

    # 3. Estado do Relacionamento (Visitante -> Dono do Perfil)
    relationship_state = {
        'is_following': False,
        'bond_type': None,   # ex: 'friend', 'father'
        'bond_status': None, # ex: 'pending', 'active'
    }

    if request.user.is_authenticated and not is_own_profile:
        # Checa Follow
        if Connection:
            relationship_state['is_following'] = Connection.objects.filter(
                follower=request.user, target=profile_user, status='active'
            ).exists()
        
        # Checa Laços (Família/Amigos/Namoro)
        if SocialBond:
            bond = SocialBond.objects.filter(
                (Q(requester=request.user, target=profile_user) | 
                 Q(requester=profile_user, target=request.user))
            ).first()
            
            if bond:
                relationship_state['bond_type'] = bond.type
                relationship_state['bond_status'] = bond.status

    # 4. Dados Detalhados (Currículo)
    work_history = []
    education_history = []
    family_members = []
    
    if profile:
        work_history = profile.work_experiences.all().order_by('-start_date')
        education_history = profile.education_history.all().order_by('-start_date')
    
    if SocialBond:
        # Busca família (Qualquer laço exceto 'friend' e 'dating' que seja ativo)
        family_bonds = SocialBond.objects.filter(
            (Q(requester=profile_user) | Q(target=profile_user)),
            status='active'
        ).exclude(type__in=['friend', 'dating', 'hookup'])
        
        # Processa para pegar o objeto User do parente
        for bond in family_bonds:
            relative = bond.target if bond.requester == profile_user else bond.requester
            role = bond.get_type_display()
            family_members.append({'user': relative, 'role': role})

    # 5. Feed do Perfil
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
        'relationship': relationship_state,
        # Dados Extras
        'work_history': work_history,
        'education_history': education_history,
        'family_members': family_members,
    }
    
    return render(request, 'pages/profile.html', context)


# ========================================================
# ✏️ EDIÇÃO DE PERFIL (COMPLETA)
# ========================================================

@login_required
def edit_profile(request):
    """
    Processa a edição de perfil, incluindo JSON de interesses e arquivos.
    """
    if request.method == 'POST':
        user = request.user
        profile = user.profile # Garantido pelos Signals

        # --- 1. Dados Básicos (User) ---
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.save()

        # --- 2. Dados do Perfil (Profile) ---
        profile.full_name = request.POST.get('full_name', profile.full_name)
        profile.bio = request.POST.get('bio', profile.bio)
        profile.current_city = request.POST.get('current_city', profile.current_city)
        profile.hometown = request.POST.get('hometown', profile.hometown)
        profile.phone = request.POST.get('phone', profile.phone)
        profile.public_email = request.POST.get('public_email', profile.public_email)
        profile.gender = request.POST.get('gender', profile.gender)
        
        # Datas
        birth_date = request.POST.get('birth_date')
        if birth_date:
            profile.birth_date = birth_date

        # --- 3. Uploads ---
        if request.FILES.get('avatar'):
            profile.avatar = request.FILES.get('avatar')
        if request.FILES.get('cover'):
            profile.cover_image = request.FILES.get('cover')

        # --- 4. Interesses (JSON Packing) ---
        # Captura campos específicos do form e salva no JSONField
        new_interests = {
            'music': request.POST.get('interest_music', ''),
            'movies': request.POST.get('interest_movies', ''),
            'sports': request.POST.get('interest_sports', ''),
            'games': request.POST.get('interest_games', '')
        }
        # Mescla ou sobrescreve (aqui optamos por sobrescrever as chaves enviadas)
        current_interests = profile.interests or {}
        current_interests.update(new_interests)
        profile.interests = current_interests

        profile.save()
        
        messages.success(request, "Perfil atualizado com sucesso!")
        return redirect('profile_detail', username='me')

    # Se for GET, redireciona para o perfil onde o modal de edição geralmente reside
    return redirect('profile_detail', username='me')