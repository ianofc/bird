from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Profile

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    """
    Sempre que um User Ã© criado, cria um Profile vazio associado.
    """
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    """
    Sempre que um User Ã© salvo, garante que o Profile tambÃ©m seja salvo.
    Se o Profile nÃ£o existir (por algum erro manual no banco), cria um.
    """
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        Profile.objects.create(user=instance)
import requests
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Bird

@receiver(post_save, sender=Bird)
def ingest_into_tas(sender, instance, created, **kwargs):
    """Envia novos Birds para o SARA gerar embeddings automaticamente"""
    if created and instance.content:
        payload = {
            "content_id": instance.id,
            "text": instance.content,
            "metadata": {"author": instance.author.username, "type": instance.post_type}
        }
        try:
            requests.post("http://localhost:8003/api/v1/events/ingest", json=payload, timeout=5)
        except Exception:
            pass # Thalamus: Silencia erros para não travar a experiência do usuário

import requests
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Bird

@receiver(post_save, sender=Bird)
def ingest_into_tas(sender, instance, created, **kwargs):
    """Envia novos Birds para o SARA gerar embeddings automaticamente"""
    if created and instance.content:
        payload = {
            "content_id": instance.id,
            "text": instance.content,
            "metadata": {"author": instance.author.username, "type": instance.post_type}
        }
        try:
            requests.post("http://localhost:8003/api/v1/events/ingest", json=payload, timeout=5)
        except Exception:
            pass # Thalamus: Silencia erros para não travar a experiência do usuário
