from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Profile, WorkExperience, Education, SocialBond, Connection,
    Bird, Notification, Community, CommunityMember, Evento, 
    Room, Message, SavedPost, Comment
)

# ==========================================
# 🛠️ AÇÕES DE MODERAÇÃO (THALAMUS GATEKEEPER)
# ==========================================
@admin.action(description='🚫 Banir e Notificar Autor')
def ban_and_notify(modeladmin, request, queryset):
    """Ação para banir conteúdo e enviar notificação automática via Thalamus."""
    for obj in queryset:
        author = getattr(obj, 'author', getattr(obj, 'user', None))
        if author:
            Notification.objects.create(
                recipient=author,
                tipo="moderação",
                message="Seu conteúdo foi removido por violar as políticas de soberania do Bird."
            )
        # Se for um Bird, torna privado. Se for Perfil, desverifica.
        if hasattr(obj, 'visibility'):
            obj.visibility = 'private'
        if hasattr(obj, 'is_verified'):
            obj.is_verified = False
        obj.save()

# ==========================================
# 🎓 & 💼 INLINES
# ==========================================
class WorkExperienceInline(admin.TabularInline):
    model = WorkExperience
    extra = 0
    classes = ('collapse',)

class EducationInline(admin.TabularInline):
    model = Education
    extra = 0
    classes = ('collapse',)

# ==========================================
# 👤 PERFIL AVANÇADO
# ==========================================
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'gender', 'current_city', 'is_verified', 'get_age')
    list_filter = ('gender', 'is_verified', 'show_birth_year', 'created_at')
    search_fields = ('user__username', 'full_name', 'cpf_document', 'current_city')
    actions = [ban_and_notify, 'verify_users']
    
    fieldsets = (
        ('Identidade', {'fields': ('user', 'full_name', 'cpf_document', 'gender', 'is_verified')}),
        ('Datas & Localização', {'fields': ('birth_date', 'show_birth_year', 'current_city', 'hometown', 'visited_places')}),
        ('Contato & Bio', {'fields': ('phone', 'public_email', 'bio', 'avatar', 'cover_image')}),
        ('Configurações (JSON)', {'classes': ('collapse',), 'fields': ('interests', 'privacy_settings')}),
    )
    inlines = [WorkExperienceInline, EducationInline]

    @admin.action(description='✅ Verificar Usuários Selecionados')
    def verify_users(self, request, queryset):
        queryset.update(is_verified=True)

# ==========================================
# ❤️ LAÇOS SOCIAIS & CONEXÕES
# ==========================================
@admin.register(SocialBond)
class SocialBondAdmin(admin.ModelAdmin):
    list_display = ('requester', 'target', 'type', 'status', 'created_at')
    list_filter = ('type', 'status')
    search_fields = ('requester__username', 'target__username')
    radio_fields = {"status": admin.HORIZONTAL}

@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ('follower', 'target', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('follower__username', 'target__username')

# ==========================================
# 🦅 CONTEÚDO (BIRDS) - FOCO EM MODERAÇÃO
# ==========================================
@admin.register(Bird)
class BirdAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content_preview', 'post_type', 'visibility', 'is_processing', 'created_at')
    list_filter = ('post_type', 'visibility', 'is_processing', 'created_at')
    search_fields = ('content', 'author__username')
    actions = [ban_and_notify]
    readonly_fields = ('is_processing',)
    
    def content_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 30px; height: 30px; border-radius: 4px;"/>', obj.image.url)
        return obj.content[:50] + '...' if obj.content else '[Sem texto]'

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'post', 'created_at')
    actions = [ban_and_notify]

# ==========================================
# 👥 COMUNIDADES
# ==========================================
class CommunityMemberInline(admin.TabularInline):
    model = CommunityMember
    extra = 1

@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'creator', 'is_private', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [CommunityMemberInline]
    search_fields = ('name',)

# ==========================================
# 💬 CHAT & MENSAGENS
# ==========================================
@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_group', 'updated_at')
    filter_horizontal = ('participants',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'room', 'content_short', 'created_at')
    
    def content_short(self, obj):
        return obj.content[:30]

# ==========================================
# 🔔 NOTIFICAÇÕES & EVENTOS
# ==========================================
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'tipo', 'message', 'is_read', 'created_at')
    list_filter = ('tipo', 'is_read')

@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'data_inicio', 'local', 'criador')
    search_fields = ('titulo', 'local')

# Registro de modelos simples remanescentes
admin.site.register(SavedPost)