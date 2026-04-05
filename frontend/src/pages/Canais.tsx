import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { 
  Users, Calendar, Radio, Search, Loader2, Play, 
  Plus, MapPin, Clock, UsersRound, ChevronRight, Sparkles 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { LiveStreamModal } from "@/components/lyv/LiveStreamModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from '@/services/api';
import { toast } from 'sonner';

// --- TIPAGENS ---
export type LiveType = 'normal' | 'pk' | 'sala';

export interface StreamParticipant {
  id: string;
  name: string;
  avatar: string;
  videoUrl: string;
  pkPoints?: number;
}

export interface Live {
  id: number;
  type: LiveType;
  creator: string;
  viewers: string;
  img: string; 
  participants: StreamParticipant[];
}

export default function Canais() {
  const [activeTab, setActiveTab] = useState<'lives' | 'comunidades' | 'eventos'>('lives');
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Live | null>(null);
  
  // Estados de Dados
  const [lives, setLives] = useState<Live[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca Geral
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Busca as Lives Reais
        const streamsRes = await api.get('/streams/');
        setLives(streamsRes.data);
      } catch (error) {
        toast.error("Não foi possível conectar ao servidor de transmissão.");
      }

      // Tenta buscar Comunidades e Eventos (Usa fallback rico se a API ainda não existir)
      try {
        const comRes = await api.get('/communities/');
        setCommunities(comRes.data);
      } catch (e) {
        setCommunities([
          { id: 1, name: 'Devs Brasil 🚀', members: '14.2k', cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&fit=crop', icon: '💻', desc: 'A maior comunidade de desenvolvedores do Lyvifi.' },
          { id: 2, name: 'Designers UI/UX', members: '8.4k', cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&fit=crop', icon: '🎨', desc: 'Focado em interfaces, usabilidade e figma tips.' },
          { id: 3, name: 'Gamer Zone', members: '22k', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&fit=crop', icon: '🎮', desc: 'O ponto de encontro para bater papo sobre jogos e e-sports.' },
          { id: 4, name: 'Mercado Financeiro', members: '5.1k', cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&fit=crop', icon: '📈', desc: 'Análises, bolsa de valores e criptoativos.' },
        ]);
      }

      try {
        const evRes = await api.get('/events/');
        setEvents(evRes.data);
      } catch (e) {
        setEvents([
          { id: 1, title: 'Hackathon Multiverso IO', date: '24', month: 'OUT', time: '18:00', location: 'Online (Canais Lyv)', attendees: 1240, cover: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&fit=crop' },
          { id: 2, title: 'Encontro de Tecnologia CEEPS', date: '15', month: 'NOV', time: '09:00', location: 'Bahia, Brasil', attendees: 450, cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop' },
        ]);
      }
      
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  const handleOpenStream = (stream: Live) => {
    setSelectedStream(stream);
    setIsStreamModalOpen(true);
  };

  return (
    <LyvLayout>
      <div className="w-full max-w-[1200px] mx-auto min-h-screen pt-4 md:pt-8 pb-20 px-4 md:px-8 bg-transparent">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 pb-2 drop-shadow-sm">
              Canais
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">Conecte-se. Assista. Participe.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute w-4 h-4 text-slate-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input 
                type="text" placeholder="Buscar em Canais..." 
                className="w-full py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white transition-all border rounded-xl bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <Button className="shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl h-10 px-4 font-bold shadow-md hover:scale-105 transition-transform border-0">
              <Plus className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Criar</span>
            </Button>
          </div>
        </div>

        {/* BARRINHA DE ABAS */}
        <div className="flex gap-2 p-1.5 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl mb-8 overflow-x-auto scrollbar-hide">
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

        {/* CONTEÚDO DAS ABAS */}
        <AnimatePresence mode="wait">
          
          {/* ============================================== */}
          {/* ABA: LIVES (A Twitch do Lyv)                  */}
          {/* ============================================== */}
          {activeTab === 'lives' && (
            <motion.div key="lives" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {isLoading ? (
                 <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
              ) : lives.length === 0 ? (
                 <div className="text-center py-20 bg-white/40 dark:bg-[#1E293B]/40 rounded-[2rem] border border-white/50 dark:border-white/10">
                    <Radio className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Transmissões Offline</h3>
                    <p className="text-slate-500 mt-2">Ninguém está transmitindo no momento. Que tal abrir uma live agora?</p>
                 </div>
              ) : (
                <div className="space-y-6">
                  {/* LIVE DESTAQUE (Twitch Style) */}
                  {lives.length > 0 && (
                    <div 
                      onClick={() => handleOpenStream(lives[0])}
                      className="group cursor-pointer relative w-full h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-xl border border-white/10 dark:border-white/5"
                    >
                      <img src={lives[0].img} alt="Destaque" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                          <Play className="w-8 h-8 text-white ml-1 fill-white" />
                        </div>
                      </div>
                      
                      <div className="absolute top-4 left-4 flex gap-2">
                        <div className="bg-rose-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse shadow-lg">
                          <Radio className="w-3.5 h-3.5" /> AO VIVO
                        </div>
                        <div className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10">
                          {lives[0].viewers} assistindo
                        </div>
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6">
                        <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg mb-2">{lives[0].creator}</h2>
                        <p className="text-white/80 font-medium line-clamp-1">Transmissão em alta agora no Lyvifi.</p>
                      </div>
                    </div>
                  )}

                  {/* GRID DE LIVES */}
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 pt-4">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Explorar Transmissões
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {lives.slice(1).map((live) => (
                      <motion.div 
                        whileTap={{ scale: 0.95 }}
                        key={live.id} 
                        onClick={() => handleOpenStream(live)}
                        className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg relative aspect-[3/4] bg-slate-900 border border-white/10 dark:border-white/5"
                      >
                        <img src={live.img} alt={live.creator} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
                        
                        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-white/10">
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                          {live.viewers}
                        </div>

                        {live.type !== 'normal' && (
                          <div className={`absolute top-2 left-2 text-white text-[9px] font-black uppercase px-2 py-1 rounded backdrop-blur-md border border-white/20 ${live.type === 'pk' ? 'bg-gradient-to-r from-cyan-600/80 to-purple-600/80' : 'bg-emerald-600/80'}`}>
                            {live.type === 'pk' ? 'PK' : 'Sala'}
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full border border-white/50 overflow-hidden shrink-0">
                             <img src={live.participants[0]?.avatar || 'https://github.com/shadcn.png'} className="w-full h-full object-cover" alt="host" />
                          </div>
                          <span className="text-white text-sm font-bold drop-shadow-md truncate">
                            {live.creator}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================== */}
          {/* ABA: COMUNIDADES (O Facebook Groups Moderno)   */}
          {/* ============================================== */}
          {activeTab === 'comunidades' && (
            <motion.div key="comu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((com) => (
                  <div key={com.id} className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                    <div className="h-32 w-full relative overflow-hidden">
                      <img src={com.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="p-6 pt-0 relative">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border-4 border-white dark:border-[#1E293B] flex items-center justify-center text-3xl -mt-8 relative z-10">
                        {com.icon}
                      </div>
                      <div className="mt-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">{com.name}</h3>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                           <UsersRound className="w-4 h-4" /> {com.members} membros
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2">
                          {com.desc}
                        </p>
                      </div>
                      <Button className="w-full mt-6 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-cyan-50 dark:hover:bg-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors border-0">
                        Participar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ============================================== */}
          {/* ABA: EVENTOS (Meetups, Congressos, Festas)     */}
          {/* ============================================== */}
          {activeTab === 'eventos' && (
            <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {events.map((evento) => (
                <div key={evento.id} className="flex flex-col md:flex-row bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden hover:shadow-lg transition-all group">
                  <div className="w-full md:w-[300px] h-48 md:h-auto overflow-hidden relative">
                     <img src={evento.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-2">
                             <Clock className="w-4 h-4" /> Próximo Evento
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors mb-3">
                            {evento.title}
                          </h3>
                        </div>
                        {/* Box de Data Estilo Apple Calendar */}
                        <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                           <span className="text-xs font-black text-rose-500 uppercase">{evento.month}</span>
                           <span className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{evento.date}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-400 mt-2">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> {evento.time}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {evento.location}</div>
                        <div className="flex items-center gap-2"><UsersRound className="w-4 h-4 text-slate-400" /> {evento.attendees} confirmados</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                       <Button variant="ghost" className="font-bold text-slate-500">Detalhes</Button>
                       <Button className="rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md border-0">Confirmar Presença</Button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <LiveStreamModal 
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
        stream={selectedStream}
      />
    </LyvLayout>
  );
}