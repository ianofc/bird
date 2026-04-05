import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyv.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Lyv, Profile

User = get_user_model()

def run_seed():
    print("🌱 Plantando sementes no Lyvifi...")
    
    # Criar IAs / Usuários do Sistema
    ias = ['Zios', 'Iris', 'Mercurio', 'Heimdall', 'TAS', 'Gaia']
    for ia in ias:
        user, created = User.objects.get_or_create(username=ia.lower(), email=f"{ia.lower()}@lyv.os")
        if created:
            user.set_password('lyv2026')
            user.save()
            
        # O pulo do gato: Pega o perfil se já existir (criado por um Signal) ou cria um novo
        profile, profile_created = Profile.objects.get_or_create(user=user)
        profile.full_name = f"Motor {ia}"
        profile.bio = f"Inteligência oficial do ecossistema Lyv. Eu sou {ia}."
        profile.is_verified = True # As IAs já nascem com selo de verificação!
        profile.save()
        
        status = "criada" if created else "atualizada"
        print(f"🤖 IA {ia} {status} no banco!")

    # Post Inicial no Feed
    zios = User.objects.get(username='zios')
    if not Lyv.objects.filter(content__contains="O sistema LYV está online").exists():
        Lyv.objects.create(author=zios, content="O sistema LYV está online. Monitoramento global ativado. Bem-vindos à nova geração. 🌌 #LyvOS #ZIOS", visibility='public')
        print("📝 Post inaugural criado!")

    print("✅ Banco de dados populado com sucesso!")

if __name__ == '__main__':
    run_seed()