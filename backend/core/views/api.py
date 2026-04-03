
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    # Recebe dados do React
    handle = request.data.get('handle')
    password = request.data.get('password')

    if not handle or not password:
        return Response({'error': 'Preencha todos os campos.'}, status=400)

    # Limpeza do handle (remove @)
    username = handle.replace('@', '')

    # Autenticação Django Padrão
    user = authenticate(username=username, password=password)

    if user:
        # Gera ou pega o Token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': {
                'id': str(user.id),
                'name': user.get_full_name() or user.username,
                'handle': f"@{user.username}",
                'email': user.email,
                'initials': (user.username[:2]).upper(),
                'avatar': None
            }
        })
    else:
        return Response({'error': 'Usuário ou senha incorretos.'}, status=400)
