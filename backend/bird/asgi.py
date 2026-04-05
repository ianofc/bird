
# ruff: noqa: E402

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyv.settings')
django.setup()

from django.core.asgi import get_asgi_application  # noqa: E402
from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
import core.routing  # noqa: E402
from core.ws_auth import TokenAuthMiddlewareStack  # noqa: E402

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddlewareStack(
        URLRouter(
            core.routing.websocket_urlpatterns
        )
    ),
})
