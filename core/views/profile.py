from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.contrib import messages

User = get_user_model()

# Tenta importar os modelos. O try/except evita que o servidor quebre 
# se você ainda não tiver rodado as migrações dos modelos novos (SavedPost, Follow).
try:
    from ..models import Post, Follow, SavedPost
except ImportError:
    Post = Follow = SavedPost = None

# ========================================================
# 👤 VISUALIZAÇÃO DE PERFIL
# ========================================================

@login_required
def meu_perfil(request):
    """
    Redireciona o usuário para a URL pública do seu próprio perfil.
    Ex: /social/profile/me/ -> /social/profile/ian_santos/
    """
    return redirect('bird_social:profile_detail', username=request.user.username)

@login_required
def profile_detail(request, username):
    """
    Exibe o perfil completo: Header (Capa/Avatar), Estatísticas e Feed do usuário.
    """
    profile_user = get_object_or_404(User, username=username)
    is_me = (request.user == profile_user)
    
    # Valores padrão caso os modelos não existam ou não haja dados
    posts = []
    stats = {
        'followers': 0, 
        'following': 0, 
        'posts_count': 0
    }
    is_following = False

    # 1. Busca os Posts deste perfil
    if Post:
        posts = Post.objects.filter(autor=profile_user).order_by('-created_at')
        stats['posts_count'] = posts.count()

    # 2. Busca estatísticas de seguidores (Follow System)
    if Follow:
        stats['followers'] = Follow.objects.filter(user_to=profile_user).count()
        stats['following'] = Follow.objects.filter(user_from=profile_user).count()
        
        # Verifica se o usuário logado segue este perfil (para alternar o botão Seguir/Deixar)
        if not is_me:
            is_following = Follow.objects.filter(user_from=request.user, user_to=profile_user).exists()

    context = {
        'profile_user': profile_user,
        'is_me': is_me,
        'posts': posts,
        'stats': stats,
        'is_following': is_following,
        'section': 'profile'
    }
    return render(request, 'social/profile/profile_detail.html', context)

# ========================================================
# 💾 ITENS SALVOS
# ========================================================

@login_required
def saved_posts(request):
    """
    Lista os posts que o usuário salvou (Favoritos/Bookmarks).
    Rota: /social/profile/me/saved/
    """
    saved_items = []
    if SavedPost:
        # Otimização: select_related traz os dados do post e autor em uma única query
        saved_items = SavedPost.objects.filter(user=request.user).select_related('post', 'post__autor').order_by('-created_at')

    return render(request, 'social/profile/saved_posts.html', {'saved_items': saved_items})

# ========================================================
# ✏️ EDIÇÃO DE PERFIL
# ========================================================

@login_required
def edit_profile_info(request):
    """
    Edita informações básicas (Bio, Foto, Capa, Links).
    Rota: /social/profile/edit/info/
    """
    if request.method == 'POST':
        user = request.user
        
        # 1. Atualiza dados do Modelo User (Django Default)
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        
        if first_name: user.first_name = first_name
        if last_name: user.last_name = last_name
        user.save()

        # 2. Atualiza dados do Modelo Profile (Extensão com Bio/Avatar)
        # Verifica se o usuário tem o atributo 'profile' (OneToOneField)
        if hasattr(user, 'profile'):
            profile = user.profile
            
            # Dados de texto
            bio = request.POST.get('bio')
            website = request.POST.get('website')
            location = request.POST.get('location')
            
            # Arquivos de mídia
            avatar = request.FILES.get('avatar')
            cover = request.FILES.get('cover') 

            if bio is not None: profile.bio = bio
            if website is not None: profile.website = website
            if location is not None: profile.location = location
            if avatar: profile.avatar = avatar
            if cover: profile.capa = cover 
            
            profile.save()

        messages.success(request, "Perfil atualizado com sucesso!")
        return redirect('bird_social:meu_perfil')

    return render(request, 'social/profile/edit_profile.html')