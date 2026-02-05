from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils.text import slugify
from django.db.models import Q
from ..models import Community, CommunityMember

# ========================================================
# 👥 LISTAGEM DE COMUNIDADES
# ========================================================

@login_required
def list_groups(request):
    """
    Lista as comunidades do usuário e sugestões de novas.
    """
    user = request.user
    
    # 1. Meus Grupos (onde sou membro)
    my_communities = Community.objects.filter(members=user)
    
    # 2. Sugestões (Grupos onde NÃO sou membro)
    # Exclui os que já participo
    suggestions = Community.objects.exclude(members=user).order_by('-created_at')[:10]

    context = {
        'my_groups': my_communities,
        'suggestions': suggestions,
        'section': 'groups'
    }
    return render(request, 'groups/list.html', context)


# ========================================================
# ➕ CRIAR COMUNIDADE
# ========================================================

@login_required
def create_group(request):
    """
    Cria uma nova comunidade.
    Gera o slug automaticamente baseado no nome.
    """
    if request.method == 'POST':
        name = request.POST.get('name')
        description = request.POST.get('description')
        is_private = request.POST.get('is_private') == 'on'
        capa = request.FILES.get('capa')

        if not name:
            messages.error(request, "O grupo precisa de um nome.")
            return redirect('create_group')

        # Gera Slug único
        original_slug = slugify(name)
        slug = original_slug
        counter = 1
        while Community.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1

        # Cria a Comunidade
        community = Community.objects.create(
            name=name,
            slug=slug,
            description=description,
            is_private=is_private,
            creator=request.user,
            capa=capa
        )

        # Adiciona o criador como ADMIN
        CommunityMember.objects.create(
            community=community,
            user=request.user,
            role='admin'
        )

        messages.success(request, f"Comunidade '{name}' criada com sucesso!")
        return redirect('group_detail', slug=slug)

    return render(request, 'groups/create.html')


# ========================================================
# 👁️ DETALHE DA COMUNIDADE (FEED DO GRUPO)
# ========================================================

@login_required
def group_detail(request, slug):
    """
    Página principal do grupo.
    Mostra informações, membros e futuramente posts do grupo.
    """
    community = get_object_or_404(Community, slug=slug)
    user = request.user

    # Verifica se usuário é membro
    membership = CommunityMember.objects.filter(community=community, user=user).first()
    is_member = membership is not None
    is_admin = membership.role == 'admin' if membership else False

    # Verifica privacidade
    if community.is_private and not is_member:
        can_view_content = False
    else:
        can_view_content = True

    # Busca membros (limitado a 12 para preview)
    members_preview = community.members.all()[:12]

    context = {
        'group': community,
        'is_member': is_member,
        'is_admin': is_admin,
        'can_view': can_view_content,
        'members': members_preview,
        'member_count': community.members.count()
    }
    
    return render(request, 'groups/detail.html', context)


# ========================================================
# 🚀 AÇÕES: ENTRAR E SAIR
# ========================================================

@login_required
def join_group(request, slug):
    community = get_object_or_404(Community, slug=slug)
    
    # Verifica se já é membro
    if CommunityMember.objects.filter(community=community, user=request.user).exists():
        messages.warning(request, "Você já faz parte deste grupo.")
    else:
        CommunityMember.objects.create(community=community, user=request.user, role='member')
        messages.success(request, f"Bem-vindo(a) ao grupo {community.name}!")
        
    return redirect('group_detail', slug=slug)


@login_required
def leave_group(request, slug):
    community = get_object_or_404(Community, slug=slug)
    
    # Verifica se é o criador (não pode sair, teria que deletar ou passar a bola)
    if community.creator == request.user:
        messages.error(request, "O criador não pode sair do grupo. Você deve excluí-lo ou transferir a posse.")
        return redirect('group_detail', slug=slug)

    deleted_count, _ = CommunityMember.objects.filter(community=community, user=request.user).delete()
    
    if deleted_count > 0:
        messages.info(request, f"Você saiu de {community.name}.")
    else:
        messages.warning(request, "Você não era membro deste grupo.")
        
    return redirect('groups')