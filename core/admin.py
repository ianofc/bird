from django.contrib import admin
from .models import (
    Profile, WorkExperience, Education, SocialBond, Connection,
    Bird, Notification, Community, CommunityMember, Evento, Room, Message
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
        ('Dados JSON (Interesses)', {
            'classes': ('collapse',),
            'fields': ('interests',)
        }),
    )
    
    inlines = [WorkExperienceInline, EducationInline]

admin.site.register(Profile, ProfileAdmin)

# ==========================================
# ❤️ RELACIONAMENTOS (LAÇOS SOCIAIS)
# ==========================================
class SocialBondAdmin(admin.ModelAdmin):
    list_display = ('requester', 'target', 'type', 'status', 'created_at')
    list_filter = ('type', 'status')
    search_fields = ('requester__username', 'target__username')
    
    # Agrupa tipos visualmente (ex: Pendente/Ativo/Bloqueado)
    radio_fields = {"status": admin.HORIZONTAL}

admin.site.register(SocialBond, SocialBondAdmin)

# ==========================================
# 📡 CONEXÕES (SEGUIR)
# ==========================================
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ('follower', 'target', 'connection_type', 'status')
    list_filter = ('connection_type', 'status')
    search_fields = ('follower__username', 'target__username')

admin.site.register(Connection, ConnectionAdmin)

# ==========================================
# 🦅 CONTEÚDO (BIRDS)
# ==========================================
class BirdAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content_preview', 'post_type', 'is_processing', 'created_at')
    list_filter = ('post_type', 'is_processing', 'created_at')
    search_fields = ('content', 'author__username')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if obj.content else '[Mídia]'

admin.site.register(Bird, BirdAdmin)

# ==========================================
# 👥 COMUNIDADES
# ==========================================
class CommunityMemberInline(admin.TabularInline):
    model = CommunityMember
    extra = 1

class CommunityAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'creator', 'is_private', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [CommunityMemberInline]
    search_fields = ('name',)

admin.site.register(Community, CommunityAdmin)

# ==========================================
# 🔔 & 💬 OUTROS MODELOS
# ==========================================
admin.site.register(Notification)
admin.site.register(Evento)
admin.site.register(Room)
admin.site.register(Message)