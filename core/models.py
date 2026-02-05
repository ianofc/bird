from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

# ========================================================
# 📂 UTILITÁRIOS DE UPLOAD
# ========================================================
def upload_avatar(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return f'avatars/{instance.user.username}/{filename}'

def upload_cover(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return f'covers/{instance.user.username}/{filename}'

def upload_post_media(instance, filename):
    return f'posts/{instance.author.username}/{filename}'

def upload_group_cover(instance, filename):
    return f'groups/{instance.slug}/{filename}'

# ========================================================
# 👤 PERFIL COMPLETO (PROFILE)
# ========================================================
class Profile(models.Model):
    GENDER_CHOICES = (
        ('M', 'Masculino'),
        ('F', 'Feminino'),
        ('O', 'Outro'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Identidade
    full_name = models.CharField("Nome Completo", max_length=255, blank=True)
    cpf_document = models.CharField("CPF/Documento", max_length=20, blank=True)
    gender = models.CharField("Gênero", max_length=1, choices=GENDER_CHOICES, default='M')
    
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

    # Interesses & Configurações (JSON)
    interests = models.JSONField("Interesses", default=dict, blank=True)
    privacy_settings = models.JSONField("Configurações de Privacidade", default=dict, blank=True) 
    # Ex: {'show_email': 'friends', 'show_posts': 'public'}

    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.user.username

    def get_age(self):
        if not self.birth_date: return None
        today = timezone.now().date()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))

# ========================================================
# ❤️ LAÇOS SOCIAIS (SOCIAL BOND) - NOVO
# ========================================================
class SocialBond(models.Model):
    """
    Diferencia conexões profundas (Amigos, Família) de simples 'Follow'.
    Requer aprovação mútua.
    """
    TYPES = (
        ('friend', 'Amigo'),
        ('bestie', 'Melhor Amigo'),
        ('dating', 'Namorando'),
        ('married', 'Casado(a)'),
        ('father', 'Pai'),
        ('mother', 'Mãe'),
        ('son', 'Filho(a)'),
        ('sibling', 'Irmão/Irmã'),
        ('colleague', 'Colega de Trabalho'),
    )
    STATUS = (('pending', 'Pendente'), ('active', 'Aceito'), ('blocked', 'Bloqueado'))

    requester = models.ForeignKey(User, related_name='bonds_requested', on_delete=models.CASCADE)
    target = models.ForeignKey(User, related_name='bonds_received', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPES, default='friend')
    status = models.CharField(max_length=10, choices=STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('requester', 'target', 'type')
        indexes = [
            models.Index(fields=['requester', 'target']),
        ]

    def __str__(self):
        return f"{self.requester} -> {self.target} ({self.get_type_display()})"

# ========================================================
# 📡 CONEXÕES (FOLLOW UNILATERAL)
# ========================================================
class Connection(models.Model):
    """
    Sistema estilo Twitter/Instagram: Seguir alguém.
    Geralmente, aceitar um SocialBond cria automaticamente 
    uma Connection mútua.
    """
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    target = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'target')

# ========================================================
# 🦅 POSTAGENS (BIRDS) & COMENTÁRIOS
# ========================================================
class Bird(models.Model):
    POST_TYPES = (
        ('text', 'Texto'), 
        ('image', 'Imagem'), 
        ('video', 'Vídeo'), 
        ('story', 'Story (24h)')
    )
    VISIBILITY_CHOICES = (
        ('public', 'Público'),
        ('friends', 'Apenas Amigos'),
        ('private', 'Privado'),
    )

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='birds')
    content = models.TextField(blank=True, null=True)
    
    # Mídias
    image = models.ImageField(upload_to=upload_post_media, blank=True, null=True)
    video = models.FileField(upload_to=upload_post_media, blank=True, null=True)
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    
    # Configurações
    post_type = models.CharField(max_length=15, choices=POST_TYPES, default='text')
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public')
    
    # Metadados
    feeling = models.CharField(max_length=50, blank=True, null=True) # Ex: "Feliz", "Triste"
    location = models.CharField(max_length=100, blank=True, null=True)
    
    is_processing = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True) # Para Stories
    
    likes = models.ManyToManyField(User, related_name='liked_birds', blank=True)

    def save(self, *args, **kwargs):
        # Auto-detecta tipo
        if self.post_type == 'story' and not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        elif self.video and self.post_type == 'text':
            self.post_type = 'video'
            self.is_processing = True
        elif self.image and self.post_type == 'text':
            self.post_type = 'image'
        
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        if self.expires_at and timezone.now() > self.expires_at:
            return True
        return False

class Comment(models.Model):
    post = models.ForeignKey(Bird, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    
    def __str__(self):
        return f"Comment by {self.author} on {self.post}"

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

class Education(models.Model):
    profile = models.ForeignKey(Profile, related_name='education_history', on_delete=models.CASCADE)
    institution = models.CharField("Instituição", max_length=100)
    course = models.CharField("Curso/Grau", max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

# ========================================================
# 👥 COMUNIDADES
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

    def __str__(self):
        return self.name

class CommunityMember(models.Model):
    ROLES = (('member', 'Membro'), ('moderator', 'Moderador'), ('admin', 'Admin'))
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('community', 'user')

# ========================================================
# 🔔 & 💬 OUTROS (NOTIFICAÇÕES & CHAT)
# ========================================================
class Notification(models.Model):
    recipient = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20) # ex: 'like', 'comment', 'follow', 'bond_request'
    message = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Room(models.Model):
    participants = models.ManyToManyField(User, related_name='chat_rooms')
    name = models.CharField(max_length=100, blank=True, null=True) # Para grupos
    is_group = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
    room = models.ForeignKey(Room, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    media = models.FileField(upload_to='chat_media/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

# ========================================================
# ⚡ SIGNALS (AUTOMATIZAÇÃO)
# ========================================================
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Cria automaticamente um perfil quando um User é criado"""
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Salva o perfil sempre que o User for salvo"""
    instance.profile.save()