import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Share2, Users, Gift, Smile, Swords } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Live } from "@/pages/Canais"; // Importando o tipo
import { toast } from "sonner";

interface LiveMessage {
  id: string;
  user_name: string;
  content: string;
  isGift?: boolean;
}

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: Live | null;
}

export function LiveStreamModal({ isOpen, onClose, stream }: LiveStreamModalProps) {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const viewers = [
    { id: 'v1', avatar: 'https://i.pravatar.cc/150?u=v1' }, { id: 'v2', avatar: 'https://i.pravatar.cc/150?u=v2' }, 
    { id: 'v3', avatar: 'https://i.pravatar.cc/150?u=v3' }
  ];

  useEffect(() => {
    if (!isOpen) return;
    setMessages([
      { id: 'm1', user_name: 'MarcosDev', content: 'Entrando na live! 🔥' },
      { id: 'm2', user_name: 'CEEPS_fan', content: 'Manda salveee!' },
    ]);
  }, [isOpen]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), user_name: 'Você', content: input }]);
    setInput('');
  };

  const sendGift = () => {
    setMessages(prev => [...prev, { id: Date.now().toString(), user_name: 'Você', content: 'Enviou um 💎 Diamante!', isGift: true }]);
    toast.success("Presente enviado com sucesso!", { icon: "💎" });
  };

  if (!isOpen || !stream) return null;

  // --- RENDERIZADOR DE LAYOUT DO VÍDEO BASEADO NO TIPO ---
  const renderVideoLayout = () => {
    if (stream.type === 'pk' && stream.participants.length >= 2) {
      const [host, rival] = stream.participants;
      const totalPoints = (host.pkPoints || 0) + (rival.pkPoints || 0) || 1;
      const hostPercent = ((host.pkPoints || 0) / totalPoints) * 100;

      return (
        <div className="absolute inset-0 w-full h-full flex bg-black">
          {/* Lado Esquerdo (Host) */}
          <div className="w-1/2 h-full relative border-r-2 border-yellow-400">
            <video src={host.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
            <div className="absolute bottom-[40%] w-full flex justify-center">
               <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">{host.name}</span>
            </div>
          </div>
          {/* Lado Direito (Rival) */}
          <div className="w-1/2 h-full relative">
            <video src={rival.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
            <div className="absolute bottom-[40%] w-full flex justify-center">
               <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">{rival.name}</span>
            </div>
          </div>
          
          {/* Barra PK flutuante no topo centro */}
          <div className="absolute top-[100px] left-1/2 transform -translate-x-1/2 w-[80%] max-w-sm z-30">
             <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-yellow-900 border-2 border-yellow-300 rounded-full p-1.5 shadow-xl z-10 animate-bounce">
                <Swords className="w-4 h-4" />
             </div>
             <div className="w-full h-4 bg-purple-600 rounded-full overflow-hidden flex shadow-lg border-2 border-white/20">
                <div style={{ width: `${hostPercent}%` }} className="h-full bg-cyan-500 transition-all duration-500"></div>
             </div>
             <div className="flex justify-between mt-1 px-1">
                <span className="text-[10px] font-black text-cyan-400 drop-shadow-md">{host.pkPoints}</span>
                <span className="text-[10px] font-black text-purple-400 drop-shadow-md">{rival.pkPoints}</span>
             </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
        </div>
      );
    }

    if (stream.type === 'sala' && stream.participants.length > 1) {
      const [host, ...guests] = stream.participants;
      return (
        <div className="absolute inset-0 w-full h-full flex flex-col bg-slate-900">
           {/* Host (Metade superior) */}
           <div className="w-full h-1/2 relative">
             <video src={host.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
             <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">{host.name}</div>
           </div>
           {/* Convidados (Metade inferior em Grid) */}
           <div className="w-full h-1/2 grid grid-cols-2 gap-1 bg-black p-1">
             {guests.slice(0, 4).map(guest => (
               <div key={guest.id} className="relative w-full h-full bg-slate-800 rounded-xl overflow-hidden">
                 <video src={guest.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                 <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">{guest.name}</div>
               </div>
             ))}
           </div>
           <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
        </div>
      );
    }

    // Normal (1 usuário)
    return (
      <div className="absolute inset-0 w-full h-full bg-black">
        <video src={stream.participants[0]?.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-0 md:p-6"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-full max-w-[500px] md:rounded-[2.5rem] bg-slate-900 shadow-2xl overflow-hidden border-0 md:border border-white/10"
        >
          
          {/* VÍDEO RENDERIZADO DINAMICAMENTE */}
          {renderVideoLayout()}

          {/* --- TOP HEADER (Informações e Fechar) --- */}
          <div className="absolute z-30 top-4 md:top-6 left-4 right-4 flex items-start justify-between pointer-events-none">
            
            {/* Streamer Host Info */}
            <div className="flex items-center gap-2 p-1.5 pr-4 bg-black/40 backdrop-blur-md rounded-full border border-white/10 pointer-events-auto shadow-lg">
              <Avatar className="w-9 h-9 border border-white">
                <AvatarImage src={stream.participants[0]?.avatar} />
                <AvatarFallback>{stream.creator.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-white text-[13px] leading-tight">{stream.creator}</span>
                <span className="text-[10px] text-emerald-400 font-medium">Ao Vivo</span>
              </div>
              <button className="ml-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-[10px] font-bold px-3 py-1 rounded-full transition-colors">
                Seguir
              </button>
            </div>

            {/* Viewers & Fechar */}
            <div className="flex flex-col items-end gap-2 pointer-events-auto">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <Users className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-xs font-bold">{stream.viewers}</span>
              </div>
              <div className="flex -space-x-2">
                {viewers.map(v => (
                  <Avatar key={v.id} className="w-7 h-7 border border-black shadow-md"><AvatarImage src={v.avatar} /></Avatar>
                ))}
              </div>
            </div>
          </div>
          
          {/* Botão de Fechar absoluto (sempre visível) */}
          <button onClick={onClose} className="absolute z-40 top-4 right-4 md:top-6 md:right-6 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-rose-500 transition-colors border border-white/10">
             <X className="w-4 h-4" />
          </button>

          {/* --- CHAT FLUTUANTE (Bottom Left) --- */}
          <div className="absolute z-20 bottom-20 left-4 w-64 h-56 flex flex-col gap-2 overflow-y-auto scrollbar-hide pointer-events-none">
            {/* Máscara de gradiente para suavizar mensagens antigas */}
            <div className="sticky top-0 w-full h-8 bg-gradient-to-b from-transparent to-transparent z-10" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }} />
            
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={msg.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className={`p-2 rounded-2xl text-[13px] leading-tight break-words pointer-events-auto w-fit max-w-full ${
                    msg.isGift ? 'bg-gradient-to-r from-rose-500/80 to-purple-600/80 text-white border border-rose-300/50 shadow-lg' : 'bg-black/30 backdrop-blur-md border border-white/10 text-white'
                  }`}
                >
                  <span className={`font-bold mr-2 ${msg.isGift ? 'text-yellow-300' : 'text-cyan-300'}`}>{msg.user_name}</span>
                  {msg.content}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* --- BARRA DE AÇÕES (Bottom) --- */}
          <div className="absolute z-30 bottom-0 left-0 w-full p-4 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent">
            {/* Input Chat */}
            <form onSubmit={sendMsg} className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center px-3 py-2">
              <input 
                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Fale algo..." 
                className="flex-1 bg-transparent text-white text-[13px] placeholder-slate-300 outline-none"
              />
              <button type="submit" disabled={!input.trim()} className="text-cyan-400 disabled:opacity-50"><Smile className="w-5 h-5" /></button>
            </form>

            {/* Ações Rápidas */}
            <button className="w-10 h-10 shrink-0 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-colors active:scale-95">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 shrink-0 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-colors active:scale-95">
              <Share2 className="w-5 h-5" />
            </button>
            
            {/* BOTÃO DE PRESENTE (O Mais Importante da Monetização) */}
            <motion.button 
              whileTap={{ scale: 0.9 }} onClick={sendGift}
              className="w-12 h-12 shrink-0 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg border border-white/30 animate-pulse-slow"
            >
              <Gift className="w-6 h-6 drop-shadow-md" />
            </motion.button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}