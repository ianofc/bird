from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.shortcuts import get_object_or_404, redirect, render

from core.models import Bird, Room, SavedPost


def _decorate_group(room):
    room.slug = str(room.id)
    room.capa = room.icon
    room.is_private = bool(room.permissions.get('is_private', False)) if isinstance(room.permissions, dict) else False
    room.creator = room.admins.first() or room.participants.first()
    room.member_count = room.participants.count()
    room.members = room.participants
    return room


@login_required
def groups_index(request):
    meus_grupos = [
        _decorate_group(room)
        for room in request.user.chat_rooms.filter(type='group').prefetch_related('participants', 'admins').order_by('-updated_at')
    ]

    sugestoes = [
        _decorate_group(room)
        for room in Room.objects.filter(type='group').exclude(participants=request.user).prefetch_related('participants', 'admins').annotate(total_members=Count('participants')).order_by('-total_members', '-created_at')[:12]
    ]

    return render(request, 'groups/list.html', {'meus_grupos': meus_grupos, 'sugestoes': sugestoes})


@login_required
def create_group(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        description = request.POST.get('description', '').strip()
        is_private = bool(request.POST.get('is_private'))
        cover = request.FILES.get('cover')

        if not name:
            messages.warning(request, 'Informe um nome para o grupo.')
            return redirect('groups')

        room = Room.objects.create(
            name=name,
            type='group',
            description=description,
            icon=cover,
            permissions={'is_private': is_private},
        )
        room.participants.add(request.user)
        room.admins.add(request.user)
        messages.success(request, f'Grupo "{name}" criado com sucesso!')
        return redirect('group_detail', group_id=room.id)

    return render(request, 'groups/create.html')


@login_required
def group_detail(request, group_id: int):
    group = get_object_or_404(Room.objects.filter(type='group').prefetch_related('participants__profile', 'admins'), id=group_id)
    group = _decorate_group(group)
    is_member = group.participants.filter(id=request.user.id).exists()
    can_view = is_member or not group.is_private

    posts = Bird.objects.filter(author__in=group.participants.all()).select_related('author', 'author__profile').order_by('-created_at')[:40] if can_view else []

    context = {
        'group': group,
        'is_member': is_member,
        'can_view': can_view,
        'members': group.participants.all()[:120],
        'member_count': group.member_count,
        'posts': posts,
        'saved_post_ids': set(SavedPost.objects.filter(user=request.user).values_list('post_id', flat=True)),
    }
    return render(request, 'groups/detail.html', context)


@login_required
def join_group(request, group_id: int):
    group = get_object_or_404(Room, id=group_id, type='group')
    group.participants.add(request.user)
    messages.success(request, f'Você entrou no grupo {group.name}.')
    return redirect('group_detail', group_id=group.id)


@login_required
def leave_group(request, group_id: int):
    group = get_object_or_404(Room, id=group_id, type='group')
    group.participants.remove(request.user)
    group.admins.remove(request.user)
    messages.info(request, f'Você saiu do grupo {group.name}.')
    return redirect('groups')
