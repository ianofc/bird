import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { 
  Search, Edit, MoreVertical, Phone, Video, Send, 
  Smile, Loader2, Sparkles, CheckCheck, Paperclip, 
  Lock, Mic, Plus, X, UserPlus
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useLyv } from "@/contexts/LyvContext";
import { toast } from "sonner";

export default function Messages() {
  const { currentUser } = useLyv();
  
  // --- ESTADOS DA API (Salas e Mensagens) ---
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // --- ESTADOS: NOVA CONVERSA ---
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState("");
  const [newChatResults, setNewChatResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // --- ESTADOS: GAMIFICAÇÃO (Gaia Sync) ---
  const [affinityLevel, setAffinityLevel] = useState(1);
  const [messagesSentInSession, setMessagesSentInSession] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ==========================================
  // BUSCA INICIAL: CONTATOS/SALAS (Agoras)
  // ==========================================
  const fetchRooms = async (selectRoomId?: number) => {
    try {
      const response = await api.get('/chat/rooms/');
      setRooms(response.data);
      
      // Se passou um ID para selecionar automaticamente (após criar chat novo)
      if (selectRoomId) {
        const roomToSelect = response.data.find((r: any) => r.id === selectRoomId);
        if (roomToSelect) handleSelectRoom(roomToSelect);
      } else if (response.data.length > 0 && !activeRoom) {
        handleSelectRoom(response.data[0]);
      }
    } catch (error) {
      toast.error("O Gaia encontrou uma turbulência ao carregar seus contatos.");
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // BUSCA MENSAGENS DA SALA ATIVA
  // ==========================================
  const handleSelectRoom = async (room: any) => {
    setActiveRoom(room);
    setIsLoadingMessages(true);
    try {
      const response = await api.get(`/chat/rooms/${room.id}/messages/`);
      setMessages(response.data);
      
      // Zera o contador visual de unread
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r));
    } catch (error) {
      toast.error("Falha ao carregar o histórico de conversas.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // ==========================================
  // NOVA CONVERSA (INICIAR DM)
  // ==========================================
  useEffect(() => {
    if (!newChatQuery.trim()) {
      setNewChatResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await api.get(`/search/?q=${encodeURIComponent(newChatQuery)}`);
        setNewChatResults(res.data.users || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [newChatQuery]);

  const handleStartNewChat = async (username: string) => {
    try {
      const response = await api.post('/chat/start-dm/', { username });
      await fetchRooms(response.data.room_id);
      setIsNewChatModalOpen(false);
      setNewChatQuery("");
      toast.success("Canal seguro estabelecido!");
    } catch (error) {
      toast.error("Não foi possível iniciar a conversa.");
    }
  };

  // ==========================================
  // ENVIAR MENSAGEM E GAMIFICAÇÃO
  // ==========================================
  useEffect(() => {
    if (messagesSentInSession === 3 && affinityLevel === 1) {
      setAffinityLevel(2);
      toast.success("Nível Prata Alcançado! 📸 Envio de fotos desbloqueado no Gaia.");
    } else if (messagesSentInSession === 8 && affinityLevel === 2) {
      setAffinityLevel(3);
      toast.success("Nível Ouro Alcançado! 🎤 Envio de áudios desbloqueado no Gaia.");
    }
  }, [messagesSentInSession, affinityLevel]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom) return;

    const myUsername = currentUser?.handle?.replace('@', '') || "user";
    const tempMsg = {
      id: `temp-${Date.now()}`,
      content: inputText,
      sender_username: myUsername,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setInputText("");
    setMessagesSentInSession(prev => prev + 1);

    try {
      const response = await api.post(`/chat/rooms/${activeRoom.id}/messages/`, { content: tempMsg.content });
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...response.data, status: 'delivered' } : m));
      setRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, last_message: tempMsg.content, last_message_at: tempMsg.timestamp } : r));
    } catch (error) {
      toast.error("Falha ao enviar mensagem.");
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  return (
    <LyvLayout>
      <div className="w-full max-w-[1300px] mx-auto h-[calc(100vh-2rem)] pt-2 md:pt-4 pb-4 px-2 md:px-0">
        
        {/* CONTAINER PRINCIPAL */}
        <div className="w-full h-full bg-white dark:bg-[#0F172A] rounded-[2rem] flex overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
          
          {/* ========================================== */}
          {/* PAINEL ESQUERDO: Lista de Contatos           */}
          {/* ========================================== */}
          <div className={`flex flex-col flex-shrink-0 border-r w-full md:w-[350px] lg:w-[400px] border-slate-200 dark:border-slate-800 bg-[#F8F9FB] dark:bg-[#0B1120] ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Header Lateral */}
            <div className="p-6 pb-4 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-md border-2 border-white dark:border-[#0F172A]">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Gaia</h1>
                </div>
                
                {/* Botão de Nova Conversa */}
                <button 
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="p-2.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl shadow-sm hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> <span className="text-xs font-bold hidden lg:block">Nova</span>
                </button>
              </div>

              <div className="relative group">
                <Search className="absolute w-4 h-4 text-slate-400 -translate-y-1/2 left-4 top-1/2 group-focus-within:text-cyan-500 transition-colors" />
                <input 
                  type="text" placeholder="Buscar nas conversas..." 
                  className="w-full py-2.5 pl-11 pr-4 text-sm bg-slate-100 dark:bg-slate-900/50 border border-transparent rounded-xl focus:outline-none focus:border-cyan-500/30 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Lista de Salas */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pt-3 pb-4">
              <AnimatePresence mode="wait">
                {isLoadingRooms ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center p-10">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  </motion.div>
                ) : rooms.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-6 mt-10">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma conexão ainda.</p>
                    <p className="text-xs text-slate-500 mt-2">Use o botão Nova acima para buscar amigos e iniciar uma transmissão.</p>
                  </motion.div>
                ) : (
                  <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {rooms.map((room) => {
                      const isActive = activeRoom?.id === room.id;
                      return (
                        <div 
                          key={room.id}
                          onClick={() => handleSelectRoom(room)}
                          className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all mb-1 ${
                            isActive 
                            ? 'bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 shadow-sm' 
                            : 'hover:bg-white dark:hover:bg-slate-800/50 border border-transparent'
                          }`}
                        >
                          <Avatar className="w-14 h-14 shadow-sm border border-slate-200 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800">
                            <AvatarImage src={room.avatar} className="object-cover" />
                            <AvatarFallback className="font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 text-lg">
                              {room.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h3 className={`font-bold text-[15px] truncate pr-2 ${isActive ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>{room.name}</h3>
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                {room.last_message_at ? new Date(room.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className={`text-[13px] truncate pr-2 ${room.unread_count > 0 ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                                {room.last_message || "Iniciar conexão..."}
                              </p>
                              {room.unread_count > 0 && (
                                <span className="bg-cyan-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 shadow-sm">
                                  {room.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ========================================== */}
          {/* PAINEL DIREITO: Chat Ativo                   */}
          {/* ========================================== */}
          {activeRoom ? (
            <div className={`flex-1 flex-col bg-white dark:bg-[#0F172A] relative ${activeRoom ? 'flex' : 'hidden md:flex'}`}>
              
              {/* Pattern Subtil (Telegram Style) */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

              {/* Header do Chat */}
              <div className="px-6 h-20 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-20 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                  <button onClick={() => setActiveRoom(null)} className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 dark:text-slate-300"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  
                  <Avatar className="w-12 h-12 shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={activeRoom.avatar} className="object-cover" />
                    <AvatarFallback className="font-bold text-cyan-700 bg-cyan-50">{activeRoom.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                      {activeRoom.name} 
                      {/* Gamificação Visível */}
                      {affinityLevel > 1 && (
                        <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-sm shadow-sm">
                          Nível {affinityLevel}
                        </span>
                      )}
                    </h2>
                    <span className="text-xs font-semibold text-emerald-500">Conectado</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="p-2.5 text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-500/10 rounded-full transition-colors hidden sm:block"><Search className="w-5 h-5" /></button>
                  <button className="p-2.5 text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-500/10 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
                  <button className="p-2.5 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-500/10 rounded-full transition-colors"><Video className="w-5 h-5" /></button>
                  <button className="p-2.5 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Área de Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 z-10 scrollbar-hide relative bg-[#F4F4F5]/50 dark:bg-[#0B1120]/50">
                 
                 <div className="text-center my-6">
                    <span className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                      Criptografia Heimdall Ativada
                    </span>
                 </div>

                 {isLoadingMessages ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
                 ) : messages.map((msg, idx) => {
                  const myUsername = currentUser?.handle?.replace('@', '') || "user";
                  const isMe = msg.sender_username === myUsername;
                  const showTail = idx === messages.length - 1 || messages[idx + 1]?.sender_username !== msg.sender_username;
                  
                  return (
                    <motion.div key={msg.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex flex-col max-w-[85%] md:max-w-[65%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`relative px-4 py-2 text-[15px] shadow-sm flex flex-col gap-1 ${
                        isMe 
                        ? `bg-cyan-600 text-white ${showTail ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl'}` 
                        : `bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 ${showTail ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl'}`
                      }`}>
                        <span className="leading-relaxed whitespace-pre-wrap">{msg.content}</span>
                        
                        <div className={`flex items-center justify-end gap-1 text-[10px] font-bold mt-0.5 ${isMe ? 'text-cyan-200' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'text-white' : 'opacity-70'}`} />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Input de Envio Otimizado */}
              <div className="p-4 bg-white dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800 z-20 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                  
                  {/* Gamificação / Anexos */}
                  <div className="flex gap-1 mb-1.5">
                    <button type="button" className="p-2 text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><Smile className="w-6 h-6" /></button>
                    <button 
                      type="button" 
                      className={`p-2 rounded-full transition-colors relative hidden sm:block ${affinityLevel >= 2 ? 'text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
                      title={affinityLevel >= 2 ? "Anexar Arquivo" : "Desbloqueie no Nível Prata"}
                    >
                      {affinityLevel >= 2 ? <Paperclip className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center px-4 py-1.5 border border-transparent focus-within:border-cyan-300 dark:focus-within:border-cyan-500/30 transition-all shadow-inner">
                    <input 
                      type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                      placeholder="Mensagem para o Gaia..." 
                      className="flex-1 bg-transparent border-none outline-none text-[15px] py-3 text-slate-900 dark:text-white placeholder:text-slate-500"
                    />
                  </div>
                  
                  <div className="mb-0.5">
                    {inputText.trim() ? (
                      <button type="submit" className="w-12 h-12 shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95">
                        <Send className="w-5 h-5 ml-1" />
                      </button>
                    ) : (
                      <button type="button" className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-full transition-colors ${affinityLevel >= 3 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200' : 'bg-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}>
                        {affinityLevel >= 3 ? <Mic className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* ESTADO VAZIO: Nenhuma conversa selecionada */
            <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#F8F9FB] dark:bg-[#0B1120] relative overflow-hidden">
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 flex flex-col items-center text-center p-8">
                 <div className="w-24 h-24 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                   <Sparkles className="w-10 h-10 text-white" />
                 </div>
                 <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Bem-vindo ao Gaia</h2>
                 <p className="text-slate-500 max-w-xs leading-relaxed font-medium mb-8">Selecione uma conversa ou inicie uma nova transmissão segura protegida pelo Heimdall.</p>
                 <Button onClick={() => setIsNewChatModalOpen(true)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl px-8 h-12 font-bold shadow-lg hover:scale-105 transition-transform border-0">
                    <Plus className="w-5 h-5 mr-2" /> Iniciar Conversa
                 </Button>
               </motion.div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: NOVA CONVERSA (INICIAR DM)          */}
      {/* ========================================== */}
      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button onClick={() => setIsNewChatModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="w-5 h-5" /></button>
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Nova Conversa</h2>
              </div>
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120]">
                <div className="relative">
                  <Search className="absolute w-5 h-5 text-slate-400 left-3 top-3" />
                  <input 
                    type="text" autoFocus
                    value={newChatQuery} onChange={e => setNewChatQuery(e.target.value)}
                    placeholder="Pesquisar por nome ou @usuario..." 
                    className="w-full py-3 pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-cyan-500 dark:focus:border-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-2 h-[350px] overflow-y-auto scrollbar-hide bg-white dark:bg-[#0F172A]">
                {isSearchingUsers ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-cyan-500 animate-spin" /></div>
                ) : newChatQuery && newChatResults.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm mt-10">Nenhum usuário encontrado.</p>
                ) : newChatResults.length > 0 ? (
                  newChatResults.map(user => (
                    <div 
                      key={user.id} onClick={() => handleStartNewChat(user.username)}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors"
                    >
                      <Avatar className="w-12 h-12 border border-slate-200 dark:border-slate-700">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-cyan-100 text-cyan-700 font-bold">{user.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-[15px]">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.handle}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center mt-16 opacity-50">
                    <UserPlus className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Busque no Multiverso</p>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </LyvLayout>
  );
}