from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import UserProfile  # Ajuste se o seu modelo de perfil tiver outro nome

User = get_user_model()

class Command(BaseCommand):
    help = 'Alterna o status Premium de um usuário para exibir a borda amarela'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='O username do usuário')
        parser.add_argument('--status', type=str, choices=['on', 'off'], default='on', help='on = Premium, off = Normal')

    def handle(self, *args, **options):
        username = options['username']
        is_premium = options['status'] == 'on'

        try:
            user = User.objects.get(username=username)
            
            # Tenta pegar ou criar o perfil
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Atualiza o status
            profile.is_premium = is_premium
            profile.save()

            status_msg = "PREMIUM (Borda Amarela)" if is_premium else "NORMAL (Sem Borda)"
            self.stdout.write(self.style.SUCCESS(f'Sucesso! O usuário "{username}" agora é {status_msg}.'))
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Erro: Usuário "{username}" não encontrado.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Erro desconhecido: {str(e)}'))