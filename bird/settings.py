"""
Django settings for bird project.
Generated for 'Project Bird' - The X Clone.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# Carregar variáveis de ambiente
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================================
# 1. CORE SETTINGS
# ==========================================
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me-in-production-bird-project')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

# ==========================================
# 2. APPS DEFINITION
# ==========================================
INSTALLED_APPS = [
    # Daphne deve ser o primeiro para suportar ASGI/WebSockets
    'daphne',
    
    # Django Apps padrão
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Apps (Baseados no seu requirements.txt)
    'rest_framework',       # API
    'django_htmx',          # Frontend Dinâmico
    'channels',             # Real-time / WebSockets
    'compressor',           # Otimização de Assets
    
    # Se você for usar o django-tailwind, descomente a linha abaixo após criar o app 'theme'
    # 'tailwind',
    # 'theme',

    # LOCAL APPS
    'core',                 # Seu app principal (antigo feed)
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Servir estáticos em prod
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_htmx.middleware.HtmxMiddleware', # Middleware do HTMX
]

ROOT_URLCONF = 'bird.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], # Apontando para sua pasta de templates existente
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

# Configuração WSGI e ASGI
WSGI_APPLICATION = 'bird.wsgi.application'
ASGI_APPLICATION = 'bird.asgi.application'

# ==========================================
# 3. DATABASE
# ==========================================
# Padrão SQLite, mas aceita Postgres via URL no .env (DATABASE_URL)
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600
    )
}

# ==========================================
# 4. PASSWORD VALIDATION
# ==========================================
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]

# ==========================================
# 5. INTERNATIONALIZATION
# ==========================================
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# ==========================================
# 6. STATIC & MEDIA FILES
# ==========================================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Onde o Django vai procurar seus arquivos CSS/JS soltos
STATICFILES_DIRS = [
    BASE_DIR / 'static', 
]

# Onde os uploads (avatares, imagens de posts) ficam
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Configuração do Compressor (para minificar CSS/JS)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)

# ==========================================
# 7. CHANNEL LAYER (REDIS)
# ==========================================
# Necessário para WebSockets. Se não tiver Redis local, usa memória.
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(os.getenv('REDIS_HOST', '127.0.0.1'), int(os.getenv('REDIS_PORT', 6379)))],
        },
    } if os.getenv('REDIS_HOST') else {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}

# ==========================================
# 8. DJANGO REST FRAMEWORK
# ==========================================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# ==========================================
# 9. ID DE CAMPO PADRÃO
# ==========================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# URL de Login (para redirecionamentos automáticos)
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = 'login'