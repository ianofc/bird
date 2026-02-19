from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import Profile

class UserSerializer(serializers.ModelSerializer):
    initials = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    
    # Campos que vêm do relacionamento com Profile
    bio = serializers.CharField(source='profile.bio', read_only=True)
    is_premium = serializers.BooleanField(source='profile.is_premium', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'first_name', 
            'last_name', 
            'email', 
            'initials', 
            'avatar', 
            'bio', 
            'date_joined',
            'is_premium'  # Adicionado aqui
        ]
    
    def get_initials(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name[0]}{obj.last_name[0]}".upper()
        return obj.username[:2].upper()
    
    def get_avatar(self, obj):
        # Verifica se o perfil existe e se tem avatar
        if hasattr(obj, 'profile') and obj.profile.avatar:
            try:
                return obj.profile.avatar.url
            except ValueError:
                return None
        return None