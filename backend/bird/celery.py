import os
from celery import Celery

# Define o settings padrão do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bird.settings')

app = Celery('bird')

# Lê as configurações do settings.py usando o prefixo CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Descobre tarefas automaticamente nos apps instalados (core, etc)
app.autodiscover_tasks()