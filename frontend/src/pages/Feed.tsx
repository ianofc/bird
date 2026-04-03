import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BirdLayout } from "@/components/bird/BirdLayout";
import { PostCard, Post } from "@/components/bird/PostCard";
import { StoriesBar } from "@/components/bird/StoriesBar";
import { EmptyFeed } from "@/components/bird/EmptyFeed";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { feedService } from "@/services/api";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Controle para Scroll Infinito
  const hasMore = useRef(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // --- BUSCA INICIAL DO BACKEND DJANGO ---
  const loadInitialFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await feedService.getFeed();
      setPosts(data);
      setPage(1);
      // Se a API retornar menos que 15 posts (tamanho da página), acabaram os posts.
      hasMore.current = data.length >= 15; 
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

  // --- SCROLL INFINITO (INTERSECTION OBSERVER) ---
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore.current) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      // Na API real, você passaria a página: await feedService.getFeed(nextPage)
      // Por enquanto, como a API do Django envia tudo, vamos simular o fim da lista.
      const moreData = []; // Substitua por await feedService.getFeed(nextPage) quando paginado
      
      if (moreData.length === 0) {
        hasMore.current = false;
      } else {
        setPosts(prev => [...prev, ...moreData]);
        setPage(nextPage);
      }
    } catch (err) {
      toast.error("Erro ao buscar postagens antigas.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore]);

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

  return (
    <BirdLayout>
      <div className="max-w-[650px] mx-auto pt-2 min-h-screen bg-transparent px-2 md:px-0">
        
        {/* === TOPO DO FEED: Stories e Contexto === */}
        <StoriesBar />
        
        {/* Aviso Arquitetural Bird OS */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md rounded-2xl flex items-start gap-3 shadow-sm"
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

        {/* === LISTAGEM DE POSTS (REAL) === */}
        <div className="space-y-6 pb-24">
          <AnimatePresence mode="wait">
            {isLoading ? (
              // Esqueleto de Carregamento
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 space-y-4"
              >
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-semibold text-slate-500 animate-pulse">Sincronizando Bird Network...</p>
              </motion.div>
            ) : error ? (
              // Erro de Conexão com Django
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center text-center gap-3">
                 <AlertCircle className="w-8 h-8 text-rose-500" />
                 <p className="text-rose-700 dark:text-rose-400 font-bold">{error}</p>
                 <button onClick={loadInitialFeed} className="px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-xl mt-2 hover:bg-rose-600 transition-colors">Tentar Novamente</button>
              </motion.div>
            ) : posts.length > 0 ? (
              // Posts Reais
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              // Feed Vazio
              <EmptyFeed key="empty" />
            )}
          </AnimatePresence>

          {/* Trigger do Scroll Infinito */}
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
    </BirdLayout>
  );
}