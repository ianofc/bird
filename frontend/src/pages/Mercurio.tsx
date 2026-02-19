import { BirdLayout } from "@/components/bird/BirdLayout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MercurioService, IrisData } from "@/services/mercurio";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, TrendingUp, Radio, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Mercurio() {
  const [data, setData] = useState<IrisData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const result = await MercurioService.getFullScan();
    setData(result);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <BirdLayout>
      <div className="max-w-2xl mx-auto w-full space-y-6 p-4">
        
        {/* Header Glassmorphism */}
        <div className="flex flex-col gap-2 mb-6 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg">
                        <Radio className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Central Mercurio</h1>
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mt-1">Inteligência Íris (SATTR)</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="rounded-full bg-background/50 backdrop-blur-sm">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Scan
                </Button>
            </div>
        </div>

        {loading ? (
            <div className="space-y-4">
                {[1,2,3].map(n => <Skeleton key={n} className="h-32 w-full rounded-2xl bg-card/50" />)}
            </div>
        ) : data && (
            <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 px-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> O que está rolando agora
                </h2>
                
                {data.google_trends.map((trend, idx) => (
                    <Card key={idx} className="overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all group">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider bg-secondary/50">
                                    {trend.source}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-semibold">#{idx + 1}</span>
                            </div>
                            
                            <h3 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors mb-2">
                                {trend.topic}
                            </h3>
                            
                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                {trend.context}
                            </p>
                            
                            <div className="flex items-center gap-3">
                                {/* Botão para buscar DENTRO do BIRD */}
                                <Button className="rounded-full flex-1 gap-2" asChild>
                                    <Link to={`/explore?q=${encodeURIComponent(trend.topic)}`}>
                                        <Search className="w-4 h-4" /> Repercussão no BIRD
                                    </Link>
                                </Button>
                                {/* Botão para ler a notícia real fora */}
                                <Button variant="secondary" className="rounded-full flex-1 gap-2 bg-secondary/50" asChild>
                                    <a href={trend.link} target="_blank" rel="noopener noreferrer">
                                        Ler Notícia Real <ExternalLink className="w-4 h-4" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </BirdLayout>
  );
}