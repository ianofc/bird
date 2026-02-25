import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        """
        Método executado quando o Django termina de carregar o App.
        Aqui importamos os Signals para garantir que eles 'escutem' os eventos do banco.
        """
        try:
            from . import signals  # noqa: F401
        except ImportError as exc:
            logger.warning("Falha ao carregar signals do app core: %s", exc)
    label = 'core'
