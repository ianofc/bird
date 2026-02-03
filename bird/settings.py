"""
Django settings for bird project.
Generated for 'Project Bird' - The Social Operating System.
Version: Definitive Aurora 2.0
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# Carrega variáveis do arquivo .env
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================================
# 1. CORE SECURITY SETTINGS
# ==========================================
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-dev-key-change-in-production')

# DEBUG deve ser False em produção. Pega do .env ou assume True localmente.
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '127.0.0.1,localhost,*').split(',')

CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', 'http://127.0.0.1,http://localhost').split(',')

# ==========================================
# 2. INSTALLED APPS
# ==========================================
INSTALLED_APPS = [
    # [ASGI] Daphne deve ser o PRIMEIRO para gerenciar WebSockets
    'daphne',

    # Django Apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-Party Apps
    'rest_framework',           # API
    'django_htmx',              # Interatividade Frontend
    'channels',                 # WebSockets / Chat
    'compressor',               # Otimização de Assets Estáticos

    # Local Apps (Seu Projeto)
    'core',
]

# ==========================================
# 3. MIDDLEWARE
# ==========================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Assets em Produção
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_htmx.middleware.HtmxMiddleware',      # HTMX Middleware
]

ROOT_URLCONF = 'bird.urls'

# ==========================================
# 4. TEMPLATES
# ==========================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], # Aponta para a pasta global de templates
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Configurações de Servidor
WSGI_APPLICATION = 'bird.wsgi.application'
ASGI_APPLICATION = 'bird.asgi.application'

# ==========================================
# 5. DATABASE
# ==========================================
# Usa SQLite localmente, mas aceita Postgres via DATABASE_URL no .env
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# ==========================================
# 6. AUTHENTICATION & PASSWORD
# ==========================================
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]

# Redirecionamentos de Login
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'home'
LOGOUT_REDIRECT_URL = 'login'

# ==========================================
# 7. INTERNATIONALIZATION
# ==========================================
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# ==========================================
# 8. STATIC & MEDIA FILES (Whitenoise Config)
# ==========================================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Pasta onde você coloca seus CSS/JS manuais durante o desenvolvimento
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Configuração de Armazenamento (Django 4.2+)
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        # Em produção, usa WhiteNoise com compressão. Localmente, usa padrão.
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Compressor Settings
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)
COMPRESS_ENABLED = not DEBUG # Só comprime em produção
COMPRESS_OFFLINE = not DEBUG

# ==========================================
# 9. CHANNEL LAYER (REDIS / MEMORY)
# ==========================================
# Se houver REDIS_URL no .env, usa Redis. Senão, usa Memória (Dev).
if os.getenv('REDIS_URL'):
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [os.getenv('REDIS_URL')],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        }
    }

# ==========================================
# 10. DRF (API)
# ==========================================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# ==========================================
# 11. LOGGING & MISC
# ==========================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email Backend (Console para Dev)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logs para Debugar TemplateDoesNotExist
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}


# ==========================================
# 12. CELERY & REDIS CONFIG
# ==========================================
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://127.0.0.1:6380/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

# ==========================================
# 13. UPLOAD LIMITS
# ==========================================
DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB

