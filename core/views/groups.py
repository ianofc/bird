from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils.text import slugify
from django.db import IntegrityError
from django.db.models import Q
from ..models import Community, CommunityMember

# ========================================================
# 👥 LISTAGEM DE GRUPOS
# ========================================================

@login_required
def list_groups(request):
    """
    Exibe os grupos do usuário e sugestões de novos grupos.
    """
    # 1. Identifica os grupos que o usuário já participa
    my_ids = CommunityMember.objects.filter(user=request.user).values_list('community_id', flat=True)
    
    meus_grupos = Community.objects.filter(id__in=my_ids)
    
    # 2. Sugere grupos que ele NÃO participa (Aleatórios)
    sugestoes = Community.objects.exclude(id__in=my_ids).order_by('?')[:6]

    context = {
        'meus_grupos': meus_grupos,
        'sugestoes': sugestoes
    }
    return render(request, 'groups/list.html', context)


# ========================================================
# 🔍 DETALHES DO GRUPO
# ========================================================

@login_required
def group_detail(request, slug):
    """
    Página principal de um grupo (Feed e Info).
    """
    group = get_object_or_404(Community, slug=slug)
    
    # Verifica status de membro para mostrar botão "Entrar" ou "Sair"
    membership = CommunityMember.objects.filter(community=group, user=request.user).first()
    
    is_member = membership is not None
    is_admin = membership.role == 'admin' if membership else False

    context = {
        'group': group,
        'is_member': is_member,
        'is_admin': is_admin,
    }
    return render(request, 'groups/detail.html', context)


# ========================================================
# ➕ CRIAÇÃO DE GRUPO
# ========================================================

@login_required
def create_group(request):
    """
    Processa a criação de uma nova comunidade.
    """
    if request.method == 'POST':
        name = request.POST.get('name')
        description = request.POST.get('description')
        cover = request.FILES.get('cover')
        
        # Checkbox retorna 'on' se marcado, None se não
        is_private = request.POST.get('is_private') == 'on' 

        # Validação Básica
        if not name:
            messages.error(request, "O nome do grupo é obrigatório.")
            return render(request, 'groups/create.html')

        # Geração de Slug Segura
        slug = slugify(name)
        if not slug: 
            slug = f"group-{request.user.id}-{len(name)}"

        try:
            # 1. Cria a Comunidade no Banco
            group = Community.objects.create(
                name=name,
                slug=slug,
                description=description,
                creator=request.user,
                capa=cover,
                is_private=is_private
            )

            # 2. Adiciona o Criador como Admin (Crucial)
            CommunityMember.objects.create(
                community=group, 
                user=request.user, 
                role='admin'
            )

            messages.success(request, f"Comunidade '{name}' criada com sucesso!")
            return redirect('group_detail', slug=group.slug)

        except IntegrityError:
            messages.error(request, "Já existe um grupo com este nome. Tente ser mais criativo!")
            return render(request, 'groups/create.html')

    return render(request, 'groups/create.html')


# ========================================================
# 🚀 AÇÕES (ENTRAR / SAIR)
# ========================================================

@login_required
def join_group(request, slug):
    """
    Permite ao usuário entrar em um grupo público.
    """
    group = get_object_or_404(Community, slug=slug)
    
    # Evita duplicidade
    if not CommunityMember.objects.filter(community=group, user=request.user).exists():
        
        # Se for privado, futuramente poderíamos criar um status 'pending'
        # Por enquanto, entra direto
        CommunityMember.objects.create(
            community=group,
            user=request.user,
            role='member'
        )
        messages.success(request, f"Bem-vindo(a) ao grupo {group.name}!")
    else:
        messages.info(request, "Você já faz parte deste grupo.")
    
    return redirect('group_detail', slug=slug)

@login_required
def leave_group(request, slug):
    """
    Permite ao usuário sair de um grupo.
    """
    group = get_object_or_404(Community, slug=slug)
    
    # Remove a relação
    membership = CommunityMember.objects.filter(community=group, user=request.user)
    
    if membership.exists():
        # Impede que o único admin saia sem passar o bastão (opcional, mas boa prática)
        # Por enquanto, remove direto
        membership.delete()
        messages.info(request, f"Você saiu de {group.name}.")
    
    return redirect('groups')