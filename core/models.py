import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timesince import timesince
from django.utils import timezone
from datetime import timedelta

# ==========================================
# 1. PROFILE (Perfil Híbrido: Pessoal + Profissional)
# ==========================================
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Identidade
    display_name = models.CharField(max_length=50, blank=True)
    bio = models.TextField(max_length=500, blank=True) # Aumentado para estilo LinkedIn
    
    # Mídia
    avatar = models.ImageField(upload_to='avatars/', default='defaults/avatar.png')
    cover_image = models.ImageField(upload_to='covers/', blank=True, null=True)
    
    # Profissional (LinkedIn)
    job_title = models.CharField(max_length=100, blank=True, help_text="Ex: CEO at Bird")
    company = models.CharField(max_length=100, blank=True)
    skills = models.CharField(max_length=500, blank=True, help_text="Separados por vírgula")
    
    # Meta
    is_verified = models.BooleanField(default=False)
    is_private = models.BooleanField(default=False) # Cadeado estilo Instagram
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(max_length=200, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"@{self.user.username}"

# ==========================================
# 2. BIRD (O Post Universal)
# ==========================================
class Bird(models.Model):
    POST_TYPES = (
        ('text', 'Bird (Texto)'),       # X/Twitter
        ('image', 'Photo (Insta)'),     # Instagram Feed
        ('video', 'Clip (TikTok)'),     # TikTok/Reels
        ('story', 'Story (Snap)'),      # Snapchat (24h)
        ('article', 'Article (Linkd)'), # LinkedIn
    )

    VISIBILITY_CHOICES = (
        ('public', 'Público'),
        ('connections', 'Conexões'),
        ('close_friends', 'Melhores Amigos'),
        ('private', 'Apenas Eu'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='birds')
    
    # Classificação
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='text')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    
    # Conteúdo
    content = models.TextField(blank=True) # TextField para aceitar artigos longos
    image = models.ImageField(upload_to='posts/images/', blank=True, null=True)
    video = models.FileField(upload_to='posts/videos/', blank=True, null=True)
    
    # Stories e Expiração
    expires_at = models.DateTimeField(null=True, blank=True) # Para Stories
    
    # Metadados de Engajamento
    likes = models.ManyToManyField(User, related_name='liked_birds', blank=True)
    views_count = models.PositiveIntegerField(default=0)
    saved_by = models.ManyToManyField(User, related_name='saved_birds', blank=True) # "Salvar" do Insta
    
    # Estrutura de Thread/Share
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    original_bird = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='rebirds')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post_type', 'created_at']),
        ]

    def save(self, *args, **kwargs):
        # Lógica automática para Stories (expira em 24h)
        if self.post_type == 'story' and not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        return True

# ==========================================
# 3. CONEXÕES (Seguir + Amigos)
# ==========================================
class Connection(models.Model):
    # Usaremos um modelo assimétrico para "Seguir" (Twitter/Insta)
    # Mas podemos inferir "Amizade" (Facebook) se ambos se seguem.
    
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    target = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    
    status = models.CharField(max_length=20, choices=[('active', 'Ativo'), ('muted', 'Silenciado')], default='active')
    is_close_friend = models.BooleanField(default=False) # "Close Friends" do Insta
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'target')

# ==========================================
# 4. SIGNALS
# ==========================================
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
    
    # ... (Mantenha o código anterior de Profile, Bird, Connection)

# ==========================================
# 6. COMMUNITIES (Grupos)
# ==========================================
class Community(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='communities/covers/', blank=True, null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_communities')
    members = models.ManyToManyField(User, through='CommunityMember', related_name='communities')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class CommunityMember(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=[('admin', 'Admin'), ('member', 'Membro')], default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('community', 'user')