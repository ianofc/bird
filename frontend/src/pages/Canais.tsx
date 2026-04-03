import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirdLayout } from "@/components/bird/BirdLayout";
import { Users, Calendar, Radio, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { LiveStreamModal } from "@/components/bird/LiveStreamModal";

// --- TIPAGEM DA LIVE ---
export type LiveType = 'normal' | 'pk' | 'sala';

export interface StreamParticipant {
  id: string;
  name: string;
  avatar: string;
  videoUrl: string;
  pkPoints?: number; // Usado se for PK
}

export interface Live {
  id: number;
  type: LiveType;
  creator: string;
  viewers: string;
  img: string; // Thumbnail principal
  participants: StreamParticipant[];
}

export default function Canais() {
  const [activeTab, setActiveTab] = useState<'lives' | 'comunidades' | 'eventos'>('lives');
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Live | null>(null);

  // MOCKS COM PLACEHOLDERS DE ALTA QUALIDADE VERTICAIS
  const lives: Live[] = [
    { 
      id: 1, type: 'normal', creator: "Ian Santos", viewers: "1.2k", 
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop", 
      participants: [{ id: 'p1', name: 'Ian Santos', avatar: 'https://i.pravatar.cc/150?u=ian', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-and-her-pet-cat-43286-large.mp4' }] 
    },
    { 
      id: 2, type: 'pk', creator: "Lívia", viewers: "8.4k", 
      img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&h=800&fit=crop", 
      participants: [
        { id: 'p2', name: 'Lívia', avatar: 'https://i.pravatar.cc/150?u=livia', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-neon-lit-room-4131-large.mp4', pkPoints: 12400 },
        { id: 'p3', name: 'Marcos', avatar: 'https://i.pravatar.cc/150?u=marcos', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-neon-lights-4130-large.mp4', pkPoints: 9800 }
      ] 
    },
    { 
      id: 3, type: 'sala', creator: "CEEPS Tech", viewers: "450", 
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=800&fit=crop", 
      participants: [
        { id: 'p4', name: 'Host', avatar: 'https://i.pravatar.cc/150?u=host', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-students-talking-in-a-classroom-43679-large.mp4' },
        { id: 'p5', name: 'Guest 1', avatar: 'https://i.pravatar.cc/150?u=g1', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-in-a-pool-1259-large.mp4' },
        { id: 'p6', name: 'Guest 2', avatar: 'https://i.pravatar.cc/150?u=g2', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-runs-past-ground-level-shot-32809-large.mp4' }
      ] 
    },
    { 
      id: 4, type: 'normal', creator: "Ana Dev", viewers: "3.1k", 
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop", 
      participants: [{ id: 'p7', name: 'Ana Dev', avatar: 'https://i.pravatar.cc/150?u=ana', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-macbook-304-large.mp4' }] 
    },
    { 
      id: 5, type: 'normal', creator: "Cyber_Gamer", viewers: "10k", 
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=800&fit=crop", 
      participants: [{ id: 'p8', name: 'Cyber_Gamer', avatar: 'https://i.pravatar.cc/150?u=cyber', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-playing-a-video-game-with-a-controller-28956-large.mp4' }] 
    },
  ];

  const handleOpenStream = (stream: Live) => {
    setSelectedStream(stream);
    setIsStreamModalOpen(true);
  };

  return (
    <BirdLayout>
      <div className="w-full max-w-[1200px] mx-auto min-h-screen pt-4 md:pt-8 pb-20 px-2 md:px-8 bg-transparent">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2 md:px-0">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 pb-2 drop-shadow-sm">
              Canais
            </h1>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute w-4 h-4 text-slate-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input 
              type="text" placeholder="Buscar em Canais..." 
              className="w-full py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white transition-all border rounded-xl bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="flex gap-2 p-1.5 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl mb-6 overflow-x-auto scrollbar-hide mx-2 md:mx-0">
          {[
            { id: 'lives', label: 'Ao Vivo', icon: Radio },
            { id: 'comunidades', label: 'Comunidades', icon: Users },
            { id: 'eventos', label: 'Eventos', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
                activeTab === tab.id ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="canaisTab" className="absolute inset-0 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/50 dark:border-white/5 -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse text-rose-500' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'lives' && (
            <motion.div key="lives" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {/* O NOVO GRID: Puro e Denso (Apenas Imagem, Espectadores e Nome) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 px-2 md:px-0">
                {lives.map((live) => (
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    key={live.id} 
                    onClick={() => handleOpenStream(live)}
                    className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg relative aspect-[3/4] bg-slate-900 border border-white/10 dark:border-white/5"
                  >
                    <img src={live.img} alt={live.creator} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    
                    {/* Gradiente escuro apenas nas pontas para leitura legível */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />
                    
                    {/* Viewers (Topo Direito) */}
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                      {live.viewers}
                    </div>

                    {/* Badge do Tipo de Live (Topo Esquerdo) */}
                    {live.type !== 'normal' && (
                      <div className={`absolute top-2 left-2 text-white text-[9px] font-black uppercase px-2 py-1 rounded backdrop-blur-md ${live.type === 'pk' ? 'bg-gradient-to-r from-cyan-600/80 to-purple-600/80' : 'bg-emerald-600/80'}`}>
                        {live.type === 'pk' ? 'PK' : 'Sala'}
                      </div>
                    )}

                    {/* Creator Name (Base Esquerda) */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <span className="text-white text-xs font-extrabold drop-shadow-md truncate max-w-[120px]">
                        {live.creator}
                      </span>
                    </div>

                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'comunidades' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <Users className="w-16 h-16 text-cyan-500 mx-auto opacity-50 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Comunidades do Bird</h2>
            </motion.div>
          )}

          {activeTab === 'eventos' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <Calendar className="w-16 h-16 text-purple-500 mx-auto opacity-50 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Próximos Eventos</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LiveStreamModal 
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
        stream={selectedStream}
      />
    </BirdLayout>
  );
}