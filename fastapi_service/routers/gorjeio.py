"""Compatibility wrapper.

Mantém a importação histórica em `fastapi_service.routers.gorjeio`,
mas a implementação canônica agora vive em `gorjeio.api.router`.
"""

from gorjeio.api.router import router

__all__ = ["router"]
