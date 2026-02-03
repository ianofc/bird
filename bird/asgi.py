import os
from django.core.asgi import get_asgi_application

# 1. Configura as settings do Django antes de qualquer coisa
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bird.settings')

# 2. Inicializa a aplicação Django ASGI imediatamente.
# Isso garante que o registro de apps (Models, ORM) esteja pronto
# ANTES de importarmos consumers ou middlewares do Channels.
django_asgi_app = get_asgi_application()

# 3. Agora é seguro importar componentes do Channels
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# No futuro, você criará um arquivo routing.py e importará assim:
# from core.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    # Requisições HTTP (Django tradicional, Views, HTMX)
    "http": django_asgi_app,

    # Requisições WebSocket (Chat, Notificações em Tempo Real)
    "websocket": AuthMiddlewareStack(
        URLRouter(
            # websocket_urlpatterns (Lista vazia por enquanto)
            []
        )
    ),
})