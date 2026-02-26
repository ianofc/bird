import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close(code=4401)
            return

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        allowed = await self.is_room_member(user.id, self.room_name)
        if not allowed:
            await self.close(code=4403)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            return

        event_type = payload.get('type', 'message')
        user = self.scope['user']

        if event_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_event',
                    'username': user.username,
                },
            )
            return

        if event_type == 'read':
            await self.mark_room_read(user.id, self.room_name)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'read_event',
                    'username': user.username,
                    'timestamp': timezone.now().strftime('%H:%M'),
                },
            )
            return

        message = (payload.get('message') or '').strip()
        if not message:
            return

        saved = await self.save_message(user.id, self.room_name, message)
        if not saved:
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message_id': saved['id'],
                'message': saved['content'],
                'username': saved['username'],
                'timestamp': saved['timestamp'],
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    'type': 'message',
                    'message_id': event['message_id'],
                    'message': event['message'],
                    'username': event['username'],
                    'timestamp': event['timestamp'],
                }
            )
        )

    async def typing_event(self, event):
        await self.send(text_data=json.dumps({'type': 'typing', 'username': event['username']}))

    async def read_event(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    'type': 'read',
                    'username': event['username'],
                    'timestamp': event['timestamp'],
                }
            )
        )

    @database_sync_to_async
    def is_room_member(self, user_id, room_name):
        from core.models import Room

        try:
            room = Room.objects.get(id=int(room_name))
        except (Room.DoesNotExist, ValueError, TypeError):
            return False

        return room.participants.filter(id=user_id).exists()

    @database_sync_to_async
    def save_message(self, user_id, room_name, content):
        from django.contrib.auth.models import User
        from core.models import Message, Room

        try:

            user = User.objects.get(id=user_id)
            room = Room.objects.get(id=int(room_name))
        except (User.DoesNotExist, Room.DoesNotExist, ValueError, TypeError):
            return None

        if not room.participants.filter(id=user_id).exists():

            return None

        message = Message.objects.create(room=room, sender=user, content=content)
        return {
            'id': message.id,
            'content': message.content,
            'username': user.username,
            'timestamp': timezone.localtime(message.created_at).strftime('%H:%M'),
        }

    @database_sync_to_async
    def mark_room_read(self, user_id, room_name):
        from core.models import Message, Room

        try:

            room = Room.objects.get(id=int(room_name))
        except (Room.DoesNotExist, ValueError, TypeError):
            return

        Message.objects.filter(room=room, is_read=False).exclude(sender_id=user_id).update(is_read=True)
