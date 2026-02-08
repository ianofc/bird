from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile, Bird
import requests
import logging

logger = logging.getLogger('django')

# --- Signals de Perfil ---
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()

# --- Signal da Trindade TAS (Ingestão SARA) ---
@receiver(post_save, sender=Bird)
def ingest_into_tas(sender, instance, created, **kwargs):
    """
    Envia automaticamente novos posts para o motor de IA (Container tas-engine).
    Isso alimenta a busca semântica e o sistema de recomendação.
    """
    if created and (instance.content or instance.post_type in ['image', 'video']):
        payload = {
            "content_id": instance.id,
            "text": instance.content or "",
            "metadata": {
                "author": instance.author.username,
                "type": instance.post_type,
                "premium": instance.author.profile.is_premium
            }
        }
        
        # O endereço 'http://tas-engine:8000' é interno da rede Docker
        tas_url = "http://tas-engine:8000/api/v1/events/ingest"
        
        try:
            # Timeout curto para não travar o save do Django se a IA estiver lenta
            requests.post(tas_url, json=payload, timeout=2)
        except requests.exceptions.RequestException:
            # Falha silenciosa: Se a IA estiver offline, o post é salvo, mas não indexado agora.
            # Em produção, isso iria para uma fila Celery.
            logger.warning(f"TAS Engine offline. Bird {instance.id} not indexed.")