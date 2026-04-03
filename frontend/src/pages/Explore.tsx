import React, { useState } from "react";
import { motion } from "framer-motion";
import { BirdLayout } from "@/components/bird/BirdLayout";
import { Search, Heart, MessageCircle, Play, Layers, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState("Para Você");

  const categories = [
    "Para Você", "Tecnologia", "Arte", "Jogos", "Música", 
    "Natureza", "Fotografia", "Estilo", "Esportes"
  ];

  const gridItems = [
    { id: 1, type: "image", src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=600&fit=crop", likes: "2k", comments: "45" },
    { id: 2, type: "video", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=1200&fit=crop", likes: "12k", comments: "340", span: "row-span-2" },
    { id: 3, type: "image", src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop", likes: "890", comments: "12" },
    { id: 4, type: "video", src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=1200&fit=crop", likes: "8.5k", comments: "120", span: "row-span-2" },
    { id: 5, type: "image", src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop", likes: "3.4k", comments: "55" },
    { id: 6, type: "image", src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop", likes: "15k", comments: "900" },
    { id: 7, type: "image", src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=600&fit=crop", likes: "400", comments: "10" },
    { id: 8, type: "video", src: "https://images.unsplash.com/photo-1501854140884-074bf86ed91e?w=600&h=1200&fit=crop", likes: "45k", comments: "2k", span: "row-span-2" },
    { id: 9, type: "image", src: "https://images.unsplash.com/photo-1531297461136-82lw9z0u?w=600&h=600&fit=crop", likes: "9.5k", comments: "410" },
    { id: 10, type: "image", src: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&h=600&fit=crop", likes: "300", comments: "2" },
    { id: 11, type: "video", src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=1200&fit=crop", likes: "22k", comments: "500", span: "row-span-2" },
    { id: 12, type: "image", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop", likes: "1.2k", comments: "25" },
    { id: 13, type: "image", src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=600&fit=crop", likes: "2.1k", comments: "88" },
    { id: 14, type: "image", src: "https://images.unsplash.com/photo-1552793494-111afe03d0ca?w=600&h=600&fit=crop", likes: "700", comments: "40" },
    { id: 15, type: "video", src: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=600&h=1200&fit=crop", likes: "3k", comments: "150", span: "row-span-2" },
    { id: 16, type: "image", src: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&h=600&fit=crop", likes: "4k", comments: "120" },
  ];

  return (
    <BirdLayout>
      <div className="w-full max-w-[950px] mx-auto min-h-screen pt-2 md:pt-6 pb-24 px-2 md:px-4 bg-transparent">
        
        {/* CABEÇALHO E PESQUISA FIXA */}
        <div className="sticky top-0 z-40 pt-2 pb-4 bg-transparent">
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

        {/* MOSAICO (GRID MASONRY BIRD) */}
        <div className="mt-2 grid grid-cols-3 gap-1 md:gap-3 auto-rows-[120px] sm:auto-rows-[180px] md:auto-rows-[280px] grid-flow-dense px-1 md:px-0">
          {gridItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className={`${item.span ? 'row-span-2' : 'row-span-1'} col-span-1`}
            >
              <Link 
                to={`/post/${item.id}`}
                className="relative group block w-full h-full cursor-pointer overflow-hidden rounded-lg md:rounded-2xl bg-slate-200 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-xl transition-all"
              >
                {/* Imagem de Fundo com tratamento de Erro embutido */}
                <img 
                  src={item.src} 
                  alt="Explore" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600/1E293B/cyan?text=Bird' }}
                />
                
                {/* Ícones de Indicador (Canto Superior Direito) */}
                <div className="absolute top-2 right-2 md:top-3 md:right-3 drop-shadow-md z-10">
                  {item.type === 'video' ? (
                    <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white opacity-90" />
                  ) : (
                    Math.random() > 0.7 && <Layers className="w-5 h-5 md:w-6 md:h-6 text-white fill-white opacity-90" />
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
          ))}
        </div>

      </div>
    </BirdLayout>
  );
}