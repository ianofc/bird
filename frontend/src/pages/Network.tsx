import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirdLayout } from "@/components/bird/BirdLayout";
import { useBird } from "@/contexts/BirdContext";
import { Users, Store, Search, MapPin, Tag, UserPlus, UserCheck, Megaphone, Sparkles as SparklesIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Network() {
  const [activeMainTab, setActiveMainTab] = useState<'comunidades' | 'marketplace' | 'pessoas'>('comunidades');
  const [activePeopleTab, setActivePeopleTab] = useState<'suggestions' | 'following' | 'followers'>('suggestions');

  // --- LÓGICA DE DADOS DO BIRD (CONTEXTO REAL) ---
  const bird = useBird() as {
    users?: Array<{
      id: string;
      color?: string;
      initials?: string;
      name?: string;
      handle?: string;
      bio?: string;
    }>;
    currentUser?: { id?: string } | null;
    followingIds?: string[];
    followUser?: (id: string) => void;
    unfollowUser?: (id: string) => void;
  };

  const users = bird.users ?? [];
  const currentUserId = bird.currentUser?.id;
  const followingIds = bird.followingIds ?? [];
  const followUser = bird.followUser ?? (() => undefined);
  const unfollowUser = bird.unfollowUser ?? (() => undefined);

  const otherUsers = users.filter(u => u.id !== currentUserId);
  const followedUsers = otherUsers.filter(u => followingIds.includes(u.id));
  const suggestedUsers = otherUsers.filter(u => !followingIds.includes(u.id));

  // --- MOCKS DE COMUNIDADES E MARKETPLACE ---
  const comunidades = [
    { id: 1, name: "CEEPS - 3º Ano Info", members: "45", type: "Acadêmico", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&fit=crop" },
    { id: 2, name: "Clube de Python", members: "1.2k", type: "Desenvolvimento", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&fit=crop" },
    { id: 3, name: "Bazar da Cidade", members: "8.5k", type: "Vendas Locais", img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&fit=crop" },
  ];

  const marketplace = [
    { id: 1, title: "Teclado Mecânico Redragon", price: "R$ 150", seller: "Marcos", location: "Centro, Seabra", condition: "Usado - Como Novo", img: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&fit=crop" },
    { id: 2, title: "Livro: Cálculo Vol 1 (Stewart)", price: "R$ 80", seller: "Ana Silva", location: "CEEPS", condition: "Usado", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&fit=crop" },
    { id: 3, title: "Monitor Dell 24' IPS", price: "R$ 600", seller: "Carlos", location: "Palmeiras", condition: "Novo", img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&fit=crop" },
    { id: 4, title: "Bicicleta Aro 29", price: "R$ 850", seller: "João", location: "Seabra", condition: "Usada", img: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&fit=crop" },
  ];

  return (
    <BirdLayout>
      <div className="w-full max-w-[1200px] mx-auto min-h-screen pt-4 md:pt-8 pb-24 px-4 md:px-8 bg-transparent">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500 pb-2 drop-shadow-sm">
              Network
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Sua praça pública. Pessoas, Turmas e Marketplace.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute w-4 h-4 text-slate-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input 
              type="text" 
              placeholder={activeMainTab === 'marketplace' ? "Buscar produtos..." : "Buscar na rede..."}
              className="w-full py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white transition-all border rounded-xl bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Abas Principais do Hub */}
        <div className="flex gap-2 p-1.5 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl mb-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'comunidades', label: 'Comunidades', icon: Users },
            { id: 'marketplace', label: 'Marketplace', icon: Store },
            { id: 'pessoas', label: 'Conexões', icon: UserPlus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
              className={`relative flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
                activeMainTab === tab.id 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {activeMainTab === tab.id && (
                <motion.div 
                  layoutId="networkMainTab" 
                  className="absolute inset-0 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/50 dark:border-white/5 -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* === ABA: COMUNIDADES === */}
          {activeMainTab === 'comunidades' && (
            <motion.div key="comunidades" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Meus Grupos & Turmas</h2>
                <Button variant="outline" className="rounded-full font-bold text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100">
                  + Criar Comunidade
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comunidades.map((grupo) => (
                  <div key={grupo.id} className="group bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer">
                    <div className="h-32 w-full overflow-hidden relative">
                      <img src={grupo.img} alt={grupo.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute bottom-3 left-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm border border-white/20">
                        {grupo.type}
                      </div>
                    </div>
                    <div className="p-5 relative">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{grupo.name}</h3>
                      <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> {grupo.members} membros
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* === ABA: MARKETPLACE === */}
          {activeMainTab === 'marketplace' && (
            <motion.div key="marketplace" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Store className="w-6 h-6 text-emerald-500" /> Vitrine Local
                </h2>
                <Button className="rounded-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-md">
                  Vender Item
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {marketplace.map((item) => (
                  <div key={item.id} className="group bg-white/70 dark:bg-[#1E293B]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col">
                    <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 mb-2 group-hover:text-emerald-500 transition-colors">
                        {item.title}
                      </h3>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mb-3">
                        {item.price}
                      </div>
                      
                      <div className="mt-auto space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" /> {item.condition}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {item.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* === ABA: CONEXÕES (PESSOAS REAIS) === */}
          {activeMainTab === 'pessoas' && (
            <motion.div key="pessoas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Menu de Pessoas Lateral */}
                <div className="bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] p-4 md:w-64 shrink-0 shadow-sm h-fit">
                  {[
                    { id: "suggestions", label: "Sugestões", icon: SparklesIcon },
                    { id: "following", label: "Seguindo", icon: UserCheck },
                    { id: "followers", label: "Seguidores", icon: Megaphone }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePeopleTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                        activePeopleTab === tab.id
                          ? "bg-blue-500 text-white font-bold shadow-md"
                          : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5 font-medium"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Lista de Usuários Renderizados */}
                <div className="flex-1 space-y-3">
                  
                  {activePeopleTab === "suggestions" && (
                    <>
                      {suggestedUsers.length === 0 ? (
                        <div className="bg-white/40 dark:bg-black/10 rounded-[2rem] py-16 text-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                          <p className="text-slate-500 font-medium">Nenhuma sugestão no momento.</p>
                        </div>
                      ) : (
                        suggestedUsers.map(user => (
                          <div key={user.id} className="bg-white/70 dark:bg-[#1E293B]/60 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-white/50 dark:border-white/5 transition-all hover:shadow-md">
                            <div className={`w-12 h-12 rounded-full ${user.color || 'bg-blue-500'} flex items-center justify-center text-white text-sm font-bold shadow-inner`}>
                              {user.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">{user.handle}</p>
                              {user.bio && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{user.bio}</p>}
                            </div>
                            <button 
                              onClick={() => followUser(user.id)} 
                              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
                            >
                              Seguir
                            </button>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {activePeopleTab === "following" && (
                    <>
                      {followedUsers.length === 0 ? (
                        <div className="bg-white/40 dark:bg-black/10 rounded-[2rem] py-16 text-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                          <p className="text-slate-500 font-medium">Você ainda não segue ninguém.</p>
                        </div>
                      ) : (
                        followedUsers.map(user => (
                          <div key={user.id} className="bg-white/70 dark:bg-[#1E293B]/60 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-white/50 dark:border-white/5 transition-all hover:shadow-md">
                            <div className={`w-12 h-12 rounded-full ${user.color || 'bg-blue-500'} flex items-center justify-center text-white text-sm font-bold shadow-inner`}>
                              {user.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                              <p className="text-xs font-medium text-slate-500 mt-1">{user.handle}</p>
                            </div>
                            <button 
                              onClick={() => unfollowUser(user.id)} 
                              className="bg-white/50 dark:bg-white/10 hover:bg-rose-500 hover:text-white hover:border-rose-500 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shrink-0"
                            >
                              Seguindo
                            </button>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {activePeopleTab === "followers" && (
                    <div className="bg-white/40 dark:bg-black/10 rounded-[2rem] py-16 text-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
                        <Users className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">Nenhum seguidor ainda.</p>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </BirdLayout>
  );
}