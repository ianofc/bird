import os
import django
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bird.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Profile, Connection, SocialBond, Room

def populate():
    print("🧪 Iniciando população de teste (Modo Seguro)...")

    test_users_data = [
        ('alice_wonder', 'Alice Wonderland', 'Explorando o país das maravilhas digital.'),
        ('bob_builder', 'Bob Construtor', 'Sim, nós podemos codar!'),
        ('carlos_drummond', 'Carlos D.', 'No meio do caminho tinha uma pedra.'),
        ('diana_prince', 'Diana Prince', 'Amazonian dev fullstack.'),
        ('elon_musketeiro', 'Elon Musketeiro', 'Foguetes e tweets polêmicos.'),
        ('fiona_shrek', 'Fiona Ogra', 'Pântano life style.'),
        ('goku_son', 'Goku Son', 'Em busca das esferas do código.'),
        ('harry_potter', 'Harry P.', 'O menino que sobreviveu aos bugs.'),
        ('indiana_jones', 'Indy Jones', 'Arqueologia de dados legados.'),
        ('julia_roberts', 'Julia R.', 'Uma linda mulher programadora.')
    ]

    try:
        main_user = User.objects.get(username='iansantos')
        print(f"✅ Usuário principal: {main_user.username}")
    except User.DoesNotExist:
        print("⚠️ Usuário 'iansantos' não encontrado. Criando...")
        main_user = User.objects.create_user('iansantos', 'ian@test.com', '123')

    all_users = [main_user]

    # 1. CRIAR USUÁRIOS
    for username, fullname, bio in test_users_data:
        # get_or_create retorna uma tupla (objeto, criado_agora?)
        user, created = User.objects.get_or_create(username=username, defaults={'email': f'{username}@test.com'})
        
        if created:
            user.set_password('123')
            user.save()
            print(f"   + Criado: {username}")
        else:
            print(f"   - Já existe: {username}")

        # Garante que o perfil existe e atualiza
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.full_name = fullname
        profile.bio = bio
        profile.save()
        
        all_users.append(user)

    # 2. CONEXÕES
    print("\n🔗 Sincronizando conexões...")
    count = 0
    for u1 in all_users:
        for u2 in all_users:
            if u1 == u2: continue
            
            # Connection
            if not Connection.objects.filter(follower=u1, target=u2).exists():
                Connection.objects.create(follower=u1, target=u2, status='active')
                count += 1
            
            # SocialBond (Apenas 1 por par)
            # Evita duplicatas verificando os dois lados
            has_bond = SocialBond.objects.filter(requester=u1, target=u2).exists() or \
                       SocialBond.objects.filter(requester=u2, target=u1).exists()
            
            if not has_bond:
                SocialBond.objects.create(requester=u1, target=u2, type='friend', status='accepted')

    print(f"   + {count} novas conexões criadas.")

    # 3. CHATS
    print("\n💬 Verificando chats...")
    # Cria chats entre iansantos e os 3 primeiros
    for other in all_users[1:4]:
        # Verifica se já existe sala DM
        exists = Room.objects.filter(type='dm', participants=main_user).filter(participants=other).exists()
        if not exists:
            room = Room.objects.create(type='dm')
            room.participants.add(main_user, other)
            print(f"   + Chat DM criado: {main_user.username} <-> {other.username}")

    print("\n🎉 Concluído com sucesso!")

if __name__ == '__main__':
    populate()
    print("   docker-compose exec bird-app python a.py")