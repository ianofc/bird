import { BirdLayout } from "@/components/bird/BirdLayout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  RefreshCw, 
  TrendingUp, 
  Radio, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Activity,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Interface alinhada com o bundle do backend unificado
interface Trend {
  id: string;
  category: string;
  topic: string;
  hashtag: string;
  volume: string;
  link: string;
}

interface MercurioData {
  trends: Trend[];
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

  const fetchData = async () => {
    setLoading(true);
    try {
      // Bate no unificador Mercurio que consolidou IRIS e Heimdall
      const response = await fetch('/service/mercurio/api/v1/mercurio/bundle');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao carregar Central Mercurio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <BirdLayout>
      <div className="w-full max-w-4xl p-4 pb-20 mx-auto space-y-6">
        
        {/* HEADER CENTRAL - IDENTIDADE VISUAL PENTAIA */}
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
                           <Activity className="w-3 h-3" /> Pulso do Ecossistema PentaIA
                        </p>
                    </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={fetchData} 
                  disabled={loading} 
                  className="font-bold transition-all rounded-2xl bg-white/50 backdrop-blur-sm border-white/80 hover:bg-white"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Sincronizar Sensores
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* COLUNA DA ESQUERDA: STATUS HEIMDALL & EVENTOS */}
          <div className="space-y-6 lg:col-span-1">
              {/* CARD HEIMDALL */}
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

              {/* CARD EVENTOS RÁPIDOS */}
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

          {/* COLUNA DA DIREITA (CONTEÚDO PRINCIPAL): TRENDS IRIS */}
          <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="flex items-center gap-2 text-xl font-black text-gray-900">
                    <TrendingUp className="w-6 h-6 text-indigo-600" /> O que está rolando agora
                </h2>
                <Badge variant="outline" className="font-bold text-indigo-600 border-indigo-200 rounded-full bg-indigo-50">
                    {data?.trends.length || 0} Trends Ativas
                </Badge>
              </div>

              {loading ? (
                  <div className="space-y-4">
                      {[1, 2, 3, 4].map(n => <Skeleton key={n} className="h-40 w-full rounded-[2rem] bg-white/50" />)}
                  </div>
              ) : data?.trends.map((trend, idx) => (
                  <Card key={trend.id} className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/60 backdrop-blur-sm hover:shadow-2xl hover:scale-[1.01] transition-all group">
                      <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none text-[10px] font-black tracking-widest px-3 py-1">
                                  {trend.category}
                              </Badge>
                              <span className="text-xs font-black text-gray-400">#{idx + 1}</span>
                          </div>
                          
                          <div className="mb-4">
                              <h3 className="mb-2 text-2xl font-black leading-tight text-gray-900 transition-colors group-hover:text-indigo-600">
                                  {trend.hashtag}
                              </h3>
                              <p className="font-medium leading-relaxed text-gray-600">
                                  {trend.topic}
                              </p>
                          </div>
                          
                          <div className="flex items-center gap-3 pt-2 border-t border-gray-100/50">
                              <Button className="flex-1 h-12 gap-2 font-bold transition-all bg-gray-900 shadow-lg rounded-2xl hover:bg-indigo-600 shadow-indigo-500/10" asChild>
                                  <Link to={`/explore?q=${encodeURIComponent(trend.hashtag)}`}>
                                      <Search className="w-4 h-4" /> Repercussão no BIRD
                                  </Link>
                              </Button>
                              <Button variant="outline" className="h-12 gap-2 px-6 font-bold border-gray-200 rounded-2xl bg-white/50 hover:border-indigo-300" asChild>
                                  <a href={trend.link} target="_blank" rel="noopener noreferrer">
                                      Fonte <ExternalLink className="w-4 h-4" />
                                  </a>
                              </Button>
                          </div>
                      </CardContent>
                  </Card>
              ))}
          </div>

        </div>
      </div>
    </BirdLayout>
  );
}