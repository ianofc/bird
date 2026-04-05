from django.contrib import admin
from .models import (
    Profile, WorkExperience, Education,
    Lyv, Comment, Connection, SocialBond,
    Event, Room, Message, Notification
)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'is_verified', 'created_at')
    search_fields = ('user__username', 'full_name')

@admin.register(Lyv)
class LyvAdmin(admin.ModelAdmin):
    list_display = ('author', 'post_type', 'created_at', 'visibility')
    list_filter = ('post_type', 'visibility')

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'created_at')
    list_filter = ('type',)
    search_fields = ('name',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'room', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')

# Registo simples para os restantes
admin.site.register(WorkExperience)
admin.site.register(Education)
admin.site.register(Comment)
admin.site.register(Connection)
admin.site.register(SocialBond)
admin.site.register(Event)
admin.site.register(Notification)