"""
Django settings for bird project.
Generated for 'Project Bird' - The Social Operating System.
Version: Definitive Aurora 2.0 - Master Integrated
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
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '127.0.0.1,localhost,*').split(',')
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', 'http://127.0.0.1,http://localhost').split(',')

# ==========================================
# 2. INSTALLED APPS (Social Login & Payment Integrated)
# ==========================================
INSTALLED_APPS = [
    'daphne', # [ASGI] Primeiro para gerenciar WebSockets

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites', # Necessário para Allauth

    # Third-Party Apps
    'rest_framework',
    'django_htmx',
    'channels',
    'compressor',
    'django_celery_results',

    # [OAUTH2] Social Login
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.apple',

    # Local Apps
    'core',
]

SITE_ID = 1

# ==========================================
# 3. MIDDLEWARE & AUTH BACKENDS
# ==========================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_htmx.middleware.HtmxMiddleware',
    'allauth.account.middleware.AccountMiddleware', # Allauth Middleware
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

ROOT_URLCONF = 'bird.urls'

# ==========================================
# 4. TEMPLATES & LOGOUT
# ==========================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'bird.wsgi.application'
ASGI_APPLICATION = 'bird.asgi.application'

# ==========================================
# 5. DATABASE (Sovereignty Ready)
# ==========================================
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# ==========================================
# 6. LOGGING (Audit & JSON Integrated)
# ==========================================
# Cria pasta de logs se não existir
LOG_DIR = BASE_DIR / 'logs'
LOG_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s %(user_id)s %(ip)s',
        },
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'audit_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': LOG_DIR / 'audit_bird.json',
            'formatter': 'json',
        },
    },
    'loggers': {
        'audit': {
            'handlers': ['audit_file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}

# ==========================================
# 7. AUTHENTICATION CONFIG (Allauth & Social)
# ==========================================
LOGIN_URL = 'account_login'
LOGIN_REDIRECT_URL = 'home'
LOGOUT_REDIRECT_URL = 'account_login'

# Allauth Tweaks
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'optional'

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
    }
}

# ==========================================
# 8. MERCADO PAGO (Payment)
# ==========================================
MERCADOPAGO_ACCESS_TOKEN = os.getenv('MERCADOPAGO_ACCESS_TOKEN', '')

# ==========================================
# 9. STATIC, MEDIA & COMPRESSOR
# ==========================================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)
COMPRESS_ENABLED = not DEBUG
COMPRESS_OFFLINE = not DEBUG

# ==========================================
# 10. CHANNEL LAYER & CELERY
# ==========================================
REDIS_URL = os.getenv('REDIS_URL', 'redis://127.0.0.1:6380/0')

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [REDIS_URL]},
    }
} if os.getenv('REDIS_URL') else {
    "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
}

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = 'django-db'

# ==========================================
# 11. MISC & LIMITS
# ==========================================
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB