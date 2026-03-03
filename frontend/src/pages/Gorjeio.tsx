import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MoreVertical, Search, Phone, Video, Smile } from 'lucide-react';

// Tipagem das Mensagens
interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export default function Gorjeio() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mocks: Substitua futuramente pelo seu estado global de Autenticação (BirdContext)
  const myUserId = "user-1"; 
  const currentChatId = "user-2";

  // Rolar automaticamente para o fim do chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Conecta ao WebSocket do FastAPI
    ws.current = new WebSocket(`ws://localhost:8000/gorjeio/ws/${myUserId}?token=mock_token`);
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.event) {
        case 'message.new':
          setMessages((prev) => [...prev, {
            id: data.message_id,
            sender_id: data.sender_id || data.from_user_id || currentChatId,
            content: data.content,
            timestamp: data.timestamp || new Date().toISOString(),
            status: 'delivered'
          }]);
          setIsTyping(false);
          break;
          
        case 'message.sent_ack':
          // Atualiza a mensagem temporária para o status "enviada"
          setMessages((prev) => prev.map(msg => 
            msg.status === 'sending' ? { ...msg, status: 'sent', id: data.message_id } : msg
          ));
          break;
          
        case 'typing.started':
          setIsTyping(true);
          // Oculta o "a escrever..." após 3 segundos sem novos eventos
          setTimeout(() => setIsTyping(false), 3000);
          break;
      }
    };

    // Ping para manter a ligação ativa
    const pingInterval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ event: 'ping' }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.current?.close();
    };
  }, []);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // Envia o evento de "a escrever" para o destinatário
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ event: 'typing', to_user_id: currentChatId }));
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !ws.current) return;

    const tempId = `temp-${Date.now()}`;
    
    // Feedback otimista: renderiza a mensagem imediatamente
    setMessages((prev) => [...prev, {
      id: tempId,
      sender_id: myUserId,
      content: input,
      timestamp: new Date().toISOString(),
      status: 'sending'
    }]);

    // Dispara via WebSocket
    ws.current.send(JSON.stringify({ 
      event: 'message.send', 
      to_user_id: currentChatId, 
      content: input 
    }));
    
    setInput('');
  };

  return (
    <div className="flex items-center justify-center w-full h-screen p-4 aurora-engine md:p-8">
      
      {/* Contenedor Principal Glassmorphism */}
      <div className="w-full max-w-7xl h-full max-h-[900px] glass-panel rounded-[2.5rem] flex overflow-hidden shadow-2xl border-white/40">
        
        {/* Barra Lateral: Ninhos e Lista de Chats */}
        <div className="flex flex-col flex-shrink-0 border-r w-80 border-white/20 bg-white/10 backdrop-blur-md">
          {/* Cabeçalho da Barra Lateral */}
          <div className="p-6 pb-4">
            <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">Gorjeio</h2>
            
            {/* Barra de Pesquisa */}
            <div className="relative mb-6">
              <Search className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 left-3 top-1/2" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-full py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-600 transition-all border rounded-full bg-white/40 border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Abas dos Ninhos (Pastas) */}
            <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
              <button className="px-4 py-1.5 bg-white/60 rounded-full text-sm font-semibold text-gray-800 shadow-sm whitespace-nowrap">Todos</button>
              <button className="px-4 py-1.5 bg-white/20 hover:bg-white/40 rounded-full text-sm font-medium text-gray-700 transition-colors whitespace-nowrap border border-white/10">Dev 👨‍💻</button>
              <button className="px-4 py-1.5 bg-white/20 hover:bg-white/40 rounded-full text-sm font-medium text-gray-700 transition-colors whitespace-nowrap border border-white/10">Arte 🎨</button>
            </div>
          </div>
          
          {/* Lista de Conversas */}
          <div className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto scrollbar-hide">
            {/* Chat Ativo (Mock) */}
            <div className="flex items-center gap-3 p-3 border shadow-sm cursor-pointer bg-white/40 rounded-2xl border-white/50">
              <div className="flex-shrink-0 w-12 h-12 rounded-full shadow-inner bg-gradient-to-tr from-purple-400 to-pink-500"></div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-bold text-gray-900 truncate">Lívia</h4>
                  <span className="text-xs font-medium text-gray-600">Agora</span>
                </div>
                <p className="text-sm text-gray-700 truncate">Estou a ver, ficou incrível!</p>
              </div>
            </div>
            
            {/* Outro Chat (Mock) */}
            <div className="flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-white/20 rounded-2xl">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500"></div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-800 truncate">Equipa Bird</h4>
                  <span className="text-xs text-gray-500">Ontem</span>
                </div>
                <p className="text-sm text-gray-600 truncate">Deploy feito na produção 🚀</p>
              </div>
            </div>
          </div>
        </div>

        {/* Área Principal de Chat */}
        <div className="relative flex flex-col flex-1 bg-white/20 backdrop-blur-sm">
          
          {/* Cabeçalho do Chat */}
          <div className="z-10 flex items-center justify-between h-20 px-8 border-b border-white/30 bg-white/10 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full shadow-md bg-gradient-to-tr from-purple-400 to-pink-500"></div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Lívia</h3>
                <p className="text-sm font-medium text-emerald-600">Online</p>
              </div>
            </div>
            <div className="flex gap-4 text-gray-700">
              <button className="p-2 transition-colors rounded-full hover:bg-white/30"><Phone className="w-5 h-5" /></button>
              <button className="p-2 transition-colors rounded-full hover:bg-white/30"><Video className="w-5 h-5" /></button>
              <button className="p-2 transition-colors rounded-full hover:bg-white/30"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Histórico de Mensagens */}
          <div className="flex flex-col flex-1 gap-4 p-8 overflow-y-auto scrollbar-hide">
            <div className="my-4 text-center">
              <span className="px-3 py-1 text-xs font-medium text-gray-600 rounded-full bg-black/5 backdrop-blur-sm">Hoje</span>
            </div>
            
            {messages.map((msg) => {
              const isMe = msg.sender_id === myUserId;
              return (
                <div key={msg.id} className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`p-4 text-[15px] shadow-sm ${
                    isMe 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl rounded-tr-sm' 
                    : 'glass-card text-gray-900 rounded-3xl rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 px-2 opacity-80">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    {isMe && <span className="ml-1 font-bold">{msg.status === 'sending' ? ' •' : ' ✓'}</span>}
                  </span>
                </div>
              );
            })}
            
            {/* Indicador de Escrita */}
            {isTyping && (
              <div className="flex items-center self-start justify-center w-16 h-12 gap-1 p-4 rounded-tl-sm glass-card rounded-3xl">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensagem */}
          <div className="p-6 border-t bg-white/10 border-white/30 backdrop-blur-md">
            <form onSubmit={sendMessage} className="flex items-center gap-3 p-2 pl-4 rounded-full glass-panel">
              <button type="button" className="text-gray-500 transition-colors hover:text-gray-800">
                <Smile className="w-6 h-6" />
              </button>
              <button type="button" className="text-gray-500 transition-colors hover:text-gray-800">
                <Paperclip className="w-6 h-6" />
              </button>
              
              <input 
                type="text" 
                value={input}
                onChange={handleTyping}
                placeholder="Escreva um gorjeio..." 
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 px-2 text-[15px]"
              />
              
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="flex items-center justify-center w-10 h-10 rounded-full btn-aurora disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 ml-1" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}