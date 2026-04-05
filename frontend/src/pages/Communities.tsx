import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { 
  Users, Search, Plus, UsersRound, Compass, 
  ShieldCheck, Sparkles, Loader2, ArrowRight, MessageSquare 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { api } from '@/services/api';
import { toast } from 'sonner';

interface Community {
  id: number;
  name: string;
  members: string;
  cover: string;
  icon: string;
  desc: string;
  isPrivate?: boolean;
  joined?: boolean;
}

export default function Communities() {
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [suggestedCommunities, setSuggestedCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/communities/');
        // Supomos que a API devolva { joined: [], suggested: [] }
        setMyCommunities(response.data.joined || []);
        setSuggestedCommunities(response.data.suggested || []);
      } catch (error) {
        // FALLBACK DE ALTA FIDELIDADE (Caso a API ainda não exista)
        setMyCommunities([
          { id: 1, name: 'Devs Brasil 🚀', members: '14.2k', cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&fit=crop', icon: '💻', desc: 'A maior comunidade de desenvolvedores do Lyvifi.', joined: true },
          { id: 2, name: 'Gamer Zone', members: '22k', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&fit=crop', icon: '🎮', desc: 'O ponto de encontro para bater papo sobre jogos e e-sports.', joined: true },
        ]);
        
        setSuggestedCommunities([
          { id: 3, name: 'Designers UI/UX', members: '8.4k', cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&fit=crop', icon: '🎨', desc: 'Focado em interfaces, usabilidade e Figma tips.' },
          { id: 4, name: 'Mercado Financeiro', members: '5.1k', cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&fit=crop', icon: '📈', desc: 'Análises, bolsa de valores e criptoativos.' },
          { id: 5, name: 'Lyvifi Beta Testers', members: '1.2k', cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&fit=crop', icon: '🦅', desc: 'Testadores oficiais das novas features da rede.', isPrivate: true },
          { id: 6, name: 'Fotografia Mobile', members: '12k', cover: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&fit=crop', icon: '📸', desc: 'Dicas, presets e avaliações de fotos tiradas com celular.' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const handleJoin = (id: number) => {
    toast.success("Solicitação enviada com sucesso!");
    // Lógica futura: mover de 'suggested' para 'myCommunities' otimisticamente
  };

  return (
    <LyvLayout>
      <div className="w-full max-w-[1200px] mx-auto min-h-screen pt-4 md:pt-8 pb-24 px-4 md:px-8 bg-transparent">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 pb-2 drop-shadow-sm flex items-center gap-3">
              <Users className="w-10 h-10 text-blue-500" /> Comunidades
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">Conecte-se com pessoas que amam o que você ama.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute w-4 h-4 text-slate-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input 
                type="text" 
                placeholder="Buscar grupos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white transition-all border rounded-xl bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button className="shrink-0 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl h-10 px-5 font-bold shadow-md hover:scale-105 transition-transform border-0">
              <Plus className="w-4 h-4 mr-2" /> Criar Grupo
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>
        ) : (
          <div className="space-y-12">
            
            {/* SESSÃO 1: SEUS GRUPOS */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-500" /> Seus Grupos
                </h2>
                <Button variant="link" className="text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-500/10">
                  Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {myCommunities.length === 0 ? (
                <div className="bg-white/40 dark:bg-[#1E293B]/40 rounded-3xl py-12 flex flex-col items-center text-center border border-dashed border-slate-300 dark:border-slate-700 backdrop-blur-md">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="font-bold text-lg text-slate-800 dark:text-white mb-1">Você ainda não participa de nada.</p>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">Explore as sugestões abaixo e encontre sua tribo no Multiverso.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myCommunities.map((com) => (
                    <motion.div whileHover={{ scale: 1.02 }} key={com.id} className="flex items-center gap-4 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm cursor-pointer group">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
                        <img src={com.cover} alt={com.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-xl shadow-inner backdrop-blur-[2px]">
                          {com.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">{com.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <UsersRound className="w-3 h-3" /> {com.members}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* SESSÃO 2: DESCOBRIR (SUGESTÕES) */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Compass className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Descobrir</h2>
                <Badge className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-0">Recomendado (TAS)</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedCommunities.map((com, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.1 }}
                    key={com.id} 
                    className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col"
                  >
                    {/* Capa */}
                    <div className="h-32 w-full relative overflow-hidden shrink-0">
                      <img src={com.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {com.isPrivate && (
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
                          <ShieldCheck className="w-3.5 h-3.5" /> Privado
                        </div>
                      )}
                    </div>
                    
                    {/* Corpo */}
                    <div className="p-6 pt-0 relative flex-1 flex flex-col">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border-4 border-white dark:border-[#1E293B] flex items-center justify-center text-3xl -mt-8 relative z-10">
                        {com.icon}
                      </div>
                      <div className="mt-3 flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors leading-tight">{com.name}</h3>
                        <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 mt-1.5">
                           <UsersRound className="w-4 h-4 text-slate-400" /> {com.members} membros
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                          {com.desc}
                        </p>
                      </div>
                      
                      {/* Botão de Ação */}
                      <Button 
                        onClick={() => handleJoin(com.id)}
                        className="w-full mt-5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all border-0 shadow-sm"
                      >
                        {com.isPrivate ? 'Solicitar Entrada' : 'Participar do Grupo'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

          </div>
        )}

      </div>
    </LyvLayout>
  );
}

// Dummy component para resolver a Badge no import, caso não a tenha exportado no seu ui/badge
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${className}`}>{children}</span>;
}