import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { Search as SearchIcon, BrainCircuit, Globe, Sparkles, UserPlus, Image as ImageIcon, Loader2, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import { PostCard } from "@/components/lyv/PostCard";

// Hook para debouncer (evitar chamar a API a cada letra digitada)
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 600);
  
  const [results, setResults] = useState<{users: any[], posts: any[]}>({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tudo' | 'pessoas' | 'posts'>('tudo');

  // ==========================================
  // BUSCA REAL NA API DO DJANGO
  // ==========================================
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ users: [], posts: [] });
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/search/?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(response.data);
      } catch (error) {
        console.error("Falha na busca", error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
    // Atualiza a URL para poder compartilhar a pesquisa
    setSearchParams({ q: debouncedQuery });
  }, [debouncedQuery, setSearchParams]);

  // ==========================================
  // MOTOR ZIOS & ÍRIS (Simulação de Insight)
  // ==========================================
  const generateAiInsight = () => {
    if (!debouncedQuery) return null;
    const q = debouncedQuery.toLowerCase();
    
    if (q.includes('lyv') || q.includes('zios') || q.includes('ia')) {
      return "O Lyvifi é uma rede neural social alimentada por 5 IAs (Pentaia). ZIOS orquestra, TAS recomenda, Íris informa, Heimdall protege e Gaia conecta.";
    }
    if (results.users.length > 0 && results.posts.length === 0) {
      return `Íris encontrou ${results.users.length} pessoa(s) correspondente(s) a "${query}". Parece que você está buscando conexões específicas.`;
    }
    if (results.posts.length > 0) {
      return `ZIOS analisou o Multiverso e encontrou ${results.posts.length} momento(s) sobre "${query}". Os tópicos relacionados estão em alta hoje.`;
    }
    return `ZIOS e Íris vasculharam a rede, mas "${query}" é um tópico novo por aqui. Que tal ser o primeiro a criar um Momento sobre isso?`;
  };

  return (
    <LyvLayout>
      <div className="w-full max-w-[1000px] mx-auto min-h-screen pt-4 md:pt-8 pb-24 px-4 md:px-6 bg-transparent">
        
        {/* BARRA DE PESQUISA MASTER */}
        <div className="sticky top-4 md:top-6 z-50 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-2xl border border-white/50 dark:border-slate-700 shadow-xl rounded-[2rem] p-2 flex items-center">
              <SearchIcon className="w-6 h-6 text-slate-400 ml-4 shrink-0" />
              <input 
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pergunte ao ZIOS ou busque pessoas e posts..."
                className="w-full bg-transparent border-none outline-none px-4 py-3 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
              />
              {isLoading && <Loader2 className="w-5 h-5 text-cyan-500 animate-spin mr-4 shrink-0" />}
            </div>
          </div>
        </div>

        {/* ESTADO VAZIO (Nenhuma busca) */}
        {!debouncedQuery && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <BrainCircuit className="w-20 h-20 text-slate-200 dark:text-slate-800" />
              <Sparkles className="w-8 h-8 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">A Pentaia está pronta.</h2>
            <p className="text-slate-500 max-w-md">Pesquise por amigos, tópicos em alta ou pergunte diretamente ao ZIOS.</p>
          </motion.div>
        )}

        {/* RESULTADOS */}
        {debouncedQuery && (
          <div className="space-y-8">
            
            {/* CAIXA DE INTELIGÊNCIA (ZIOS & ÍRIS) */}
            <AnimatePresence>
              {!isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 rounded-[2rem] p-1 shadow-2xl overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                  <div className="bg-slate-900/50 backdrop-blur-xl rounded-[1.8rem] p-6 relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center"><BrainCircuit className="w-4 h-4 text-white" /></div>
                        <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-slate-900 flex items-center justify-center"><Globe className="w-4 h-4 text-white" /></div>
                      </div>
                      <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase tracking-widest">
                        ZIOS & Íris Insight
                      </span>
                    </div>
                    <p className="text-white md:text-lg font-medium leading-relaxed drop-shadow-sm">
                      {generateAiInsight()}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ABAS DE FILTRO */}
            {!isLoading && (results.users.length > 0 || results.posts.length > 0) && (
              <div className="flex gap-2 p-1.5 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl overflow-x-auto scrollbar-hide">
                {['tudo', 'pessoas', 'posts'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`relative flex-1 capitalize py-2.5 rounded-xl text-sm font-bold transition-all z-10 ${activeTab === tab ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {activeTab === tab && <motion.div layoutId="searchTab" className="absolute inset-0 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-sm -z-10" />}
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* CONTEÚDO DOS RESULTADOS */}
            {!isLoading && (
              <div className="space-y-8">
                
                {/* SEÇÃO: PESSOAS */}
                {(activeTab === 'tudo' || activeTab === 'pessoas') && results.users.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-cyan-500" /> Pessoas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.users.map(user => (
                        <Link to={`/profile/${user.username}`} key={user.id} className="bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-gradient-to-tr from-cyan-500 to-blue-500 text-white font-bold">{user.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                {user.name} {user.isPremium && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                              </p>
                              <p className="text-xs text-slate-500">{user.handle}</p>
                            </div>
                          </div>
                          <Button variant="outline" className="rounded-full h-8 px-4 text-xs font-bold bg-white dark:bg-slate-800">Ver Perfil</Button>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* SEÇÃO: POSTS */}
                {(activeTab === 'tudo' || activeTab === 'posts') && results.posts.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 mt-4">
                      <ImageIcon className="w-5 h-5 text-purple-500" /> Momentos e Posts
                    </h3>
                    <div className="space-y-4">
                      {results.posts.map(post => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* NENHUM RESULTADO */}
                {results.users.length === 0 && results.posts.length === 0 && (
                  <div className="text-center py-10 bg-white/40 dark:bg-black/10 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-medium">O Multiverso não retornou resultados exatos para sua busca.</p>
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </LyvLayout>
  );
}