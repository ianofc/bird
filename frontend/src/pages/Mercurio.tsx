import { BirdLayout } from "@/components/bird/BirdLayout";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const categoryColors: Record<string, string> = {
  Jornalismo: "text-red-600",
  Esportes: "text-green-600",
  Entretenimento: "text-orange-500",
  Política: "text-red-700",
  Economia: "text-blue-600",
  Mundo: "text-red-500",
};

const adBanner = "https://placehold.co/970x90/ffe000/0f172a?text=Publicidade";

export default function Mercurio() {
  const [data, setData] = useState<MercurioData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/service/mercurio/api/v1/mercurio/bundle");
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao carregar Mercúrio:", error);
      setData({ trends: [], news: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const trends = data?.trends || [];
  const hero = trends[0];
  const sideHighlights = trends.slice(1, 5);
  const threeColumns = useMemo(() => {
    return {
      jornalismo: trends.slice(5, 12),
      esporte: trends.slice(12, 19),
      entretenimento: trends.slice(19, 26),
    };
  }, [trends]);

  const lineColor = (category: string) => categoryColors[category] || "text-red-600";

  return (
    <BirdLayout>
      <div className="min-h-screen bg-white">
        <header className="border-b border-slate-200">
          <div className="bg-[#083d9c] text-white text-xs">
            <div className="mx-auto max-w-6xl px-4 py-1 flex items-center justify-between">
              <span>globo.com</span>
              <span className="opacity-80">Mercúrio • BIRD</span>
            </div>
          </div>

          <div className="border-b border-slate-200">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <h1 className="text-4xl font-black text-red-600 leading-none">g1</h1>
              <Button onClick={fetchData} disabled={loading} variant="outline" className="rounded-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>

          <nav className="mx-auto max-w-6xl px-4 py-3 text-sm font-semibold text-slate-700 flex gap-6 overflow-auto">
            <a href="#" className="text-red-600">Últimas notícias</a>
            <a href="#">Mercúrio Agora</a>
            <a href="#">Jornalismo</a>
            <a href="#">Esporte</a>
            <a href="#">Entretenimento</a>
            <a href="#">Vídeos</a>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 space-y-10">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-b border-slate-200 pb-8">
            <article className="lg:col-span-7">
              <div className="rounded-xl overflow-hidden">
                <img src="https://placehold.co/900x500/dbeafe/0f172a?text=Manchete+Principal" alt="Destaque principal" className="w-full h-64 object-cover" />
              </div>
              <p className="text-xs text-red-600 font-bold mt-3">MERCÚRIO</p>
              <h2 className="text-4xl font-black leading-tight mt-1 text-slate-900">
                {hero?.title || "Brasil avança por nova corrida de blocos econômicos e integração digital"}
              </h2>
              <p className="text-slate-600 mt-3 text-lg">
                {hero?.summary || "Portal com visual inspirado no G1 para leitura rápida, hierarquia editorial e destaque de manchetes em tempo real."}
              </p>
            </article>

            <aside className="lg:col-span-5 space-y-4">
              {sideHighlights.map((item) => (
                <article key={item.id} className="grid grid-cols-[120px_1fr] gap-3 border-b border-slate-200 pb-3">
                  <img src="https://placehold.co/240x140/e2e8f0/334155?text=thumb" alt={item.title} className="w-full h-[76px] rounded-md object-cover" />
                  <div>
                    <p className={`text-xs font-bold ${lineColor(item.category)}`}>{item.category || "Notícia"}</p>
                    <h3 className="text-base font-bold leading-tight text-slate-900">{item.title || item.topic}</h3>
                  </div>
                </article>
              ))}
            </aside>
          </section>

          <section>
            <img src={adBanner} alt="Publicidade" className="w-full rounded-md border border-slate-200" />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ColumnBlock title="Jornalismo" color="text-red-600" items={threeColumns.jornalismo} />
            <ColumnBlock title="Esporte" color="text-green-600" items={threeColumns.esporte} />
            <ColumnBlock title="Entretenimento" color="text-orange-500" items={threeColumns.entretenimento} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-lg bg-black p-4">
              <div className="h-72 bg-slate-900 rounded-md flex items-center justify-center text-white text-6xl">▶</div>
              <p className="text-white text-sm mt-3">Em alta no BIRD 24h</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <h3 className="text-sm uppercase font-black text-slate-800">Últimas</h3>
              {(data?.news || []).slice(0, 6).map((item, index) => (
                <a key={`${item.link}-${index}`} href={item.link} target="_blank" rel="noreferrer" className="block border-b border-slate-100 pb-2">
                  <p className="text-[11px] text-slate-500 font-semibold">{item.source}</p>
                  <p className="text-sm font-bold text-slate-900 hover:text-red-600">{item.title}</p>
                </a>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-black text-[#083d9c] mb-4">Top Globo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TopList title="jornalismo" color="text-red-600" items={trends.slice(0, 5)} />
              <TopList title="esporte" color="text-green-600" items={trends.slice(5, 10)} />
              <TopList title="entretenimento" color="text-orange-500" items={trends.slice(10, 15)} />
            </div>
          </section>

          <footer className="mt-16 border-t border-slate-200 pt-8 text-xs text-slate-500">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i}>link institucional {i + 1}</span>
              ))}
            </div>
            <div className="mt-8 bg-[#083d9c] text-white px-4 py-3 rounded">© Mercúrio • Interface inspirada no portal G1</div>
          </footer>
        </main>
      </div>
    </BirdLayout>
  );
}

function ColumnBlock({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: Trend[];
}) {
  return (
    <div>
      <h3 className={`text-xl font-black mb-4 ${color}`}>{title}</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="grid grid-cols-[96px_1fr] gap-3">
            <img src="https://placehold.co/180x110/e2e8f0/334155?text=foto" alt={item.title} className="w-full h-16 rounded object-cover" />
            <div>
              <p className={`text-[11px] font-bold ${color}`}>{item.category || title}</p>
              <h4 className="text-sm font-bold leading-tight text-slate-900">{item.title || item.topic}</h4>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TopList({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: Trend[];
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h4 className={`font-black uppercase mb-3 ${color}`}>{title}</h4>
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={item.id} className="text-sm leading-tight flex gap-2">
            <span className={`font-black ${color}`}>{index + 1}.</span>
            <a href={item.link} target="_blank" rel="noreferrer" className="hover:underline">
              {item.title || item.topic} <ExternalLink className="inline w-3 h-3" />
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
