from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    # Usa get_or_create para evitar erros de duplicidade (IntegrityError)
    # Se já existir, apenas pega o existente.
    Profile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    # Garante que o perfil existe antes de salvar
    if hasattr(instance, 'profile'):
        instance.profile.save()