from django.contrib import admin
from .models import (
    Profile, WorkExperience, Education, SocialBond, Connection,
    Bird, Notification, Community, CommunityMember, Evento, 
    Room, Message, SavedPost, Comment
)

# ==========================================
# 🎓 & 💼 INLINES (Experiência dentro do Perfil)
# ==========================================
class WorkExperienceInline(admin.TabularInline):
    model = WorkExperience
    extra = 0
    classes = ('collapse',) # Começa fechado para economizar espaço visual

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
    list_filter = ('gender', 'is_verified', 'show_birth_year')
    search_fields = ('user__username', 'full_name', 'cpf_document', 'current_city')
    
    # Organiza os campos em abas/seções visuais no Admin
    fieldsets = (
        ('Identidade', {
            'fields': ('user', 'full_name', 'cpf_document', 'gender', 'is_verified')
        }),
        ('Datas & Idade', {
            'fields': ('birth_date', 'show_birth_year')
        }),
        ('Localização', {
            'fields': ('current_city', 'hometown', 'visited_places')
        }),
        ('Contato', {
            'fields': ('phone', 'public_email')
        }),
        ('Visual', {
            'fields': ('bio', 'avatar', 'cover_image')
        }),
        ('Configurações (JSON)', {
            'classes': ('collapse',),
            'fields': ('interests', 'privacy_settings')
        }),
    )
    
    inlines = [WorkExperienceInline, EducationInline]

# ==========================================
# ❤️ RELACIONAMENTOS (LAÇOS SOCIAIS)
# ==========================================
@admin.register(SocialBond)
class SocialBondAdmin(admin.ModelAdmin):
    list_display = ('requester', 'target', 'type', 'status', 'created_at')
    list_filter = ('type', 'status')
    search_fields = ('requester__username', 'target__username')
    radio_fields = {"status": admin.HORIZONTAL}

# ==========================================
# 📡 CONEXÕES (SEGUIR) - CORRIGIDO
# ==========================================
@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    # Removido 'connection_type' pois não existe mais no model
    list_display = ('follower', 'target', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('follower__username', 'target__username')

# ==========================================
# 🦅 CONTEÚDO (BIRDS & COMENTÁRIOS)
# ==========================================
@admin.register(Bird)
class BirdAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content_preview', 'post_type', 'visibility', 'created_at')
    list_filter = ('post_type', 'visibility', 'is_processing', 'created_at')
    search_fields = ('content', 'author__username')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if obj.content else '[Mídia]'

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'post', 'created_at')
    search_fields = ('content', 'author__username')

@admin.register(SavedPost)
class SavedPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')

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
# 💬 CHAT
# ==========================================
@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_group', 'updated_at')
    list_filter = ('is_group',)
    filter_horizontal = ('participants',) # Interface melhor para ManyToMany

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'room', 'content', 'created_at')
    search_fields = ('content', 'sender__username')

# ==========================================
# 🔔 & 📅 OUTROS
# ==========================================
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'tipo', 'is_read', 'created_at')
    list_filter = ('tipo', 'is_read')

@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'data_inicio', 'local')
    search_fields = ('titulo', 'local')