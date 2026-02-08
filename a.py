import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def write_file(path, content):
    file_path = BASE_DIR / path
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content.strip())
        print(f"✅ Atualizado: {path}")
    except Exception as e:
        print(f"❌ Erro em {path}: {e}")

# ==========================================
# 1. ATUALIZAR VIEW (Buscar Mensagens)
# ==========================================
def fix_chat_view_history():
    """
    Atualiza core/views/chat.py para carregar o histórico de mensagens.
    """
    content = """
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from core.models import Room

@login_required
def chat_index(request):
    # Garante que existe pelo menos uma sala global (ID 1)
    room, created = Room.objects.get_or_create(id=1, defaults={'is_group': True, 'name': 'Global'})
    
    # Carrega as últimas 50 mensagens dessa sala
    messages = room.messages.select_related('sender', 'sender__profile').order_by('created_at')[:50]
    
    return render(request, 'groups/chat.html', {
        'room': room,
        'messages': messages
    })
"""
    write_file("core/views/chat.py", content)

# ==========================================
# 2. ATUALIZAR TEMPLATE (Renderizar Histórico)
# ==========================================
def fix_chat_template_history():
    """
    Atualiza templates/groups/chat.html para mostrar o histórico
    usando o loop do Django antes do JS entrar em ação.
    """
    content = """
{% extends 'layout/base_bird.html' %}
{% load static %}

{% block main_content %}
<div class="flex flex-col h-[calc(100vh-100px)] bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
    
    <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md flex justify-between items-center">
        <h2 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <i class="fas fa-comments text-indigo-500"></i>
            Chat Global
        </h2>
        <span class="text-xs text-green-500 flex items-center gap-1">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
        </span>
    </div>

    <div id="chat-log" class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900 scroll-smooth">
        
        {% for msg in messages %}
            <div class="flex items-end gap-2 {% if msg.sender == request.user %}flex-row-reverse{% endif %} animate-fade-in">
                <div class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                    {% if msg.sender.profile.avatar %}
                        <img src="{{ msg.sender.profile.avatar.url }}" class="w-full h-full object-cover">
                    {% else %}
                        <div class="w-full h-full bg-indigo-100 flex items-center justify-center text-xs">👤</div>
                    {% endif %}
                </div>
                <div class="max-w-[70%]">
                    <div class="px-4 py-2 rounded-2xl text-sm shadow-sm 
                        {% if msg.sender == request.user %}
                            bg-indigo-600 text-white rounded-br-none
                        {% else %}
                            bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none
                        {% endif %}">
                        {{ msg.content }}
                    </div>
                    <span class="text-[10px] text-gray-400 mt-1 block {% if msg.sender == request.user %}text-right{% else %}text-left{% endif %}">
                        {{ msg.sender.username }} • {{ msg.created_at|date:"H:i" }}
                    </span>
                </div>
            </div>
        {% empty %}
            <div class="text-center text-gray-400 text-sm mt-10" id="empty-state">
                Nenhuma mensagem anterior. Diga olá! 👋
            </div>
        {% endfor %}

    </div>

    <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div class="flex gap-2 items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
            <input id="chat-message-input" type="text" 
                   class="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400"
                   placeholder="Escreva uma mensagem...">
            
            <button id="chat-message-submit" class="bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95">
                <i class="fas fa-paper-plane text-sm"></i>
            </button>
        </div>
    </div>
</div>

<script>
    const roomName = "{{ room.id }}"; 
    const chatLog = document.querySelector('#chat-log');
    
    // Auto-scroll para o fundo ao carregar
    chatLog.scrollTop = chatLog.scrollHeight;

    const chatSocket = new WebSocket(
        (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
        window.location.host +
        '/ws/chat/' + roomName + '/'
    );

    const userInput = document.querySelector('#chat-message-input');

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        const isMe = data.username === "{{ request.user.username }}";
        
        // Remove empty state se existir
        const emptyState = document.getElementById('empty-state');
        if(emptyState) emptyState.remove();

        const msgHTML = `
            <div class="flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''} animate-fade-in-up">
                <div class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                    ${data.avatar_url ? `<img src="${data.avatar_url}" class="w-full h-full object-cover">` : '<div class="w-full h-full bg-indigo-100 flex items-center justify-center text-xs">👤</div>'}
                </div>
                <div class="max-w-[70%]">
                    <div class="px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}">
                        ${data.message}
                    </div>
                    <span class="text-[10px] text-gray-400 mt-1 block ${isMe ? 'text-right' : 'text-left'}">
                        ${data.username} • ${data.timestamp}
                    </span>
                </div>
            </div>
        `;
        
        chatLog.insertAdjacentHTML('beforeend', msgHTML);
        chatLog.scrollTop = chatLog.scrollHeight;
    };

    chatSocket.onclose = function(e) { console.error('Chat socket fechado'); };

    document.querySelector('#chat-message-submit').onclick = function(e) {
        const message = userInput.value;
        if(message.trim()) {
            chatSocket.send(JSON.stringify({'message': message}));
            userInput.value = '';
        }
    };

    userInput.onkeyup = function(e) {
        if (e.keyCode === 13) document.querySelector('#chat-message-submit').click();
    };
</script>
{% endblock %}
"""
    write_file("templates/groups/chat.html", content)

if __name__ == "__main__":
    print("🧠 Conectando Memória do Chat (Histórico)...")
    fix_chat_view_history()
    fix_chat_template_history()
    print("✅ Feito! As mensagens agora persistem.")
    print("👉 Reinicie o Django: docker-compose restart bird-app")