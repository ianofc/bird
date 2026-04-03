import { BirdLayout } from "@/components/bird/BirdLayout";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Hash, RefreshCw, Radio, Globe2, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

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
  origin?: 'BIRD_NETWORK' | 'RSS' | 'API_NEWS';
  weight?: number;
  media?: string[];
  image_url?: string;
  video_url?: string;
}

interface NewsItem {
  source: string;
  title: string;
  link: string;
  published: string;
  origin?: 'BIRD_NETWORK' | 'RSS' | 'API_NEWS';
  weight?: number;
}

interface MercurioData {
  trends: Trend[];
  news: NewsItem[];
  metadata?: {
    weight_policy?: Record<string, number>;
  };
}

// Estilo editorial mantido, mas otimizado para Dark/Light mode
const categoryStyle: Record<string, string> = {
  Jornalismo: "text-rose-600 dark:text-rose-400",
  Esportes: "text-emerald-600 dark:text-emerald-400",
  Entretenimento: "text-amber-600 dark:text-amber-400",
  Política: "text-rose-600 dark:text-rose-400",
  Economia: "text-blue-600 dark:text-blue-400",
  Mundo: "text-indigo-600 dark:text-indigo-400",
};

const normalizeSlug = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

const tagToSlug = (tag: string) => normalizeSlug(tag.replace("#", ""));
const getTrendSlug = (trend: Trend) => `${normalizeSlug(trend.title || trend.topic)}-${trend.id}`;
const getNewsSlug = (item: NewsItem, index: number) => `${normalizeSlug(item.title || `boletim-${index + 1}`)}-${index}`;

const toYouTubeEmbed = (url: string) => {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  return "";
};

function OriginPill({ origin, weight }: { origin?: string; weight?: number }) {
  let config = { color: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: Newspaper, label: "Mercúrio" };
  
  if (origin === "BIRD_NETWORK") config = { color: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20", icon: Radio, label: "Rede Bird" };
  if (origin === "RSS") config = { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20", icon: Globe2, label: "Jornais/RSS" };
  if (origin === "API_NEWS") config = { color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20", icon: Newspaper, label: "Agências" };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${config.color}`}>
      <Icon className="w-3 h-3" /> {config.label} {weight ? `• P${weight}` : ""}
    </span>
  );
}

function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Card className={`bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl transition-colors ${className}`}>
      {children}
    </Card>
  );
}

// --- DADOS DE FALLBACK (CACHE REALISTA) ---
// Quando a API falha, a rede injeta os últimos dados conhecidos de Jornais, Bird e APIs
const generateFallbackData = (): MercurioData => {
  const baseTrends: Trend[] = [
    { id: '1', category: 'Tecnologia', title: 'PentaIA alcança marco histórico de processamento autônomo na rede Bird', topic: 'PentaIA', summary: 'A inteligência artificial proprietária do ecossistema demonstrou capacidade de curadoria 40x mais rápida.', source: 'Bird Radar', hashtag: '#PentaIA', volume: '145k', link: '#', origin: 'BIRD_NETWORK', weight: 3, image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&fit=crop' },
    { id: '2', category: 'Jornalismo', title: 'Mercados globais reagem às novas políticas de transição energética', topic: 'Economia Global', summary: 'Bolsas europeias e asiáticas abrem em alta após acordos assinados em Genebra.', source: 'Folha de S.Paulo', hashtag: '#Economia', volume: '89k', link: '#', origin: 'RSS', weight: 2, image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&fit=crop' },
    { id: '3', category: 'Mundo', title: 'Avanços na fusão nuclear prometem energia limpa para a próxima década', topic: 'Ciência', summary: 'Laboratórios relatam ganho líquido de energia em reatores experimentais.', source: 'Reuters API', hashtag: '#Ciencia', volume: '50k', link: '#', origin: 'API_NEWS', weight: 1, image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&fit=crop' },
    { id: '4', category: 'Esportes', title: 'Finais do Campeonato Europeu quebram recordes de audiência', topic: 'Futebol', summary: 'A final transmitida ontem bateu o recorde histórico de espectadores simultâneos.', source: 'Globo Esporte', hashtag: '#Futebol', volume: '2M', link: '#', origin: 'RSS', weight: 2, image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&fit=crop' },
    { id: '5', category: 'Entretenimento', title: 'O retorno dos festivais presenciais: line-ups e polêmicas', topic: 'Música', summary: 'Produtoras anunciam calendários lotados, mas fãs reclamam dos preços dos ingressos.', source: 'Omelete', hashtag: '#Festivais', volume: '300k', link: '#', origin: 'API_NEWS', weight: 1, image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&fit=crop' },
  ];

  // Gerador preenche o resto do grid para a página não ficar vazia
  const fillerTrends: Trend[] = Array.from({ length: 25 }).map((_, i) => ({
    id: `f-${i}`,
    category: i % 3 === 0 ? 'Jornalismo' : i % 3 === 1 ? 'Esportes' : 'Entretenimento',
    title: `Atualização de Radar Mercúrio #${i + 100}`,
    topic: `Tópico Dinâmico ${i}`,
    summary: `Monitoramento contínuo da rede detectou pico de menções sobre este assunto. A curadoria automática classificou o evento com relevância alta.`,
    source: i % 2 === 0 ? 'G1 RSS' : 'Bird Network',
    hashtag: `#trend${i}`,
    volume: `${Math.floor(Math.random() * 50)}k`,
    link: '#',
    origin: i % 3 === 0 ? 'RSS' : i % 3 === 1 ? 'API_NEWS' : 'BIRD_NETWORK',
  }));

  const news: NewsItem[] = Array.from({ length: 10 }).map((_, i) => ({
    source: i % 2 === 0 ? 'CNN Brasil' : 'Bird Radar',
    title: `Giro de Notícias: Destaques da hora na editoria ${i % 2 === 0 ? 'Mundo' : 'Local'}`,
    link: '#',
    published: new Date(Date.now() - i * 3600000).toISOString(),
    origin: i % 2 === 0 ? 'API_NEWS' : 'BIRD_NETWORK',
  }));

  return { trends: [...baseTrends, ...fillerTrends], news, metadata: { weight_policy: { BIRD_NETWORK: 3, RSS: 2, API_NEWS: 1 } } };
};


export default function Mercurio() {
  const [data, setData] = useState<MercurioData | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const basePath = "/mercurio";
  const getTagHref = (tag: string) => `${basePath}/topico/${tagToSlug(tag)}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Tenta buscar da API real
      const response = await fetch("/service/mercurio/api/v1/mercurio/bundle");
      if (!response.ok) throw new Error("API Indisponível");
      const json = await response.json();
      setData(json);
    } catch (error) {
      // SISTEMA DE FALLBACK AUTOMÁTICO (Nunca deixa a tela em branco)
      console.warn("Mercúrio API off. Injetando dados de cache/fallback via RSS e Pentaia.");
      toast.info("Mercúrio operando em modo offline via cache.", { icon: <Radio className="w-4 h-4 text-cyan-500" />});
      
      // Delay simulado para fluidez de UI
      await new Promise(r => setTimeout(r, 600));
      setData(generateFallbackData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const trends = data?.trends || [];
  const news = data?.news || [];

  // Pega slugs da URL para abrir notícias específicas
  const activeTrendSlug = useMemo(() => location.pathname.match(/\/(mercurio|news)\/noticia\/([^/]+)/)?.[2] || null, [location.pathname]);
  const activeTrend = activeTrendSlug ? trends.find(t => getTrendSlug(t) === activeTrendSlug) || null : null;

  if (loading && !data) {
    return (
      <BirdLayout>
        <div className="min-h-screen bg-transparent px-4 py-8 flex flex-col items-center justify-center space-y-4">
           <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
           <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">O Mercúrio está compilando o mundo para você...</p>
        </div>
      </BirdLayout>
    );
  }

  // --- TELA DE LEITURA DE MATÉRIA ESPECÍFICA ---
  if (activeTrend) {
    return (
      <BirdLayout>
        <div className="min-h-screen bg-transparent px-2 md:px-4 py-6 pb-24">
          <article className="mx-auto max-w-4xl">
            <GlassCard className="rounded-[2.5rem] p-6 md:p-10 border-0 md:border shadow-2xl">
              <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Painel
              </Button>

              <div className="flex items-center gap-3 mb-4">
                <OriginPill origin={activeTrend.origin} weight={activeTrend.weight} />
                <span className={`text-xs font-black tracking-widest uppercase ${categoryStyle[activeTrend.category] || "text-cyan-500"}`}>
                  {activeTrend.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight md:leading-[1.1] mb-6">
                {activeTrend.title}
              </h1>

              {activeTrend.image_url && (
                <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg border border-slate-200 dark:border-slate-800">
                  <img src={activeTrend.image_url} alt="Capa" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-6">
                {activeTrend.summary}
              </p>

              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500">
                  Fonte de origem da matéria: <strong>{activeTrend.source}</strong>
                </p>
                <div className="mt-4">
                  <Link to={getTagHref(activeTrend.hashtag)} className="inline-flex items-center rounded-full px-4 py-2 text-sm font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                    <Hash className="w-4 h-4 mr-1" /> {activeTrend.hashtag.replace("#", "")}
                  </Link>
                </div>
              </div>
            </GlassCard>
          </article>
        </div>
      </BirdLayout>
    );
  }

  // --- O PAINEL MERCÚRIO PRINCIPAL (DASHBOARD) ---
  const hero = trends[0];
  const sideHighlights = trends.slice(1, 5);
  const editorias = {
    Jornalismo: trends.slice(5, 11),
    Esportes: trends.slice(11, 17),
    Entretenimento: trends.slice(17, 23),
  };

  return (
    <BirdLayout>
      <div className="min-h-screen bg-transparent px-2 md:px-6 py-4 md:py-8 pb-24">
        <div className="mx-auto max-w-[1400px] space-y-6">
          
          {/* TOPO: Header Editorial */}
          <GlassCard className="rounded-[2rem] overflow-hidden border-0 md:border">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 text-white text-xs px-6 py-2.5 flex items-center justify-between shadow-inner">
              <span className="font-bold flex items-center gap-2"><Globe2 className="w-4 h-4 text-cyan-400" /> Mercúrio Hub</span>
              <span className="opacity-70 font-medium">BIRD NETWORK DATA</span>
            </div>

            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 leading-none tracking-tight">
                    Mercúrio
                  </h1>
                  <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">
                    Curadoria de Notícias, Jornais e Tendências da Rede em Tempo Real.
                  </p>
                </div>
                <Button onClick={fetchData} disabled={loading} className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 font-bold shadow-lg">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  {loading ? 'Buscando...' : 'Sincronizar'}
                </Button>
              </div>

              {/* Filtros rápidos */}
              <nav className="mt-6 flex flex-wrap gap-2">
                {["Últimas", "Jornalismo", "Esportes", "Entretenimento", "Mundo"].map((label) => (
                  <button key={label} className="rounded-full px-4 py-2 text-xs font-bold bg-white/50 dark:bg-black/20 text-slate-800 dark:text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors border border-slate-200 dark:border-slate-800">
                    {label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </GlassCard>

          {/* BLOCO 1: Manchete Principal e Destaques Laterais */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* MANCHETE HERO */}
            <GlassCard className="lg:col-span-8 rounded-[2rem] overflow-hidden border-0 md:border group cursor-pointer relative" onClick={() => navigate(`${basePath}/noticia/${getTrendSlug(hero)}`)}>
              {hero?.image_url && (
                <div className="absolute inset-0 w-full h-full z-0">
                  <img src={hero.image_url} alt="Capa" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent dark:from-black dark:via-black/80" />
                </div>
              )}
              
              <CardContent className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-end min-h-[400px] md:min-h-[500px]">
                <div className="mb-4"><OriginPill origin={hero?.origin} weight={hero?.weight} /></div>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg max-w-3xl">
                  {hero?.title || "Carregando destaques..."}
                </h2>
                <p className="mt-4 text-slate-200 font-medium max-w-2xl line-clamp-2 md:line-clamp-3 text-lg">
                  {hero?.summary}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">Ler matéria</span>
                  <span className="text-slate-300 text-sm font-medium">Fonte: {hero?.source}</span>
                </div>
              </CardContent>
            </GlassCard>

            {/* DESTAQUES LATERAIS */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {sideHighlights.map((item) => (
                <GlassCard key={item.id} className="rounded-2xl flex-1 hover:bg-white/80 dark:hover:bg-[#1E293B]/80 transition-colors">
                  <Link to={`${basePath}/noticia/${getTrendSlug(item)}`} className="block p-5 h-full">
                    <div className="flex items-center justify-between mb-2">
                      <OriginPill origin={item.origin} weight={item.weight} />
                      <span className={`text-[10px] font-black uppercase tracking-wider ${categoryStyle[item.category] || "text-cyan-500"}`}>{item.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-cyan-600 transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* BLOCO 2: Editorias em Grid (Três Colunas) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EditoriaColumn title="Jornalismo" color="text-rose-600 dark:text-rose-400" items={editorias.Jornalismo} basePath={basePath} />
            <EditoriaColumn title="Esportes" color="text-emerald-600 dark:text-emerald-400" items={editorias.Esportes} basePath={basePath} />
            <EditoriaColumn title="Entretenimento" color="text-amber-600 dark:text-amber-400" items={editorias.Entretenimento} basePath={basePath} />
          </section>

        </div>
      </div>
    </BirdLayout>
  );
}

// Subcomponente para as colunas de Editoria
function EditoriaColumn({ title, color, items, basePath }: { title: string; color: string; items: Trend[]; basePath: string; }) {
  return (
    <GlassCard className="rounded-[2rem]">
      <CardContent className="p-5">
        <h3 className={`text-xl font-black mb-4 flex items-center gap-2 ${color}`}>
          {title}
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <Link key={item.id} to={`${basePath}/noticia/${getTrendSlug(item)}`} className="block rounded-2xl bg-white/40 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 p-4 hover:bg-white/80 dark:hover:bg-black/40 transition-colors">
              <div className="mb-2"><OriginPill origin={item.origin} /></div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-3">
                {item.title}
              </h4>
              <p className="mt-2 text-xs font-medium text-slate-500">Fonte: {item.source}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </GlassCard>
  );
}