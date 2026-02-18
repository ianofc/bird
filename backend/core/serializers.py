# backend/core/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import Profile

class UserSerializer(serializers.ModelSerializer):
    initials = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    bio = serializers.CharField(source='profile.bio', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 
                  'initials', 'avatar', 'bio', 'date_joined']
    
    def get_initials(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name[0]}{obj.last_name[0]}".upper()
        return obj.username[:2].upper()
    
    def get_avatar(self, obj):
        if hasattr(obj, 'profile') and obj.profile.avatar:
            return obj.profile.avatar.url
        return None


# backend/core/views/api_views.py (ou adicionar em auth.py)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from core.serializers import UserSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_api(request):
    """
    Endpoint DRF para usuário logado.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)