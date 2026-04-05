import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { Search, Heart, MessageCircle, Play, Layers, Compass, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import { toast } from "sonner";

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState("Para Você");
  const [exploreItems, setExploreItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    "Para Você", "Tecnologia", "Arte", "Jogos", "Música", 
    "Natureza", "Fotografia", "Estilo", "Esportes"
  ];

  useEffect(() => {
    const fetchExplore = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/explore/?category=${activeCategory}`);
        
        // Filtramos apenas posts que tenham algum tipo de mídia (imagem ou vídeo)
        // porque a página Explore é essencialmente visual.
        const mediaPosts = response.data.filter((p: any) => p.media && p.media.length > 0);
        setExploreItems(mediaPosts);
      } catch (error) {
        toast.error("O TAS falhou em carregar a página Explorar.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExplore();
  }, [activeCategory]);

  return (
    <LyvLayout>
      <div className="w-full max-w-[950px] mx-auto min-h-screen pt-2 md:pt-6 pb-24 px-2 md:px-4 bg-transparent">
        
        {/* CABEÇALHO E PESQUISA FIXA */}
        <div className="sticky top-0 z-40 pt-2 pb-4 bg-[#FAF9FB]/90 dark:bg-slate-900/90 backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            
            {/* Header / Título (Apenas Desktop) */}
            <div className="hidden md:flex items-center gap-3 px-2">
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-600 dark:text-cyan-400">
                <Compass className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 drop-shadow-sm">
                Explorar
              </h1>
            </div>

            {/* Input de Pesquisa Glassmorphism */}
            <div className="relative group px-1 md:px-0">
              <div className="absolute inset-y-0 left-0 pl-5 md:pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Pesquisar momentos, tags ou pessoas..." 
                className="w-full pl-12 pr-4 py-3.5 bg-white/70 dark:bg-[#1E293B]/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-full text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all"
              />
            </div>

            {/* Carrossel de Filtros (Pílulas) */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1 md:px-0 pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap z-10 ${
                    activeCategory === category 
                      ? 'text-white shadow-md' 
                      : 'text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 border border-slate-200/50 dark:border-white/5'
                  }`}
                >
                  {activeCategory === category && (
                    <motion.div 
                      layoutId="exploreCategory" 
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full -z-10"
                    />
                  )}
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MOSAICO (GRID MASONRY LYV CONECTADO AO BANCO) */}
        <AnimatePresence mode="wait">
          {isLoading ? (
             <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
               <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
             </motion.div>
          ) : exploreItems.length === 0 ? (
             <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
                <Compass className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">O Multiverso ainda está vazio por aqui.</h2>
                <p className="text-slate-500 mt-2">Publique fotos ou vídeos no seu Perfil para aparecerem no Explorar.</p>
             </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 grid grid-cols-3 gap-1 md:gap-3 auto-rows-[120px] sm:auto-rows-[180px] md:auto-rows-[280px] grid-flow-dense px-1 md:px-0">
              {exploreItems.map((item, idx) => {
                const mediaUrl = item.media[0].url;
                const isVideo = item.post_type === 'video';
                
                // Mágica do Layout: Vídeos e cada 4º item ganham altura dupla (row-span-2)
                const isTall = isVideo || idx % 4 === 0;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className={`${isTall ? 'row-span-2' : 'row-span-1'} col-span-1`}
                  >
                    <Link 
                      to={`/post/${item.id}`} // Se no futuro fizer a página de ver o post em detalhe
                      className="relative group block w-full h-full cursor-pointer overflow-hidden rounded-lg md:rounded-2xl bg-slate-200 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-xl transition-all"
                    >
                      {/* Imagem/Vídeo Real do Banco */}
                      {isVideo ? (
                        <video src={mediaUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" muted playsInline />
                      ) : (
                        <img src={mediaUrl} alt={`Post by ${item.author.name}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      )}
                      
                      {/* Ícones de Indicador (Vídeo ou Galeria) */}
                      <div className="absolute top-2 right-2 md:top-3 md:right-3 drop-shadow-md z-10">
                        {isVideo ? (
                          <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white opacity-90" />
                        ) : (
                          item.media.length > 1 && <Layers className="w-5 h-5 md:w-6 md:h-6 text-white fill-white opacity-90" />
                        )}
                      </div>

                      {/* Overlay de Hover (Corações e Comentários) */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-white font-bold backdrop-blur-[2px]">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <Heart className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                          <span className="text-sm md:text-base">{item.likes}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <MessageCircle className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                          <span className="text-sm md:text-base">{item.comments}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </LyvLayout>
  );
}