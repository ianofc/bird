import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { Newspaper, TrendingUp, Sparkles, Globe, ChevronRight, ExternalLink, Loader2, Clock, BookmarkPlus } from 'lucide-react';
import { mercurioService, NewsItem } from '@/services/mercurio';
import { toast } from 'sonner';

export default function Mercurio() {
  const [activeCategory, setActiveCategory] = useState('Últimas');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['Últimas', 'Tecnologia', 'Economia', 'Mundo', 'Inovação'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [newsData, trendsData] = await Promise.all([
          mercurioService.getNews(activeCategory.toLowerCase()),
          mercurioService.getTrending()
        ]);
        setNews(newsData);
        setTrends(trendsData.slice(0, 5)); // Pegamos o Top 5 do TAS
      } catch (error) {
        toast.error("A Íris teve um problema ao buscar as notícias.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeCategory]);

  // Função para formatar tempo (ex: "há 2 horas")
  const timeAgo = (dateString: string) => {
    const hours = Math.abs(new Date().getTime() - new Date(dateString).getTime()) / 3600000;
    if (hours < 1) return 'Agora mesmo';
    if (hours < 24) return `Há ${Math.floor(hours)}h`;
    return `Há ${Math.floor(hours / 24)}d`;
  };

  return (
    <LyvLayout>
      <div className="w-full max-w-[1200px] mx-auto min-h-screen pt-4 md:pt-8 pb-24 px-4 md:px-6">
        
        {/* HEADER MERCÚRIO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 flex items-center gap-3 drop-shadow-sm">
              <Newspaper className="w-10 h-10 text-amber-500" /> Mercúrio
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
              Curadoria global em tempo real impulsionada pela <Sparkles className="w-4 h-4 text-purple-500" /> <span className="font-bold text-purple-600 dark:text-purple-400">Íris AI</span>
            </p>
          </div>
          
          <div className="flex bg-white dark:bg-[#1E293B] rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-800 w-full md:w-auto overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat 
                  ? 'bg-amber-500 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          
          {/* COLUNA PRINCIPAL: NOTÍCIAS DA ÍRIS */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <Globe className="w-12 h-12 text-amber-500 animate-pulse" />
                    <Sparkles className="w-5 h-5 text-purple-500 absolute -top-1 -right-1 animate-spin" />
                  </div>
                  <p className="mt-4 text-slate-500 font-medium">Íris está mapeando o mundo...</p>
                </motion.div>
              ) : (
                <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Destaque Principal (Ocupa 2 colunas se houver espaço) */}
                  {news.length > 0 && (
                    <div className="md:col-span-2 group relative rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0F172A] cursor-pointer">
                      <div className="h-[300px] md:h-[400px] w-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
                        <img src={news[0].imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Destaque" />
                        <div className="absolute top-6 left-6 z-20 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                          Destaque
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20">
                        <div className="flex items-center gap-3 mb-3 text-white/80 text-sm font-medium">
                          <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {news[0].source}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {timeAgo(news[0].publishedAt)}</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3 drop-shadow-lg group-hover:text-amber-400 transition-colors">
                          {news[0].title}
                        </h2>
                        <p className="text-slate-200 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-4 max-w-3xl">
                          {news[0].summary}
                        </p>
                        
                        {/* INSIGHT DA ÍRIS */}
                        {news[0].aiInsight && (
                          <div className="bg-purple-900/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 flex items-start gap-3 w-fit">
                            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-purple-100 font-medium">{news[0].aiInsight}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Grid Secundário (Bento Grid) */}
                  {news.slice(1).map((item, idx) => (
                    <div key={item.id} className="bg-white dark:bg-[#1E293B] rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group flex flex-col cursor-pointer">
                      <div className="h-48 overflow-hidden relative">
                         <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="News" />
                         <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-white">
                           {item.category}
                         </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                           <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {item.source}</span>
                           <span>{timeAgo(item.publishedAt)}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-amber-500 transition-colors line-clamp-3">
                          {item.title}
                        </h3>
                        {item.aiInsight && (
                           <div className="mt-auto pt-4 flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold">
                             <Sparkles className="w-4 h-4" /> Insight da Íris
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* COLUNA DIREITA: RADAR TAS E AÇÕES */}
          <div className="space-y-6">
            
            {/* RADAR TAS (Tendências do Backend) */}
            <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-6 sticky top-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-none">Radar TAS</h3>
                  <p className="text-xs text-slate-500 mt-1">Assuntos do momento no Lyv</p>
                </div>
              </div>

              <div className="space-y-4">
                {trends.length === 0 && !isLoading && (
                  <p className="text-sm text-slate-500 text-center py-4">O radar está silencioso hoje.</p>
                )}
                {trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors -mx-2">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300 dark:text-slate-600 font-black text-lg w-4">{index + 1}</span>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-500 transition-colors">{trend.tag}</p>
                        <p className="text-xs text-slate-500">{trend.posts}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 py-3 rounded-xl text-sm font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors">
                Explorar mais tendências
              </button>
            </div>
            
            {/* WIDGET DE CLIMA/LOCAL (Extra elegante) */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] shadow-lg p-6 text-white overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
               <h3 className="font-bold text-lg opacity-90 mb-1">Seu Mundo</h3>
               <p className="text-3xl font-black mb-4">24°C <span className="text-lg opacity-80 font-medium">Bahia, BR</span></p>
               <p className="text-sm opacity-80 leading-relaxed">Céu limpo. Um ótimo dia para explorar o ecossistema Lyv.</p>
            </div>

          </div>

        </div>
      </div>
    </LyvLayout>
  );
}