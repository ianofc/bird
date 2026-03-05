import { BirdLayout } from "@/components/bird/BirdLayout";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Hash, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

const categoryStyle: Record<string, string> = {
  Jornalismo: "text-[#e42313]",
  Esportes: "text-[#0ea64b]",
  Entretenimento: "text-[#ff6a00]",
  Política: "text-[#e42313]",
  Economia: "text-[#2563eb]",
  Mundo: "text-[#e42313]",
};

const normalizeSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const tagToSlug = (tag: string) => normalizeSlug(tag.replace("#", ""));

const getTrendSlug = (trend: Trend) => `${normalizeSlug(trend.title || trend.topic)}-${trend.id}`;
const getNewsSlug = (item: NewsItem, index: number) => `${normalizeSlug(item.title || `boletim-${index + 1}`)}-${index}`;

function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Card className={`bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_10px_35px_rgba(80,93,255,0.12)] ${className}`}>
      {children}
    </Card>
  );
}

export default function Mercurio() {
  const [data, setData] = useState<MercurioData | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const basePath = location.pathname.startsWith("/news") ? "/news" : "/mercurio";

  const getTagHref = (tag: string) => `${basePath}/topico/${tagToSlug(tag)}`;

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
  const news = data?.news || [];

  const trendsBySlug = useMemo(() => {
    const map = new Map<string, Trend>();
    trends.forEach((trend) => map.set(getTrendSlug(trend), trend));
    return map;
  }, [trends]);

  const newsBySlug = useMemo(() => {
    const map = new Map<string, NewsItem>();
    news.forEach((item, index) => map.set(getNewsSlug(item, index), item));
    return map;
  }, [news]);

  const activeTrend = useMemo(() => {
    const match = location.pathname.match(/\/(mercurio|news)\/noticia\/([^/]+)/);
    if (!match) return null;
    return trendsBySlug.get(match[2]) || null;
  }, [location.pathname, trendsBySlug]);

  const activeBulletin = useMemo(() => {
    const match = location.pathname.match(/\/(mercurio|news)\/boletim\/([^/]+)/);
    if (!match) return null;
    return newsBySlug.get(match[2]) || null;
  }, [location.pathname, newsBySlug]);

  const activeTopicSlug = useMemo(() => {
    const match = location.pathname.match(/\/(mercurio|news)\/topico\/([^/]+)/);
    return match?.[2] || null;
  }, [location.pathname]);

  const topicTrends = useMemo(() => {
    if (!activeTopicSlug) return [];
    return trends.filter((trend) => tagToSlug(trend.hashtag) === activeTopicSlug);
  }, [activeTopicSlug, trends]);

  const hero = trends[0];
  const sideHighlights = trends.slice(1, 5);
  const editorias = {
    Jornalismo: trends.slice(5, 12),
    Esportes: trends.slice(12, 19),
    Entretenimento: trends.slice(19, 26),
  };

  const sublinks = [
    { label: "Últimas", anchor: "ultimas" },
    { label: "Jornalismo", anchor: "jornalismo" },
    { label: "Esportes", anchor: "esportes" },
    { label: "Entretenimento", anchor: "entretenimento" },
    { label: "Top Mercúrio", anchor: "top-mercurio" },
  ];

  if (activeTrend) {
    return (
      <BirdLayout>
        <div className="min-h-screen bg-transparent px-4 py-6 pb-24">
          <div className="mx-auto max-w-5xl space-y-5">
            <GlassCard className="rounded-3xl">
              <CardContent className="p-5 sm:p-7">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 rounded-full text-[#2442d5] hover:bg-[#2442d5]/10">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>

                <p className={`text-xs font-black tracking-wide uppercase ${categoryStyle[activeTrend.category] || "text-[#e42313]"}`}>
                  Redação Mercúrio • {activeTrend.category || "Destaque"}
                </p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-black leading-tight text-[#112155]">{activeTrend.title || activeTrend.topic}</h1>
                <p className="mt-4 text-base text-slate-700 leading-relaxed">{activeTrend.summary}</p>

                <div className="mt-5 rounded-2xl border border-white/70 bg-gradient-to-br from-[#2442d5]/10 to-[#5ec8ff]/15 p-4">
                  <p className="text-sm font-semibold text-[#18317d]">Conteúdo proprietário Mercúrio</p>
                  <p className="text-sm text-slate-700 mt-1">Matéria editorial consolidada no núcleo Mercúrio, com linguagem própria da redação BIRD.</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Link to={getTagHref(activeTrend.hashtag)} className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold text-[#2442d5] bg-[#2442d5]/10 hover:bg-[#2442d5]/20">
                    <Hash className="w-4 h-4 mr-1" />
                    {activeTrend.hashtag.startsWith("#") ? activeTrend.hashtag : `#${activeTrend.hashtag}`}
                  </Link>
                </div>
              </CardContent>
            </GlassCard>

            <GlassCard className="rounded-3xl">
              <CardContent className="p-5">
                <h2 className="text-sm font-black uppercase text-[#2442d5] tracking-wide">Mais da cobertura Mercúrio</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trends
                    .filter((t) => t.id !== activeTrend.id)
                    .slice(0, 6)
                    .map((t) => (
                      <Link
                        key={t.id}
                        to={`${basePath}/noticia/${getTrendSlug(t)}`}
                        className="rounded-2xl border border-white/70 bg-white/60 p-3 hover:bg-white/85 transition-colors"
                      >
                        <p className={`text-[11px] font-black uppercase ${categoryStyle[t.category] || "text-[#e42313]"}`}>{t.category || "Mercúrio"}</p>
                        <p className="mt-1 text-sm font-bold text-slate-900 leading-snug">{t.title || t.topic}</p>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </GlassCard>
          </div>
        </div>
      </BirdLayout>
    );
  }

  if (activeBulletin) {
    return (
      <BirdLayout>
        <div className="min-h-screen bg-transparent px-4 py-6 pb-24">
          <div className="mx-auto max-w-5xl space-y-5">
            <GlassCard className="rounded-3xl">
              <CardContent className="p-5 sm:p-7">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 rounded-full text-[#2442d5] hover:bg-[#2442d5]/10">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <p className="text-xs font-black tracking-wide uppercase text-[#2442d5]">Boletim Mercúrio</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-black leading-tight text-[#112155]">{activeBulletin.title}</h1>
                <p className="mt-4 text-base text-slate-700 leading-relaxed">
                  Conteúdo próprio do Mercúrio publicado em boletim interno com curadoria editorial e distribuição no ecossistema BIRD.
                </p>
              </CardContent>
            </GlassCard>
          </div>
        </div>
      </BirdLayout>
    );
  }

  if (activeTopicSlug) {
    const topicLabel = topicTrends[0]?.hashtag?.replace("#", "") || activeTopicSlug.replaceAll("-", " ");

    return (
      <BirdLayout>
        <div className="min-h-screen bg-transparent px-4 py-6 pb-24">
          <div className="mx-auto max-w-6xl space-y-5">
            <GlassCard className="rounded-3xl">
              <CardContent className="p-5 sm:p-7">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 rounded-full text-[#2442d5] hover:bg-[#2442d5]/10">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <p className="text-xs font-black tracking-wide uppercase text-[#2442d5]">Tópico Mercúrio</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-black leading-tight text-[#112155]">#{topicLabel}</h1>
                <p className="mt-3 text-slate-700">Todas as matérias e sinais relacionados a este tópico dentro do Mercúrio.</p>
              </CardContent>
            </GlassCard>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topicTrends.length ? (
                topicTrends.map((item) => (
                  <GlassCard key={item.id} className="rounded-2xl">
                    <CardContent className="p-4">
                      <p className={`text-[11px] font-black uppercase ${categoryStyle[item.category] || "text-[#e42313]"}`}>{item.category || "Mercúrio"}</p>
                      <h2 className="mt-1 text-base font-bold text-slate-900 leading-tight">{item.title || item.topic}</h2>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.summary}</p>
                      <Link to={`${basePath}/noticia/${getTrendSlug(item)}`} className="mt-3 inline-block text-xs font-bold text-[#2442d5] hover:underline">
                        Ler matéria
                      </Link>
                    </CardContent>
                  </GlassCard>
                ))
              ) : (
                <GlassCard className="rounded-2xl md:col-span-2 lg:col-span-3">
                  <CardContent className="p-6 text-sm text-slate-700">Nenhuma matéria encontrada para este tópico no momento.</CardContent>
                </GlassCard>
              )}
            </section>
          </div>
        </div>
      </BirdLayout>
    );
  }

  return (
    <BirdLayout>
      <div className="min-h-screen bg-transparent px-4 py-6 pb-24">
        <div className="mx-auto max-w-6xl space-y-6">
          <GlassCard className="rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#2442d5] to-[#4e7bff] text-white text-xs px-4 py-2 flex items-center justify-between">
              <span className="font-semibold">Mercúrio • BIRD</span>
              <span className="opacity-90">Aurora Clean • Light</span>
            </div>

            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#2442d5] font-bold">Portal de notícias Mercúrio</p>
                  <h1 className="text-3xl sm:text-4xl font-black text-[#e42313] leading-none">Mercúrio</h1>
                </div>
                <Button onClick={fetchData} disabled={loading} variant="outline" className="rounded-full border-[#2442d5]/30 text-[#2442d5]">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
              </div>

              <nav className="mt-4 flex flex-wrap gap-2">
                {sublinks.map((link) => (
                  <a key={link.anchor} href={`#${link.anchor}`} className="rounded-full px-3 py-1.5 text-xs font-bold bg-[#2442d5]/10 text-[#2442d5] hover:bg-[#2442d5]/20">
                    {link.label}
                  </a>
                ))}
              </nav>
            </CardContent>
          </GlassCard>

          <section id="ultimas" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <GlassCard className="lg:col-span-7 rounded-3xl">
              <CardContent className="p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-wide text-[#e42313]">Destaque Mercúrio</p>
                <h2 className="mt-2 text-3xl font-black text-[#112155] leading-tight">{hero?.title || "Panorama estratégico do dia no ecossistema BIRD"}</h2>
                <p className="mt-3 text-slate-700">{hero?.summary || "Acompanhe a cobertura integral do Mercúrio com análise própria e contexto social em tempo real."}</p>
                {hero && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={`${basePath}/noticia/${getTrendSlug(hero)}`} className="rounded-xl bg-[#e42313] px-4 py-2 text-sm text-white font-bold hover:bg-[#cc1f11]">
                      Ler matéria completa
                    </Link>
                    <Link to={getTagHref(hero.hashtag)} className="rounded-xl bg-[#2442d5]/10 px-4 py-2 text-sm text-[#2442d5] font-bold hover:bg-[#2442d5]/20">
                      Abrir #{hero.hashtag.replace("#", "")} no Mercúrio
                    </Link>
                  </div>
                )}
              </CardContent>
            </GlassCard>

            <div className="lg:col-span-5 space-y-4">
              {sideHighlights.map((item) => (
                <GlassCard key={item.id} className="rounded-2xl">
                  <CardContent className="p-4">
                    <p className={`text-xs font-black uppercase ${categoryStyle[item.category] || "text-[#e42313]"}`}>{item.category || "Mercúrio"}</p>
                    <h3 className="mt-1 text-base font-bold text-slate-900 leading-tight">{item.title || item.topic}</h3>
                    <div className="mt-3 flex gap-2">
                      <Link to={`${basePath}/noticia/${getTrendSlug(item)}`} className="text-xs font-bold text-[#2442d5] hover:underline">
                        Abrir matéria
                      </Link>
                      <Link to={getTagHref(item.hashtag)} className="text-xs font-bold text-[#e42313] hover:underline">
                        Ver #{item.hashtag.replace("#", "")}
                      </Link>
                    </div>
                  </CardContent>
                </GlassCard>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <EditoriaColumn id="jornalismo" title="Jornalismo" color="text-[#e42313]" items={editorias.Jornalismo} basePath={basePath} getTagHref={getTagHref} />
            <EditoriaColumn id="esportes" title="Esportes" color="text-[#0ea64b]" items={editorias.Esportes} basePath={basePath} getTagHref={getTagHref} />
            <EditoriaColumn id="entretenimento" title="Entretenimento" color="text-[#ff6a00]" items={editorias.Entretenimento} basePath={basePath} getTagHref={getTagHref} />
          </section>

          <section id="top-mercurio" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <GlassCard className="lg:col-span-2 rounded-3xl">
              <CardContent className="p-5">
                <h3 className="text-sm uppercase font-black text-[#2442d5] tracking-wide">Radar Mercúrio agora</h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trends.slice(0, 8).map((item) => (
                    <Link key={item.id} to={`${basePath}/noticia/${getTrendSlug(item)}`} className="rounded-2xl border border-white/60 bg-white/60 p-3 hover:bg-white/80">
                      <p className={`text-[11px] font-black uppercase ${categoryStyle[item.category] || "text-[#e42313]"}`}>{item.category || "Mercúrio"}</p>
                      <p className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">{item.title || item.topic}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </GlassCard>

            <GlassCard className="rounded-3xl">
              <CardContent className="p-5">
                <h3 className="text-sm uppercase font-black text-[#2442d5] tracking-wide">Últimas da redação</h3>
                <div className="mt-3 space-y-3">
                  {news.slice(0, 8).map((item, index) => (
                    <Link key={`${item.title}-${index}`} to={`${basePath}/boletim/${getNewsSlug(item, index)}`} className="block border-b border-slate-200/70 pb-2 last:border-0 hover:opacity-80">
                      <p className="text-[11px] font-bold text-slate-500">Mercúrio • {item.source || "Radar"}</p>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </GlassCard>
          </section>
        </div>
      </div>
    </BirdLayout>
  );
}

function EditoriaColumn({
  id,
  title,
  color,
  items,
  basePath,
  getTagHref,
}: {
  id: string;
  title: string;
  color: string;
  items: Trend[];
  basePath: string;
  getTagHref: (tag: string) => string;
}) {
  return (
    <GlassCard className="rounded-3xl" >
      <CardContent className="p-4" id={id}>
        <h3 className={`text-lg font-black mb-3 ${color}`}>{title}</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl bg-white/55 border border-white/70 p-3">
              <p className={`text-[11px] font-black uppercase ${color}`}>{item.category || title}</p>
              <h4 className="mt-1 text-sm font-bold text-slate-900 leading-tight">{item.title || item.topic}</h4>
              <div className="mt-2 flex gap-2 text-xs font-bold">
                <Link to={`${basePath}/noticia/${getTrendSlug(item)}`} className="text-[#2442d5] hover:underline">
                  Abrir
                </Link>
                <Link to={getTagHref(item.hashtag)} className="text-[#e42313] hover:underline">
                  #{item.hashtag.replace("#", "")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </GlassCard>
  );
}