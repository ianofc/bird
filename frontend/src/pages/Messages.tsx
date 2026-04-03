import React, { useState, useEffect, useRef } from 'react';
import { BirdLayout } from "@/components/bird/BirdLayout";
import { 
  Send, Paperclip, MoreVertical, Search, Phone, 
  Smile, Lock, Image as ImageIcon, Mic, ShieldAlert, Sparkles, CheckCheck
} from 'lucide-react';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // MESTRE DA GAMIFICAÇÃO (Continua ativo, mas elegante)
  const [affinityLevel, setAffinityLevel] = useState(1);
  const [messagesSentInSession, setMessagesSentInSession] = useState(0);

  const myUserId = "user-1"; 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Carrega mensagens iniciais para dar contexto
    setMessages([
      { id: '1', sender_id: 'user-2', content: 'Oi! Vi que você atualizou o ecossistema.', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'read' },
      { id: '2', sender_id: myUserId, content: 'Sim! Agora o Gaia está com a identidade do Telegram.', timestamp: new Date(Date.now() - 3500000).toISOString(), status: 'read' },
      { id: '3', sender_id: 'user-2', content: 'Ficou muito mais limpo e elegante.', timestamp: new Date(Date.now() - 3400000).toISOString(), status: 'read' },
    ]);
  }, []);

  useEffect(() => {
    if (messagesSentInSession === 2 && affinityLevel === 1) {
      setAffinityLevel(2);
      toast.success("Nível Bronze! Envio de fotos desbloqueado.", { icon: "📸" });
    } else if (messagesSentInSession === 5 && affinityLevel === 2) {
      setAffinityLevel(3);
      toast.success("Nível Prata! Áudios desbloqueados.", { icon: "🎤" });
    }
  }, [messagesSentInSession, affinityLevel]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, {
      id: `temp-${Date.now()}`,
      sender_id: myUserId,
      content: input,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }]);

    setInput('');
    setMessagesSentInSession(prev => prev + 1);

    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: `mock-${Date.now()}`,
        sender_id: 'user-2',
        content: "A responsividade desse chat é absurda. 💜",
        timestamp: new Date().toISOString(),
        status: 'delivered'
      }]);
    }, 2500);
  };

  return (
    <BirdLayout>
      <div className="w-full max-w-[1300px] mx-auto h-[calc(100vh-2rem)] pt-2 md:pt-4 pb-4 px-2 md:px-0">
        
        {/* Container Principal: Fundo Branco/Cinza Escuro estilo Telegram */}
        <div className="w-full h-full bg-white dark:bg-[#0F172A] rounded-2xl flex overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
          
          {/* BARRA LATERAL (Lista de Chats) */}
          <div className="flex flex-col flex-shrink-0 border-r w-80 md:w-96 border-slate-200 dark:border-slate-800 bg-[#F4F4F5] dark:bg-[#0F172A] hidden md:flex">
            
            <div className="p-4 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">IS</div>
                <div className="relative flex-1">
                  <Search className="absolute w-4 h-4 text-slate-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input 
                    type="text" placeholder="Buscar" 
                    className="w-full py-1.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white bg-[#F4F4F5] dark:bg-[#1E293B] border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-[#0F172A]">
              {/* Chat Ativo (Estilo selecionado do Telegram) */}
              <div className="flex items-center gap-3 p-3 mx-2 mt-2 cursor-pointer bg-purple-600 rounded-xl text-white shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden relative bg-white/20">
                  <img src="https://i.pravatar.cc/150?u=livia" className="w-full h-full object-cover" alt="Lívia" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-purple-600 rounded-full"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-semibold text-[15px] truncate">Lívia</h4>
                    <span className="text-[11px] font-medium opacity-80">14:22</span>
                  </div>
                  <p className="text-[13px] truncate opacity-90">A responsividade desse chat é...</p>
                </div>
              </div>

              {/* Outros Chats Inativos */}
              <div className="flex items-center gap-3 p-3 mx-2 mt-1 cursor-pointer hover:bg-[#F4F4F5] dark:hover:bg-[#1E293B] rounded-xl transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
                  MB
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-semibold text-[15px] text-slate-900 dark:text-white truncate">Marcos Bird</h4>
                    <span className="text-[11px] font-medium text-slate-500">Ontem</span>
                  </div>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate">Cara, o deploy foi um sucesso.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ÁREA PRINCIPAL DO CHAT */}
          <div className="relative flex flex-col flex-1 bg-[#E4D9E2]/30 dark:bg-[#0B1120] overflow-hidden">
            {/* Padrão de Fundo Sutil (Opcional, estilo Telegram) */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Cabeçalho do Chat */}
            <div className="z-10 flex items-center justify-between h-16 px-6 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                   <img src="https://i.pravatar.cc/150?u=livia" className="w-full h-full object-cover" alt="Lívia" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    Lívia 
                    {/* Badge Sutil de Afinidade */}
                    {affinityLevel > 1 && (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-900/30 px-1.5 rounded">NV {affinityLevel}</span>
                    )}
                  </h3>
                  <p className="text-[12px] text-purple-600 dark:text-purple-400 font-medium">online</p>
                </div>
              </div>
              <div className="flex gap-1 text-slate-500">
                <button className="p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><Search className="w-5 h-5" /></button>
                <button className="p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><Phone className="w-5 h-5" /></button>
                <button className="p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Histórico */}
            <div className="flex flex-col flex-1 gap-1.5 p-4 md:p-8 overflow-y-auto scrollbar-hide z-10">
              <div className="text-center my-2">
                <span className="bg-black/10 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">Hoje</span>
              </div>

              {messages.map((msg, index) => {
                const isMe = msg.sender_id === myUserId;
                const showTail = index === messages.length - 1 || messages[index + 1].sender_id !== msg.sender_id; // Coloca "rabinho" na bolha só na última msg do bloco
                
                return (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex flex-col max-w-[85%] md:max-w-[60%] ${isMe ? 'self-end' : 'self-start'}`}>
                    <div className={`relative px-3 py-1.5 text-[14.5px] shadow-sm flex flex-wrap items-end gap-2 ${
                      isMe 
                      ? `bg-purple-600 text-white ${showTail ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl'}` 
                      : `bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white ${showTail ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl'}`
                    }`}>
                      <span className="leading-relaxed whitespace-pre-wrap">{msg.content}</span>
                      
                      {/* Meta-dados dentro da bolha (Estilo Telegram) */}
                      <div className={`flex items-center gap-1 text-[10px] float-right mt-1 ml-auto ${isMe ? 'text-purple-200' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && <CheckCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {isTyping && (
                <div className="self-start bg-white dark:bg-[#1E293B] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1 w-fit mt-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Limpo e Funcional */}
            <div className="p-3 md:p-4 bg-white dark:bg-[#0F172A] z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
              <form onSubmit={sendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                
                {/* Ações / Gamificação */}
                <div className="flex items-center gap-1 mb-1.5">
                  <button type="button" className="text-slate-400 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Smile className="w-6 h-6" />
                  </button>
                  <button type="button" className={`p-2 rounded-full transition-colors relative ${affinityLevel >= 2 ? 'text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`} title="Fotos (Nível 2)">
                    {affinityLevel >= 2 ? <Paperclip className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Caixa de Texto que cresce */}
                <div className="flex-1 bg-[#F4F4F5] dark:bg-[#1E293B] rounded-3xl flex items-center px-4 py-3 min-h-[44px]">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Mensagem" 
                    className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-500 text-[15px]"
                  />
                </div>
                
                {/* Botão de Envio ou Mic */}
                <div className="mb-1">
                  {input.trim() ? (
                    <button 
                      type="submit" 
                      className="flex items-center justify-center w-11 h-11 rounded-full bg-purple-600 text-white transition-transform active:scale-90 shadow-md"
                    >
                      <Send className="w-5 h-5 ml-1" />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className={`flex items-center justify-center w-11 h-11 rounded-full transition-colors ${affinityLevel >= 3 ? 'text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
                    >
                      {affinityLevel >= 3 ? <Mic className="w-6 h-6" /> : <Lock className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </BirdLayout>
  );
}