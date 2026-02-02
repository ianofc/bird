from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from ..models import Community, CommunityMember

@login_required
def list_groups(request):
    # Grupos que eu participo vs Sugestões
    my_groups = request.user.communities.all()
    all_groups = Community.objects.exclude(members=request.user)
    return render(request, 'groups/list.html', {'my_groups': my_groups, 'suggestions': all_groups})

@login_required
def group_detail(request, slug):
    group = get_object_or_404(Community, slug=slug)
    is_member = group.members.filter(id=request.user.id).exists()
    return render(request, 'groups/detail.html', {'group': group, 'is_member': is_member})

@login_required
def create_group(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        slug = name.lower().replace(' ', '-')
        description = request.POST.get('description')
        
        # Cria o grupo
        group = Community.objects.create(
            name=name, slug=slug, description=description, creator=request.user
        )
        # Adiciona o criador como Admin
        CommunityMember.objects.create(community=group, user=request.user, role='admin')
        
        return redirect('group_detail', slug=group.slug)
    
    return render(request, 'groups/create.html')