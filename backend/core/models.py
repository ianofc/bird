# backend/core/models.py
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

# --- FUNÇÕES DE UPLOAD ---
def upload_post_media(instance, filename): return f'birds/media/{instance.author.username}/{filename}'
def upload_event_cover(instance, filename): return f'events/covers/{instance.id}/{filename}'
def upload_group_cover(instance, filename): return f'groups/covers/{uuid.uuid4()}/{filename}'
def upload_avatar(instance, filename): return f'avatars/{instance.user.username}/{uuid.uuid4()}.{filename.split(".")[-1]}'
def upload_cover(instance, filename): return f'covers/{instance.user.username}/{uuid.uuid4()}.{filename.split(".")[-1]}'
def upload_chat_attachment(instance, filename): return f'gorjeio/attachments/{instance.room.id}/{uuid.uuid4()}_{filename}'


# --- PERFIL ---
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=150, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to=upload_avatar, blank=True, null=True)
    cover_image = models.ImageField(upload_to=upload_cover, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    interests = models.JSONField(default=dict, blank=True)
    privacy_settings = models.JSONField(default=dict, blank=True)
    
    def __str__(self): 
        return self.user.username

class WorkExperience(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='work_history')
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

class Education(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='education_history')
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)


# --- SOCIAL (ECOSSISTEMA BIRD) ---
class Bird(models.Model):
    POST_TYPES = (('text', 'Texto'), ('image', 'Imagem'), ('video', 'Vídeo'), ('story', 'Story'))
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='birds')
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to=upload_post_media, blank=True, null=True)
    video = models.FileField(upload_to=upload_post_media, blank=True, null=True)
    post_type = models.CharField(max_length=10, choices=POST_TYPES, default='text')
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_birds', blank=True)
    visibility = models.CharField(max_length=20, default='public')

class Comment(models.Model):
    bird = models.ForeignKey(Bird, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Connection(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    target = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower', 'target'], name='unique_connection_pair'),
            models.CheckConstraint(check=~models.Q(follower=models.F('target')), name='prevent_self_connection'),
        ]
        indexes = [
            models.Index(fields=['target', 'status']),
            models.Index(fields=['follower', 'status']),
        ]

    def clean(self):
        if self.follower_id == self.target_id:
            raise ValidationError('Não é permitido seguir a si mesmo.')


class SavedPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_posts')
    post = models.ForeignKey(Bird, on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_saved_post_per_user'),
        ]
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

class SocialBond(models.Model):
    requester = models.ForeignKey(User, related_name='bond_requests_sent', on_delete=models.CASCADE)
    target = models.ForeignKey(User, related_name='bond_requests_received', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=[('friend', 'Amigo'), ('family', 'Família')])
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    cover = models.ImageField(upload_to=upload_event_cover, blank=True, null=True)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    participants = models.ManyToManyField(User, related_name='events_participating', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


# --- GORJEIO MESSENGER ---

class Room(models.Model):
    ROOM_TYPES = (
        ('dm', 'Direct Message'),
        ('group', 'Grupo'),
        ('channel', 'Canal'),
        ('secret', 'Chat Secreto'),
    )
    name = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=20, choices=ROOM_TYPES, default='dm')
    
    icon = models.ImageField(upload_to='gorjeio/group_icons/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    participants = models.ManyToManyField(User, related_name='chat_rooms')
    admins = models.ManyToManyField(User, related_name='admin_rooms', blank=True)
    permissions = models.JSONField(default=dict, blank=True) # Para bots e restrições de power users
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_group(self):
        return self.type in ['group', 'channel']

    def __str__(self):
        return self.name if self.is_group else f"Chat Privado ({self.id})"


class ChatFolder(models.Model):
    """
    Representa o sistema de 'Ninhos' (Pastas de chat) do Gorjeio.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_folders')
    name = models.CharField(max_length=100) # Ex: Dev, Arte, Pessoal
    rooms = models.ManyToManyField(Room, related_name='folders', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'name')
        ordering = ['created_at']

    def __str__(self):
        return f"Ninho {self.name} - {self.user.username}"


class Message(models.Model):
    room = models.ForeignKey(Room, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(blank=True, null=True)
    
    # Preparado para a feature "Mídia Gigante" (Q3 2026)
    attachment = models.FileField(upload_to=upload_chat_attachment, blank=True, null=True)
    attachment_type = models.CharField(max_length=50, blank=True, null=True) # ex: 'image/png', 'document', 'voice'
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Features Avançadas inspiradas no MTProto / Telegram
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    is_edited = models.BooleanField(default=False)
    forward_from = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='forwarded_messages')
    is_pinned = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at'] # Garante que o histórico venha na ordem correta no WebSocket

    def __str__(self):
        return f"Msg {self.id} de {self.sender.username} em {self.room}"


# --- SISTEMA GERAL ---
class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    text = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)