import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

# ========================================================
# 📂 UTILITÁRIOS DE UPLOAD
# ========================================================
def generate_filename(instance, filename, folder):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return f'{folder}/{filename}'

def upload_avatar(instance, filename):
    return generate_filename(instance, filename, f'avatars/{instance.user.username}')

def upload_cover(instance, filename):
    return generate_filename(instance, filename, f'covers/{instance.user.username}')

def upload_post_media(instance, filename):
    return generate_filename(instance, filename, f'posts/{instance.author.username}')

def upload_group_cover(instance, filename):
    return generate_filename(instance, filename, f'groups/{instance.slug}')

def upload_event_cover(instance, filename):
    return generate_filename(instance, filename, 'events')

# ========================================================
# 👤 PERFIL & IDENTIDADE
# ========================================================
class Profile(models.Model):
    class Gender(models.TextChoices):
        MALE = 'M', 'Masculino'
        FEMALE = 'F', 'Feminino'
        OTHER = 'O', 'Outro'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Identidade
    full_name = models.CharField("Nome Completo", max_length=255, blank=True)
    cpf_document = models.CharField("CPF/Documento", max_length=20, blank=True)
    gender = models.CharField("Gênero", max_length=1, choices=Gender.choices, default=Gender.MALE)
    
    # Datas
    birth_date = models.DateField("Data de Nascimento", null=True, blank=True)
    show_birth_year = models.BooleanField("Mostrar Ano?", default=False)

    # Localização
    current_city = models.CharField("Cidade Atual", max_length=100, blank=True)
    hometown = models.CharField("Cidade Natal", max_length=100, blank=True)
    visited_places = models.JSONField("Lugares Visitados", default=list, blank=True)

    # Contato
    phone = models.CharField("Telefone/WhatsApp", max_length=20, blank=True)
    public_email = models.EmailField("Email Público", blank=True)
    
    # Visual & Bio
    bio = models.TextField("Sobre Mim", max_length=500, blank=True)
    avatar = models.ImageField(upload_to=upload_avatar, blank=True, null=True)
    cover_image = models.ImageField(upload_to=upload_cover, blank=True, null=True)

    # Monetização & Status (Novos Campos)
    is_premium = models.BooleanField("Membro Premium", default=False)
    premium_since = models.DateTimeField("Premium Desde", null=True, blank=True)
    is_verified = models.BooleanField("Verificado", default=False)

    # Interesses & Configurações (JSON)
    interests = models.JSONField("Interesses", default=dict, blank=True)
    privacy_settings = models.JSONField("Configurações de Privacidade", default=dict, blank=True) 

    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.user.username

    def get_age(self):
        if not self.birth_date: return None
        today = timezone.now().date()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))

    # Helpers do Thalamus (Soberania de Dados)
    @property
    def allows_ai_training(self):
        return self.privacy_settings.get('allow_ai_training', False)

    @property
    def is_private_profile(self):
        return self.privacy_settings.get('is_private', False)

# ========================================================
# 🎓 & 💼 EXPERIÊNCIA
# ========================================================
class WorkExperience(models.Model):
    profile = models.ForeignKey(Profile, related_name='work_experiences', on_delete=models.CASCADE)
    company = models.CharField("Empresa", max_length=100)
    position = models.CharField("Cargo", max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.position} at {self.company}"

class Education(models.Model):
    profile = models.ForeignKey(Profile, related_name='education_history', on_delete=models.CASCADE)
    institution = models.CharField("Instituição", max_length=100)
    course = models.CharField("Curso/Grau", max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.course} at {self.institution}"

# ========================================================
# ❤️ LAÇOS SOCIAIS & CONEXÕES
# ========================================================
class SocialBond(models.Model):
    """Laços profundos (Amigos, Família, Namoro). Requer aceite."""
    class Type(models.TextChoices):
        FRIEND = 'friend', 'Amigo'
        BESTIE = 'bestie', 'Melhor Amigo'
        DATING = 'dating', 'Namorando'
        MARRIED = 'married', 'Casado(a)'
        FATHER = 'father', 'Pai'
        MOTHER = 'mother', 'Mãe'
        SON = 'son', 'Filho(a)'
        SIBLING = 'sibling', 'Irmão/Irmã'
        COLLEAGUE = 'colleague', 'Colega'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pendente'
        ACTIVE = 'active', 'Aceito'
        BLOCKED = 'blocked', 'Bloqueado'

    requester = models.ForeignKey(User, related_name='bonds_requested', on_delete=models.CASCADE)
    target = models.ForeignKey(User, related_name='bonds_received', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.FRIEND)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('requester', 'target', 'type')
        indexes = [
            models.Index(fields=['requester', 'target']),
            models.Index(fields=['status']),
        ]

class Connection(models.Model):
    """Seguir simples (Follow Unilateral)."""
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    target = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, default='active') # active, blocked
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'target')

# ========================================================
# 🦅 POSTAGENS (BIRDS)
# ========================================================
class Bird(models.Model):
    class PostType(models.TextChoices):
        TEXT = 'text', 'Texto'
        IMAGE = 'image', 'Imagem'
        VIDEO = 'video', 'Vídeo'
        STORY = 'story', 'Story'

    class Visibility(models.TextChoices):
        PUBLIC = 'public', 'Público'
        FRIENDS = 'friends', 'Amigos'
        PRIVATE = 'private', 'Privado'

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='birds')
    content = models.TextField(blank=True, null=True)
    
    # Mídia
    image = models.ImageField(upload_to=upload_post_media, blank=True, null=True)
    video = models.FileField(upload_to=upload_post_media, blank=True, null=True)
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    
    # Meta
    post_type = models.CharField(max_length=15, choices=PostType.choices, default=PostType.TEXT)
    visibility = models.CharField(max_length=10, choices=Visibility.choices, default=Visibility.PUBLIC)
    location = models.CharField(max_length=100, blank=True, null=True)
    
    is_processing = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True) # Para Stories
    
    likes = models.ManyToManyField(User, related_name='liked_birds', blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Auto-detecta tipo de post
        if self.post_type == self.PostType.STORY and not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        elif self.video and self.post_type == self.PostType.TEXT:
            self.post_type = self.PostType.VIDEO
            self.is_processing = True
        elif self.image and self.post_type == self.PostType.TEXT:
            self.post_type = self.PostType.IMAGE
        super().save(*args, **kwargs)

    @property
    def is_active_story(self):
        if self.post_type != self.PostType.STORY:
            return False
        return self.expires_at > timezone.now()

class Comment(models.Model):
    post = models.ForeignKey(Bird, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')

    class Meta:
        ordering = ['created_at']

class SavedPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_items')
    post = models.ForeignKey(Bird, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'post')

# ========================================================
# 👥 COMUNIDADES (GRUPOS)
# ========================================================
class Community(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    capa = models.ImageField(upload_to=upload_group_cover, blank=True, null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    members = models.ManyToManyField(User, through='CommunityMember', related_name='communities')
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): return self.name

class CommunityMember(models.Model):
    class Role(models.TextChoices):
        MEMBER = 'member', 'Membro'
        MODERATOR = 'moderator', 'Moderador'
        ADMIN = 'admin', 'Admin'

    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('community', 'user')

# ========================================================
# 💬 CHAT (ROOMS & MESSAGES)
# ========================================================
class Room(models.Model):
    participants = models.ManyToManyField(User, related_name='chat_rooms')
    name = models.CharField(max_length=100, blank=True, null=True) # Para grupos
    is_group = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name if self.name else f"Chat {self.id}"

class Message(models.Model):
    room = models.ForeignKey(Room, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    media = models.FileField(upload_to='chat_media/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

# ========================================================
# 📅 EVENTOS
# ========================================================
class Evento(models.Model):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    local = models.CharField(max_length=200)
    data_inicio = models.DateTimeField()
    capa = models.ImageField(upload_to=upload_event_cover, blank=True, null=True)
    participantes = models.ManyToManyField(User, related_name='eventos_participando', blank=True)
    criador = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): return self.titulo

# ========================================================
# 🔔 NOTIFICAÇÕES
# ========================================================
class Notification(models.Model):
    class Type(models.TextChoices):
        LIKE = 'like', 'Curtiu'
        COMMENT = 'comment', 'Comentou'
        FOLLOW = 'follow', 'Seguiu'
        BOND = 'bond', 'Laço Social'
        SYSTEM = 'system', 'Sistema'
        MODERATION = 'moderation', 'Moderação'

    recipient = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=Type.choices, default=Type.SYSTEM)
    message = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

# ========================================================
# ⚡ SIGNALS (PERFIL AUTOMÁTICO)
# ========================================================
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()