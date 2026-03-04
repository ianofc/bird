import { BirdLayout } from "@/components/bird/BirdLayout";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  RefreshCw,
  TrendingUp,
  Radio,
  ExternalLink,
  Activity,
  Users,
  MessageCircle,
  Newspaper,
  Hash,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Descomente caso já tenha o componente criado
// import { IrisCard } from "@/components/bird/IrisCard";

interface BirdSignal {
  posts_count: number;
  comments_count: number;
  hotspots: string[];
  top_authors: string[];
}

interface Trend {
  id: string;
  category: string;
  title: string;
  topic: string;
  summary: string;
  source: string;
  hashtag: string;
  volume: string | number;
  link: string;
  bird_signal?: BirdSignal;
}

interface NewsItem {
  source: string;
  title: string;
  link: string;
  published: string;
}

interface MercurioData {
  trends: Trend[];
  news: NewsItem[];
}

export default function Mercurio() {
  const [data, setData] = useState<MercurioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const selectedTrend = searchParams.get("trend")?.toLowerCase() || "";

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/service/mercurio/api/v1/mercurio/bundle");
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao carregar Central Mercurio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const orderedTrends = [...(data?.trends || [])].sort((a, b) => {
    if (!selectedTrend) return 0;
    const aHit = `${a.hashtag} ${a.title} ${a.topic}`.toLowerCase().includes(selectedTrend);
    const bHit = `${b.hashtag} ${b.title} ${b.topic}`.toLowerCase().includes(selectedTrend);
    if (aHit && !bHit) return -1;
    if (!aHit && bHit) return 1;
    return 0;
  });

  const mainHeadline = orderedTrends[0];
  const secondaryNews = orderedTrends.slice(1);

  return (
    <BirdLayout>
      <div className="w-full max-w-7xl p-4 pb-20 mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col gap-2 p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-md border border-white/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 rounded-full bg-indigo-500/10 blur-3xl -z-10" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 shadow-lg bg-gradient-to-br from-indigo-600 to-sky-400 rounded-2xl shadow-indigo-500/20">
                <Radio className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-gray-900">Central Mercúrio</h1>
                <p className="flex items-center gap-2 mt-1 text-xs font-bold tracking-widest text-indigo-600 uppercase">
                  <Activity className="w-3 h-3" /> Panorama Jornalístico + Pulso Social BIRD
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={loading} className="font-bold transition-all rounded-2xl bg-white/50 backdrop-blur-sm border-white/80 hover:bg-white text-indigo-900">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Sincronizar
            </Button>
          </div>
        </div>

        {/* GRID ESTILO PORTAL G1 (12 Colunas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA - EDITORIAS (2 Cols) */}
          <aside className="hidden lg:block lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 shadow-lg sticky top-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-5 flex items-center gap-2">
                <Newspaper className="w-4 h-4" /> Editorias
              </h3>
              <ul className="space-y-3 text-sm font-bold text-gray-600">
                <li className="hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-0 transition-opacity" /> Mundo
                </li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-0 transition-opacity" /> Tecnologia
                </li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-2 text-indigo-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-100" /> BIRD Ecosystem
                </li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-0 transition-opacity" /> Educação
                </li>
              </ul>
            </div>
          </aside>

          {/* COLUNA CENTRAL - NOTÍCIAS PRINCIPAIS (7 Cols) */}
          <main className="lg:col-span-7 space-y-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-[400px] w-full rounded-[2rem] bg-white/50" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-48 w-full rounded-2xl bg-white/50" />
                  <Skeleton className="h-48 w-full rounded-2xl bg-white/50" />
                </div>
              </div>
            ) : (
              <>
                {/* MANCHETÃO PRINCIPAL */}
                {mainHeadline && (
                  <section className="group overflow-hidden rounded-[2rem] bg-white/60 backdrop-blur-lg border border-white/50 shadow-xl transition-all hover:shadow-2xl hover:border-indigo-300">
                    {/* Placeholder para foto de capa com Glassmorphism */}
                    <div className="h-48 sm:h-64 w-full bg-gradient-to-br from-indigo-500/10 to-sky-400/10 relative flex items-center justify-center border-b border-white/30">
                      <div className="absolute inset-0 bg-[url('/icons3d/newspaper.png')] bg-center bg-no-repeat bg-contain opacity-10 mix-blend-overlay"></div>
                      <Radio className="w-16 h-16 text-indigo-300/40" />
                    </div>
                    
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none text-[10px] font-black tracking-widest px-3 py-1">
                          {mainHeadline.category}
                        </Badge>
                        <span className="text-xs font-black text-gray-400 uppercase">
                          Destaque Principal
                        </span>
                      </div>
                      
                      <Link to={`/explore?q=${encodeURIComponent(mainHeadline.hashtag)}`}>
                        <h2 className="text-3xl sm:text-4xl font-black leading-[1.1] text-gray-900 group-hover:text-indigo-600 transition-colors mb-3">
                          {mainHeadline.title || mainHeadline.topic}
                        </h2>
                      </Link>
                      
                      <p className="text-gray-600 font-medium text-lg leading-relaxed mb-6">
                        {mainHeadline.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200/50">
                        <Button className="h-11 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20" asChild>
                          <Link to={`/explore?q=${encodeURIComponent(mainHeadline.hashtag)}`}>
                            <MessageCircle className="w-4 h-4 mr-2" /> Ver repercussão no BIRD
                          </Link>
                        </Button>
                        <Button variant="ghost" className="h-11 rounded-xl font-bold text-gray-600 hover:text-indigo-700" asChild>
                          <a href={mainHeadline.link} target="_blank" rel="noopener noreferrer">
                            Matéria original <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </section>
                )}

                {/* GRID DE NOTÍCIAS SECUNDÁRIAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {secondaryNews.map((trend) => (
                    <article key={trend.id} className="flex flex-col p-5 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/50 hover:bg-white/80 transition-all shadow-sm hover:shadow-md group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-indigo-500 tracking-wider uppercase">{trend.category}</span>
                      </div>
                      
                      <h3 className="font-bold text-lg leading-snug text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-3">
                        {trend.title || trend.topic}
                      </h3>
                      
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                        {trend.summary}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-auto">
                        <Button variant="secondary" size="sm" className="rounded-lg font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 w-full" asChild>
                          <Link to={`/explore?q=${encodeURIComponent(trend.hashtag)}`}>Repercussão</Link>
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </main>

          {/* COLUNA DIREITA - HUB DE IA E TRENDS (3 Cols) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="sticky top-4 space-y-6">
              
              {/* COMPONENTE IRIS (Seu Hub de IA) */}
              <div className="p-1 rounded-[1.5rem] bg-gradient-to-b from-indigo-500/20 to-transparent">
                <div className="p-5 rounded-[1.4rem] bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl">
                  <h3 className="flex items-center gap-2 font-black text-gray-900 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping relative">
                      <span className="absolute inset-0 w-full h-full bg-indigo-500 rounded-full" />
                    </span>
                    IRIS Intelligence
                  </h3>
                  {/* <IrisCard variant="mercurio" /> */}
                  <div className="h-32 bg-white/40 rounded-xl border border-white/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-400">Analisando o fluxo neural...</span>
                  </div>
                </div>
              </div>

              {/* MAIS LIDAS / EM ALTA NO BIRD */}
              <Card className="rounded-[1.5rem] bg-white/40 backdrop-blur-md border border-white/50 shadow-lg">
                <CardContent className="p-5">
                  <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <TrendingUp className="w-4 h-4 text-indigo-500" /> Em Alta no Hub
                  </h4>
                  <ul className="space-y-4">
                    {orderedTrends.slice(0, 5).map((t, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <span className="text-2xl font-black text-indigo-200 group-hover:text-indigo-500 transition-colors leading-none">
                          {i + 1}
                        </span>
                        <div>
                          <Link to={`/explore?q=${encodeURIComponent(t.hashtag)}`} className="text-sm font-bold text-gray-700 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-tight">
                            {t.title || t.topic}
                          </Link>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                            <Hash className="w-3 h-3" /> {t.hashtag.replace('#', '')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* ÚLTIMAS NOTÍCIAS RÁPIDAS */}
              {!!data?.news?.length && (
                <Card className="rounded-[1.5rem] bg-white/40 backdrop-blur-md border border-white/50 shadow-lg">
                  <CardContent className="p-5">
                    <h4 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wide">
                      Últimas do Radar
                    </h4>
                    <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-1.5 before:w-px before:bg-indigo-100">
                      {data.news.slice(0, 4).map((item, i) => (
                        <div key={i} className="relative pl-5">
                          <span className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white bg-indigo-400 z-10" />
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-0.5">{item.source}</p>
                            <p className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {item.title}
                            </p>
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </aside>

        </div>
      </div>
    </BirdLayout>
  );
}