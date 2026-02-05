import os

# ==============================================================================
# 1. CONTEÚDO: core/views/posts.py
# ==============================================================================
posts_view_code = """from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from ..models import Bird

@login_required
def create_bird(request):
    if request.method == 'POST':
        content = request.POST.get('content')
        image = request.FILES.get('image')
        video = request.FILES.get('video')

        # Validação básica
        if not content and not image and not video:
            messages.error(request, 'Sua publicação não pode estar vazia.')
            return redirect('create_bird')

        # Cria o objeto Bird
        bird = Bird(author=request.user)
        bird.content = content

        # Lógica de Tipo de Post
        if video:
            bird.video = video
            bird.post_type = 'video'
            bird.is_processing = False 
        elif image:
            bird.image = image
            bird.post_type = 'image'
        else:
            bird.post_type = 'text'

        bird.save()
        messages.success(request, 'Publicado com sucesso!')
        return redirect('home')

    return render(request, 'pages/create_bird.html')

@login_required
def bird_detail(request, bird_id):
    bird = get_object_or_404(Bird, id=bird_id)
    return render(request, 'pages/bird_detail.html', {'bird': bird})

@login_required
def delete_bird(request, bird_id):
    bird = get_object_or_404(Bird, id=bird_id)
    if request.user == bird.author:
        bird.delete()
        messages.success(request, 'Publicação removida.')
    return redirect('home')
"""

# ==============================================================================
# 2. CONTEÚDO: templates/pages/create_bird.html
# ==============================================================================
create_bird_html = """{% extends 'layout/base_bird.html' %}
{% load static %}

{% block main_content %}
<div class="flex-1 h-full overflow-y-auto no-scrollbar bg-slate-100/50 flex justify-center pt-10">
    
    <div class="w-full max-w-[600px] px-4">
        
        <div class="flex items-center gap-4 mb-6">
            <a href="{% url 'home' %}" class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 hover:bg-slate-200 transition shadow-sm">
                <i class="fas fa-arrow-left"></i>
            </a>
            <h1 class="text-2xl font-black text-slate-800">Criar Publicação</h1>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" 
             x-data="postCreator()">
            
            <form action="." method="POST" enctype="multipart/form-data">
                {% csrf_token %}

                <div class="flex items-center gap-3 p-4">
                    <div class="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                        {% if user.profile.avatar %}
                            <img src="{{ user.profile.avatar.url }}" class="w-full h-full object-cover">
                        {% else %}
                            <img src="https://ui-avatars.com/api/?name={{ user.username }}" class="w-full h-full object-cover">
                        {% endif %}
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-900">{{ user.profile.full_name|default:user.username }}</h3>
                        <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-600">
                            <i class="fas fa-globe-americas"></i> Público
                        </div>
                    </div>
                </div>

                <div class="px-4">
                    <textarea name="content" 
                              rows="4" 
                              class="w-full border-none focus:ring-0 text-xl placeholder-slate-400 resize-none p-0" 
                              placeholder="No que você está pensando, {{ user.first_name }}?"></textarea>
                </div>

                <div class="px-4 pb-2" x-show="mediaPreview">
                    <div class="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <button type="button" @click="clearMedia()" class="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-50 transition">
                            <i class="fas fa-times"></i>
                        </button>

                        <template x-if="mediaType === 'image'">
                            <img :src="mediaPreview" class="w-full h-auto max-h-[400px] object-cover">
                        </template>

                        <template x-if="mediaType === 'video'">
                            <video :src="mediaPreview" controls class="w-full h-auto max-h-[400px] bg-black"></video>
                        </template>
                    </div>
                </div>

                <div class="mx-4 mb-4 p-3 border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                    <span class="text-sm font-bold text-slate-700 ml-2">Adicionar ao post</span>
                    
                    <div class="flex gap-2">
                        <div class="relative group cursor-pointer">
                            <div class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-green-500 text-xl" title="Foto">
                                <i class="fas fa-images"></i>
                            </div>
                            <input type="file" name="image" accept="image/*" 
                                   class="absolute inset-0 opacity-0 cursor-pointer"
                                   @change="handleFile($event, 'image')">
                        </div>

                        <div class="relative group cursor-pointer">
                            <div class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-rose-500 text-xl" title="Vídeo">
                                <i class="fas fa-video"></i>
                            </div>
                            <input type="file" name="video" accept="video/*" 
                                   class="absolute inset-0 opacity-0 cursor-pointer"
                                   @change="handleFile($event, 'video')">
                        </div>

                        <div class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-red-500 text-xl cursor-not-allowed opacity-50">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                    </div>
                </div>

                <div class="p-4 pt-0">
                    <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-200 active:scale-95">
                        Publicar
                    </button>
                </div>

            </form>
        </div>

    </div>
</div>

<script>
    function postCreator() {
        return {
            mediaPreview: null,
            mediaType: null,

            handleFile(event, type) {
                const file = event.target.files[0];
                if (!file) return;

                if (type === 'image') {
                    document.querySelector('input[name="video"]').value = '';
                } else {
                    document.querySelector('input[name="image"]').value = '';
                }

                this.mediaType = type;
                this.mediaPreview = URL.createObjectURL(file);
            },

            clearMedia() {
                this.mediaPreview = null;
                this.mediaType = null;
                document.querySelector('input[name="image"]').value = '';
                document.querySelector('input[name="video"]').value = '';
            }
        }
    }
</script>
{% endblock %}
"""

# ==============================================================================
# 3. CONTEÚDO: templates/pages/profile.html (Design Corrigido e Funcional)
# ==============================================================================
profile_html = """{% extends 'layout/base_bird.html' %}
{% load static %}

{% block main_content %}
<div class="flex-1 h-full overflow-y-auto no-scrollbar bg-slate-100/50" x-data="{ currentTab: 'posts' }">
    
    <div class="max-w-[1050px] mx-auto pb-10 pt-4 md:pt-6 px-4 md:px-0">

        <div class="bg-white shadow-sm rounded-2xl md:rounded-3xl relative mb-6 overflow-hidden">
            
            <div class="relative h-48 md:h-[350px] w-full bg-slate-200 overflow-hidden group">
                {% if profile.cover_image %}
                    <img src="{{ profile.cover_image.url }}" class="w-full h-full object-cover">
                {% else %}
                    <div class="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                {% endif %}

                {% if is_own_profile %}
                    <button onclick="document.getElementById('edit-profile-btn').click()" class="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-800 px-3 py-1.5 rounded-lg shadow-sm font-bold text-sm transition flex items-center gap-2">
                        <i class="fas fa-camera"></i> <span class="hidden md:inline">Editar Capa</span>
                    </button>
                {% endif %}
            </div>

            <div class="px-4 md:px-8 pb-4">
                <div class="flex flex-col md:flex-row items-start relative">
                    
                    <div class="-mt-16 md:-mt-10 mb-3 md:mb-0 relative z-10 mx-auto md:mx-0">
                        <div class="h-32 w-32 md:h-44 md:w-44 rounded-full ring-4 ring-white bg-white overflow-hidden shadow-lg">
                            {% if profile.avatar %}
                                <img src="{{ profile.avatar.url }}" class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition">
                            {% else %}
                                <img src="https://ui-avatars.com/api/?name={{ profile_user.username }}&background=random&size=200" class="w-full h-full object-cover">
                            {% endif %}
                        </div>
                    </div>

                    <div class="flex-1 flex flex-col md:flex-row justify-between items-center md:items-end md:pl-6 mt-2 md:mt-0 w-full pb-2">
                        
                        <div class="text-center md:text-left mb-4 md:mb-0">
                            <h1 class="text-2xl md:text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-2">
                                {{ profile.full_name|default:profile_user.username }}
                                {% if profile.is_verified %}
                                    <i class="fas fa-check-circle text-blue-500 text-lg" title="Verificado"></i>
                                {% endif %}
                            </h1>
                            <p class="font-bold text-slate-500 text-sm mb-1">@{{ profile_user.username }}</p>
                            {% if stats.followers > 0 %}
                                <p class="text-slate-500 text-sm font-medium hover:underline cursor-pointer">
                                    <strong class="text-slate-800">{{ stats.followers }}</strong> seguidores
                                </p>
                            {% endif %}
                        </div>

                        <div class="flex gap-2 md:mb-2">
                            {% if is_own_profile %}
                                <a href="{% url 'edit_profile' %}" id="edit-profile-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition flex items-center gap-2">
                                    <i class="fas fa-pen"></i> <span>Editar perfil</span>
                                </a>
                                <a href="{% url 'settings' %}" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition">
                                    <i class="fas fa-cog"></i>
                                </a>
                            {% else %}
                                <a href="{% url 'start_chat' profile_user.username %}" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition">
                                    <i class="fas fa-comment-alt"></i> Mensagem
                                </a>
                                <form action="{% url 'toggle_follow' profile_user.username %}" method="POST">
                                    {% csrf_token %}
                                    {% if relationship.is_following %}
                                        <button type="submit" class="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-800 hover:text-red-600 font-bold rounded-lg transition border border-slate-200">
                                            Seguindo
                                        </button>
                                    {% else %}
                                        <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition flex items-center gap-2 shadow-md shadow-indigo-200">
                                            <i class="fas fa-user-plus"></i> Seguir
                                        </button>
                                    {% endif %}
                                </form>
                            {% endif %}
                        </div>
                    </div>
                </div>

                <div class="h-px bg-slate-200 mt-6 mb-1"></div>

                <div class="flex gap-1 overflow-x-auto no-scrollbar">
                    <button @click="currentTab = 'posts'" 
                            class="px-4 py-3 font-bold text-[15px] border-b-[3px] transition rounded-t-lg hover:bg-slate-50 whitespace-nowrap"
                            :class="currentTab === 'posts' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent'">
                        Posts
                    </button>
                    <button @click="currentTab = 'about'" 
                            class="px-4 py-3 font-bold text-[15px] border-b-[3px] transition rounded-t-lg hover:bg-slate-50 whitespace-nowrap"
                            :class="currentTab === 'about' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent'">
                        Sobre
                    </button>
                    <button @click="currentTab = 'photos'" 
                            class="px-4 py-3 font-bold text-[15px] border-b-[3px] transition rounded-t-lg hover:bg-slate-50 whitespace-nowrap"
                            :class="currentTab === 'photos' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent'">
                        Fotos
                    </button>
                    <button @click="currentTab = 'friends'" 
                            class="px-4 py-3 font-bold text-[15px] border-b-[3px] transition rounded-t-lg hover:bg-slate-50 whitespace-nowrap"
                            :class="currentTab === 'friends' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent'">
                        Amigos
                    </button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            <div class="md:col-span-2 space-y-4 h-fit md:sticky md:top-6" x-show="currentTab === 'posts' || currentTab === 'about'">
                
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <h3 class="font-bold text-lg text-slate-900 mb-3">Intro</h3>
                    
                    {% if profile.bio %}
                        <p class="text-sm text-slate-700 mb-4 text-center">{{ profile.bio }}</p>
                    {% endif %}

                    <div class="space-y-3 text-sm text-slate-600">
                        {% if work_history %}
                            <div class="flex items-center gap-2">
                                <i class="fas fa-briefcase text-slate-400 w-5 text-center"></i>
                                <span>Trabalha em <strong>{{ work_history.first.company }}</strong></span>
                            </div>
                        {% endif %}

                        {% if education_history %}
                            <div class="flex items-center gap-2">
                                <i class="fas fa-graduation-cap text-slate-400 w-5 text-center"></i>
                                <span>Estudou em <strong>{{ education_history.first.institution }}</strong></span>
                            </div>
                        {% endif %}

                        {% if profile.current_city %}
                            <div class="flex items-center gap-2">
                                <i class="fas fa-home text-slate-400 w-5 text-center"></i>
                                <span>Mora em <strong>{{ profile.current_city }}</strong></span>
                            </div>
                        {% endif %}

                        {% if profile.hometown %}
                            <div class="flex items-center gap-2">
                                <i class="fas fa-map-marker-alt text-slate-400 w-5 text-center"></i>
                                <span>De <strong>{{ profile.hometown }}</strong></span>
                            </div>
                        {% endif %}
                        
                        <div class="flex items-center gap-2">
                            <i class="fas fa-clock text-slate-400 w-5 text-center"></i>
                            <span>Entrou em {{ profile_user.date_joined|date:"F de Y" }}</span>
                        </div>
                    </div>

                    {% if is_own_profile %}
                        <button onclick="document.getElementById('edit-profile-btn').click()" class="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-sm transition">
                            Editar detalhes
                        </button>
                    {% endif %}
                </div>

                <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-lg text-slate-900">Fotos</h3>
                        <a href="#" @click.prevent="currentTab = 'photos'" class="text-indigo-600 text-sm hover:underline">Ver todas</a>
                    </div>
                    <div class="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                        {% for bird in posts|slice:":9" %}
                            {% if bird.image %}
                                <a href="{% url 'bird_detail' bird.id %}" class="aspect-square bg-slate-100 relative group cursor-pointer block">
                                    <img src="{{ bird.image.url }}" class="w-full h-full object-cover">
                                </a>
                            {% endif %}
                        {% empty %}
                            <p class="col-span-3 text-center text-xs text-slate-400 py-4">Sem fotos ainda.</p>
                        {% endfor %}
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-center mb-1">
                        <h3 class="font-bold text-lg text-slate-900">Amigos</h3>
                        <a href="#" @click.prevent="currentTab = 'friends'" class="text-indigo-600 text-sm hover:underline">Ver todos</a>
                    </div>
                    <p class="text-slate-500 text-sm mb-3">{{ stats.friends_count }} amigos</p>
                    
                    <div class="grid grid-cols-3 gap-3">
                        {% for member in family_members|slice:":6" %}
                            <a href="{% url 'profile_detail' member.user.username %}" class="cursor-pointer block">
                                <img src="{{ member.user.profile.avatar.url|default:'https://i.pravatar.cc/150' }}" class="aspect-square rounded-lg object-cover w-full mb-1">
                                <p class="text-[11px] font-bold leading-tight truncate text-slate-900">{{ member.user.first_name }}</p>
                            </a>
                        {% empty %}
                            <p class="col-span-3 text-center text-xs text-slate-400 py-4">Sem conexões ainda.</p>
                        {% endfor %}
                    </div>
                </div>
            </div>

            <div class="md:col-span-3 space-y-4">
                
                {% if is_own_profile and currentTab == 'posts' %}
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-3 items-center">
                    <div class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        {% if profile.avatar %}
                            <img src="{{ profile.avatar.url }}" class="w-full h-full object-cover">
                        {% endif %}
                    </div>
                    <a href="{% url 'create_bird' %}" class="flex-1 bg-slate-100 hover:bg-slate-200 transition rounded-full h-10 flex items-center px-4 cursor-pointer text-slate-500 text-sm font-medium">
                        No que você está pensando?
                    </a>
                    <div class="flex gap-2 text-slate-400">
                        <a href="{% url 'create_bird' %}" class="p-2 hover:bg-slate-100 rounded-full text-green-500"><i class="fas fa-image"></i></a>
                    </div>
                </div>
                {% endif %}

                <div x-show="currentTab === 'posts'">
                    {% for bird in posts %}
                        {% include 'components/bird_item.html' %}
                    {% empty %}
                        <div class="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
                            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl">
                                <i class="fas fa-newspaper"></i>
                            </div>
                            <h3 class="font-bold text-slate-800">Nenhuma publicação</h3>
                            <p class="text-slate-500 text-sm">Este perfil ainda não compartilhou nada.</p>
                        </div>
                    {% endfor %}
                </div>

                <div x-show="currentTab === 'photos'" style="display: none;">
                    <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <h3 class="font-bold text-xl mb-4">Fotos</h3>
                        <div class="grid grid-cols-3 md:grid-cols-4 gap-1 md:gap-2">
                            {% for bird in posts %}
                                {% if bird.image %}
                                    <a href="{% url 'bird_detail' bird.id %}" class="aspect-square bg-slate-100 relative group cursor-pointer rounded-lg overflow-hidden block">
                                        <img src="{{ bird.image.url }}" class="w-full h-full object-cover hover:scale-110 transition duration-500">
                                    </a>
                                {% endif %}
                            {% empty %}
                                <p class="col-span-full text-center text-slate-400 py-10">Nenhuma foto encontrada.</p>
                            {% endfor %}
                        </div>
                    </div>
                </div>

                <div x-show="currentTab === 'about'" style="display: none;" class="space-y-4">
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 class="font-bold text-xl mb-4 text-slate-800">Visão Geral</h3>
                        <div class="space-y-4">
                            {% if profile.interests %}
                            <div>
                                <h4 class="font-bold text-sm text-slate-500 uppercase mb-2">Interesses</h4>
                                <div class="flex flex-wrap gap-2">
                                    {% if profile.interests.music %}
                                        <span class="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">{{ profile.interests.music }}</span>
                                    {% endif %}
                                    {% if profile.interests.movies %}
                                        <span class="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">{{ profile.interests.movies }}</span>
                                    {% endif %}
                                    {% if profile.interests.games %}
                                        <span class="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">{{ profile.interests.games }}</span>
                                    {% endif %}
                                </div>
                            </div>
                            <hr class="border-slate-100">
                            {% endif %}

                            {% if work_history %}
                            <div>
                                <h4 class="font-bold text-sm text-slate-500 uppercase mb-3">Trabalho</h4>
                                <div class="space-y-4">
                                    {% for work in work_history %}
                                        <div class="flex gap-4">
                                            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <i class="fas fa-briefcase"></i>
                                            </div>
                                            <div>
                                                <h5 class="font-bold text-slate-900">{{ work.position }}</h5>
                                                <p class="text-sm text-slate-600">{{ work.company }} • {{ work.start_date|date:"Y" }} - {% if work.is_current %}Atual{% else %}{{ work.end_date|date:"Y" }}{% endif %}</p>
                                            </div>
                                        </div>
                                    {% endfor %}
                                </div>
                            </div>
                            {% endif %}
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </div>
</div>

{% if is_own_profile %}
    {% include 'components/modals/edit_profile.html' %}
{% endif %}

{% endblock %}
"""

# ==============================================================================
# 4. FUNÇÃO PARA ESCREVER OS ARQUIVOS
# ==============================================================================
def write_file(filepath, content):
    try:
        # Determina o caminho correto.
        # Se 'bird' estiver no caminho atual, não adiciona 'bird' novamente.
        cwd = os.getcwd()
        if os.path.basename(cwd) == 'bird':
            final_path = filepath
        else:
            final_path = os.path.join('bird', filepath)

        # Garante que o diretório existe
        os.makedirs(os.path.dirname(final_path), exist_ok=True)
        
        with open(final_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Sucesso: {final_path} atualizado.")
    except Exception as e:
        print(f"❌ Erro ao escrever {filepath}: {e}")

# ==============================================================================
# 5. EXECUÇÃO
# ==============================================================================
if __name__ == "__main__":
    print("🚀 Corrigindo arquivos do sistema Bird...")
    
    # 1. Atualizar Views de Posts
    write_file(os.path.join('core', 'views', 'posts.py'), posts_view_code)
    
    # 2. Atualizar Template de Criar Post
    write_file(os.path.join('templates', 'pages', 'create_bird.html'), create_bird_html)
    
    # 3. Atualizar Template de Perfil
    write_file(os.path.join('templates', 'pages', 'profile.html'), profile_html)
    
    print("✨ Tudo corrigido! Os caminhos duplicados foram removidos.")