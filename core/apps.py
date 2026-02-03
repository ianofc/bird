from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        """
        Método executado quando o Django termina de carregar o App.
        Aqui importamos os Signals para garantir que eles 'escutem' os eventos do banco.
        """
        try:
            import core.signals
        except ImportError:
            pass