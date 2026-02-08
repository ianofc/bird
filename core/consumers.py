import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Entrar na sala (Redis Group)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Sair da sala
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Recebe mensagem do WebSocket (Frontend)
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        username = self.scope['user'].username
        user_id = self.scope['user'].id
        
        if not message:
            return

        # Salvar na base de dados
        await self.save_message(user_id, self.room_name, message)

        # Enviar mensagem para o grupo (Redis)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': username,
                'avatar_url': await self.get_user_avatar(user_id),
                'timestamp': timezone.now().strftime('%H:%M')
            }
        )

    # Recebe mensagem do grupo (Redis) e envia para o WebSocket
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
            'avatar_url': event['avatar_url'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def save_message(self, user_id, room_name, content):
        from django.contrib.auth.models import User
        from core.models import Message, Room
        
        user = User.objects.get(id=user_id)
        # Tenta encontrar a sala ou cria uma genérica se não existir (fallback)
        try:
            room = Room.objects.get(id=int(room_name)) if room_name.isdigit() else Room.objects.first()
        except:
            return None
            
        if room:
            Message.objects.create(room=room, sender=user, content=content)

    @database_sync_to_async
    def get_user_avatar(self, user_id):
        from django.contrib.auth.models import User
        try:
            user = User.objects.get(id=user_id)
            if user.profile.avatar:
                return user.profile.avatar.url
        except:
            pass
        return None