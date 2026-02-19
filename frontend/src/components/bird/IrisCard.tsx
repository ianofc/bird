import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, TrendingUp } from "lucide-react";
import { MercurioService, IrisData } from "@/services/mercurio";

export function IrisCard() {
  const [data, setData] = useState<IrisData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const result = await MercurioService.getFullScan();
    setData(result);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold flex items-center gap-2">
           <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
           Íris Radar
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        {loading && !data && <p className="text-xs text-muted-foreground">Analisando a rede...</p>}
        {data && data.google_trends.slice(0, 4).map((trend, i) => (
            <div key={i} className="flex flex-col gap-1 p-2 -mx-2 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors group">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                    <span>{i + 1} • Assunto em {trend.source}</span>
                </div>
                {/* Clica na hashtag e vai para o Explore do Bird */}
                <Link to={`/explore?q=${encodeURIComponent(trend.topic)}`} className="font-bold text-[15px] group-hover:text-primary transition-colors">
                    {trend.topic}
                </Link>
                <span className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                    {trend.context}
                </span>
            </div>
        ))}
        <Button variant="outline" className="w-full text-xs h-8 rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-all" asChild>
            <Link to="/mercurio">Mostrar Mais na Central</Link>
        </Button>
      </CardContent>
    </Card>
  );
}