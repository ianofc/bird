import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { PostCard } from "@/components/lyv/PostCard";
import { StoriesBar } from "@/components/lyv/StoriesBar";
import { EmptyFeed } from "@/components/lyv/EmptyFeed";
import { Loader2, TrendingUp, AlertCircle, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

export default function Feed() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Controle para Scroll Infinito
  const hasMore = useRef(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // ==========================================
  // BUSCA INICIAL DO BACKEND DJANGO
  // ==========================================
  const loadInitialFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Bate na API de Feed pedindo a Página 1
      const response = await api.get('/feed/?page=1');
      
      // O Django devolve { results: [...], has_next: true/false }
      const data = response.data.results || response.data;
      setPosts(data);
      setPage(1);
      hasMore.current = response.data.has_next ?? (data.length >= 15); 
    } catch (err) {
      console.error("Erro ao buscar o feed:", err);
      setError("Não foi possível conectar ao servidor. O Django está rodando?");
      toast.error("Falha ao carregar a rede.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadInitialFeed(); 
  }, [loadInitialFeed]);

  // ==========================================
  // SCROLL INFINITO (INTERSECTION OBSERVER)
  // ==========================================
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore.current) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await api.get(`/feed/?page=${nextPage}`);
      const moreData = response.data.results || response.data;
      
      if (!moreData || moreData.length === 0) {
        hasMore.current = false;
      } else {
        setPosts(prev => [...prev, ...moreData]);
        setPage(nextPage);
        hasMore.current = response.data.has_next ?? false;
      }
    } catch (err) {
      toast.error("Erro ao buscar postagens antigas.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore]);

  // Observador visual: Dispara quando o elemento "observerTarget" entra na tela
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore.current && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [loadMorePosts, isLoadingMore, isLoading]);

  // ==========================================
  // BUSCA INTELIGENTE (ZIOS)
  // ==========================================
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <LyvLayout>
      <div className="max-w-[650px] mx-auto min-h-screen bg-transparent pb-24 relative">
        
        {/* === HEADER FLUTUANTE DE PESQUISA === */}
        <div className="sticky top-0 z-50 pt-4 md:pt-6 pb-4 px-4 md:px-0 bg-[#FAF9FB]/90 dark:bg-[#0B1120]/90 backdrop-blur-xl">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[2rem] blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 shadow-sm group-focus-within:shadow-md rounded-[2rem] p-1.5 flex items-center transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pergunte ao ZIOS ou busque no Lyv..."
                className="w-full bg-transparent border-none outline-none px-3 py-2.5 text-[15px] text-slate-900 dark:text-white placeholder:text-slate-500 font-medium"
              />
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 flex items-center justify-center mr-1 shrink-0">
                <Sparkles className="w-4 h-4 text-cyan-500" />
              </div>
            </div>
          </form>
        </div>

        <div className="px-2 md:px-0">
          {/* === TOPO DO FEED: Stories === */}
          <StoriesBar />
          
          {/* Aviso Arquitetural Lyvifi */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md rounded-2xl flex items-start gap-3 shadow-sm mx-2 md:mx-0"
          >
            <div className="p-2 bg-cyan-500/20 rounded-full shrink-0">
              <TrendingUp className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">A arquitetura mudou</h4>
              <p className="text-[13px] text-slate-700 dark:text-slate-300 mt-1 leading-snug">
                Para garantir uma navegação imersiva e sem fricção, a criação de Momentos acontece exclusivamente no seu <strong>Perfil</strong>.
              </p>
            </div>
          </motion.div>

          {/* === LISTAGEM DE POSTS (REAL E PAGINADA) === */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Esqueleto de Carregamento Inicial
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 space-y-4"
                >
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 animate-pulse">Sincronizando Pentaia Network...</p>
                </motion.div>
              ) : error ? (
                // Erro de Conexão com Django
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center text-center gap-3 mx-2 md:mx-0">
                   <AlertCircle className="w-8 h-8 text-rose-500" />
                   <p className="text-rose-700 dark:text-rose-400 font-bold">{error}</p>
                   <button onClick={loadInitialFeed} className="px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-xl mt-2 hover:bg-rose-600 transition-colors">Tentar Novamente</button>
                </motion.div>
              ) : posts.length > 0 ? (
                // Posts Reais
                posts.map((post, idx) => (
                  <motion.div 
                    key={post.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx < 5 ? idx * 0.05 : 0 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))
              ) : (
                // Feed Vazio
                <EmptyFeed key="empty" />
              )}
            </AnimatePresence>

            {/* === TRIGGER DO SCROLL INFINITO === */}
            {posts.length > 0 && !error && (
              <div ref={observerTarget} className="py-8 flex justify-center">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Buscando momentos antigos...</span>
                  </div>
                ) : !hasMore.current ? (
                  <div className="text-center space-y-2 opacity-50">
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 mx-auto rounded-full" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Fim do Feed</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </LyvLayout>
  );
}