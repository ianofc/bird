import { BirdLayout } from "@/components/bird/BirdLayout";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  RefreshCw,
  TrendingUp,
  Radio,
  ExternalLink,
  ShieldCheck,
  Activity,
  Zap,
  Newspaper,
  MessageCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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
  security: {
    status: string;
    shield_level: string;
    client_ip?: string;
  };
  events: any[];
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

  return (
    <BirdLayout>
      <div className="w-full max-w-5xl p-4 pb-20 mx-auto space-y-6">
        <div className="flex flex-col gap-2 mb-8 p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-md border border-white/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 rounded-full bg-indigo-500/10 blur-3xl -z-10" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-indigo-500/20">
                <Radio className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-gray-900">Central Mercúrio</h1>
                <p className="flex items-center gap-2 mt-1 text-xs font-bold tracking-widest text-indigo-600 uppercase">
                  <Activity className="w-3 h-3" /> Panorama Jornalístico + Pulso Social BIRD
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={loading} className="font-bold transition-all rounded-2xl bg-white/50 backdrop-blur-sm border-white/80 hover:bg-white">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Sincronizar Sensores
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Card className="rounded-[2rem] bg-gray-900 border-none text-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={80} />
              </div>
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 mb-4 text-lg font-black">
                  <ShieldCheck className="w-5 h-5 text-green-400" /> Heimdall
                </h2>
                <div className="space-y-4">
                  <div className="p-4 border bg-white/5 rounded-2xl border-white/10">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Status do Escudo</p>
                    <p className="text-xl font-bold text-green-400">{loading ? "Verificando..." : data?.security.status || "Ativo"}</p>
                  </div>
                  <div className="p-4 border bg-white/5 rounded-2xl border-white/10">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Nível de Integridade</p>
                    <p className="text-xl font-bold text-indigo-400">{data?.security.shield_level || "Otimizado"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl">
              <h3 className="flex items-center gap-2 mb-4 font-black text-gray-900">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Eventos Próximos
              </h3>
              <div className="space-y-3">
                {data?.events.map((ev, i) => (
                  <div key={i} className="flex flex-col p-3 border rounded-xl bg-white/40 border-white/20">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">{ev.category}</span>
                    <span className="text-sm font-bold text-gray-800">{ev.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="flex items-center gap-2 text-xl font-black text-gray-900">
                <Newspaper className="w-6 h-6 text-indigo-600" /> Mercúrio Notícias
              </h2>
              <Badge variant="outline" className="font-bold text-indigo-600 border-indigo-200 rounded-full bg-indigo-50">
                {data?.trends.length || 0} Manchetes
              </Badge>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-48 w-full rounded-[2rem] bg-white/50" />
                ))}
              </div>
            ) : (
              orderedTrends.map((trend, idx) => (
                <Card key={trend.id} className={`overflow-hidden rounded-[2rem] border bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all group ${selectedTrend && `${trend.hashtag} ${trend.title} ${trend.topic}`.toLowerCase().includes(selectedTrend) ? "border-indigo-400 shadow-indigo-200/60" : "border-white/50"}`}> 
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none text-[10px] font-black tracking-widest px-3 py-1">
                          {trend.category}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-bold border-gray-200 text-gray-500">
                          Fonte: {trend.source}
                        </Badge>
                      </div>
                      <span className="text-xs font-black text-gray-400">#{idx + 1}</span>
                    </div>

                    <div>
                      <h3 className="mb-2 text-2xl font-black leading-tight text-gray-900 transition-colors group-hover:text-indigo-600">
                        {trend.title || trend.topic}
                      </h3>
                      <p className="font-medium leading-relaxed text-gray-600">{trend.summary || trend.topic}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="p-3 border rounded-xl bg-white/50 border-gray-100">
                        <p className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase">
                          <TrendingUp className="w-3 h-3" /> Trend IRIS
                        </p>
                        <p className="text-sm font-bold text-gray-800 mt-1">{trend.hashtag}</p>
                        <p className="text-xs text-gray-500">Volume: {trend.volume}</p>
                      </div>
                      <div className="p-3 border rounded-xl bg-white/50 border-gray-100">
                        <p className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase">
                          <Users className="w-3 h-3" /> Repercussão no BIRD
                        </p>
                        <p className="text-xs text-gray-700 mt-1">Posts: {trend.bird_signal?.posts_count ?? 0} • Comentários: {trend.bird_signal?.comments_count ?? 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Top autores: {(trend.bird_signal?.top_authors || []).join(", ")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100/50">
                      <Button className="flex-1 h-12 gap-2 font-bold transition-all bg-gray-900 shadow-lg rounded-2xl hover:bg-indigo-600 shadow-indigo-500/10" asChild>
                        <Link to={`/explore?q=${encodeURIComponent(trend.hashtag)}`}>
                          <MessageCircle className="w-4 h-4" /> Ver posts no BIRD
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-12 gap-2 px-6 font-bold border-gray-200 rounded-2xl bg-white/50 hover:border-indigo-300" asChild>
                        <a href={trend.link} target="_blank" rel="noopener noreferrer">
                          Notícia completa <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {!!data?.news?.length && (
              <Card className="rounded-[2rem] border border-white/50 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-black text-gray-900 mb-4">Últimas da Redação</h3>
                  <div className="space-y-3">
                    {data.news.slice(0, 6).map((item, i) => (
                      <a key={`${item.title}-${i}`} href={item.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl border border-gray-100 bg-white/50 hover:bg-indigo-50/50 transition-colors">
                        <p className="text-xs font-black uppercase tracking-wide text-indigo-500">{item.source}</p>
                        <p className="text-sm font-bold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.published}</p>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </BirdLayout>
  );
}
