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
  origin?: string;
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
  origin?: string;
  weight?: number;
  media?: string[];
  image_url?: string;
  video_url?: string;
}

interface MercurioData {
  trends: Trend[];
  news: NewsItem[];
  metadata?: {
    source?: string;
    sources?: string[];
    weight_policy?: Record<string, number>;
  };
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


const toYouTubeEmbed = (url: string) => {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  return "";
};

const collectTrendMedia = (trend: Trend) => {
  const pool = [
    ...(trend.media || []),
    trend.video_url || "",
    trend.image_url || "",
  ].filter(Boolean) as string[];

  const dedup = Array.from(new Set(pool));
  const video = dedup.find((url) => toYouTubeEmbed(url) || /\.(mp4|webm|m3u8)(\?|$)/i.test(url)) || "";
  const image = dedup.find((url) => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url) || /image|img/i.test(url)) || "";
  return { dedup, video, image };
};

const buildArticleParagraphs = (summary: string, topic: string) => {
  const clean = (summary || "").trim();
  if (!clean) {
    return [
      `A redação Mercúrio acompanha os desdobramentos de ${topic} com monitoramento contínuo de sinais da rede BIRD.`,
      "A atualização desta cobertura combina contexto editorial, repercussão social e análise de impacto em tempo real.",
      "Novas informações serão incorporadas conforme a evolução dos fatos e a validação dos dados por nossas camadas de curadoria.",
    ];
  }

  const parts = clean
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length >= 3) return parts;

  return [
    clean,
    `Segundo o monitoramento do Mercúrio, o tema ${topic} segue em alta e concentra grande volume de interações qualificadas.`,
    "A equipe editorial mantém a cobertura em regime de atualização para consolidar contexto, origem e confiabilidade das informações.",
  ];
};

function originLabel(origin?: string) {
  if (origin === "BIRD_NETWORK") return "Bird";
  if (origin === "RSS") return "RSS";
  if (origin === "API_NEWS") return "API";
  return "Mercúrio";
}

function originClass(origin?: string) {
  if (origin === "BIRD_NETWORK") return "bg-[#2442d5]/15 text-[#2442d5]";
  if (origin === "RSS") return "bg-[#0ea64b]/15 text-[#0ea64b]";
  if (origin === "API_NEWS") return "bg-[#ff6a00]/15 text-[#ff6a00]";
  return "bg-slate-200 text-slate-700";
}

function OriginPill({ origin, weight }: { origin?: string; weight?: number }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black ${originClass(origin)}`}>
      {originLabel(origin)} {typeof weight === "number" ? `• peso ${weight}` : ""}
    </span>
  );
}

function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Card className={`bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_10px_35px_rgba(80,93,255,0.12)] ${className}`}>
      {children}
    </Card>
  );
}

function NotFoundContent({ title, basePath }: { title: string; basePath: string }) {
  return (
    <BirdLayout>
      <div className="min-h-screen bg-transparent px-4 py-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <GlassCard className="rounded-3xl">
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-xs font-black uppercase tracking-wide text-[#2442d5]">Mercúrio</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[#112155]">{title}</h1>
              <p className="mt-3 text-slate-700">O conteúdo solicitado não está mais disponível ou ainda não foi indexado no Mercúrio.</p>
              <Link to={basePath} className="inline-block mt-5 rounded-xl bg-[#2442d5] px-4 py-2 text-sm text-white font-bold hover:bg-[#1d36b2]">
                Voltar para a capa
              </Link>
            </CardContent>
          </GlassCard>
        </div>
      </div>
    </BirdLayout>
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

  const activeTrendSlug = useMemo(() => location.pathname.match(/\/(mercurio|news)\/noticia\/([^/]+)/)?.[2] || null, [location.pathname]);
  const activeBulletinSlug = useMemo(() => location.pathname.match(/\/(mercurio|news)\/boletim\/([^/]+)/)?.[2] || null, [location.pathname]);
  const activeTopicSlug = useMemo(() => location.pathname.match(/\/(mercurio|news)\/topico\/([^/]+)/)?.[2] || null, [location.pathname]);

  const activeTrend = activeTrendSlug ? trendsBySlug.get(activeTrendSlug) || null : null;
  const activeBulletin = activeBulletinSlug ? newsBySlug.get(activeBulletinSlug) || null : null;

  const topicTrends = useMemo(() => {
    if (!activeTopicSlug) return [];
    return trends.filter((trend) => tagToSlug(trend.hashtag) === activeTopicSlug);
  }, [activeTopicSlug, trends]);

  if (loading && !data) {
    return (
      <BirdLayout>
        <div className="min-h-screen bg-transparent px-4 py-6 pb-24">
          <div className="mx-auto max-w-6xl space-y-4">
            <GlassCard className="rounded-3xl"><CardContent className="h-28" /></GlassCard>
            <GlassCard className="rounded-3xl"><CardContent className="h-72" /></GlassCard>
          </div>
        </div>
      </BirdLayout>
    );
  }

  if (activeTrendSlug && !activeTrend) return <NotFoundContent title="Matéria não encontrada" basePath={basePath} />;
  if (activeBulletinSlug && !activeBulletin) return <NotFoundContent title="Boletim não encontrado" basePath={basePath} />;

  if (activeTrend) {
    const paragraphs = buildArticleParagraphs(activeTrend.summary, activeTrend.topic || activeTrend.title);
    const relatedArticles = trends.filter((t) => t.id !== activeTrend.id).slice(0, 6);

    return (
      <BirdLayout>
        <div className="min-h-screen bg-transparent px-4 py-6 pb-24">
          <article className="mx-auto max-w-5xl">
            <div className="rounded-3xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-[0_10px_35px_rgba(80,93,255,0.12)] p-5 sm:p-8">
              <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 rounded-full text-[#2442d5] hover:bg-[#2442d5]/10">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>

              <p className={`text-xs font-black tracking-wide uppercase ${categoryStyle[activeTrend.category] || "text-[#e42313]"}`}>
                Redação Mercúrio • {activeTrend.category || "Geral"}
              </p>

              <h1 className="mt-2 text-3xl sm:text-5xl font-black leading-[1.1] text-[#112155]">
                {activeTrend.title || activeTrend.topic}
              </h1>

              <p className="mt-4 text-lg text-slate-700 leading-relaxed">
                {paragraphs[0]}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <OriginPill origin={activeTrend.origin} weight={activeTrend.weight} />
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black bg-slate-100 text-slate-700">
                  Fonte: {activeTrend.source || "Mercúrio"}
                </span>
              </div>

              <div className="mt-6 border-y border-slate-200 py-4">
                {(() => {
                  const media = collectTrendMedia(activeTrend);
                  const embed = toYouTubeEmbed(media.video);

                  if (embed) {
                    return (
                      <iframe
                        src={embed}
                        title={activeTrend.title || activeTrend.topic}
                        className="aspect-video w-full rounded-xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }

                  if (media.video) {
                    return (
                      <video className="aspect-video w-full rounded-xl bg-black" controls preload="metadata">
                        <source src={media.video} />
                      </video>
                    );
                  }

                  if (media.image) {
                    return <img src={media.image} alt={activeTrend.title || activeTrend.topic} className="aspect-video w-full rounded-xl object-cover" />;
                  }

                  return (
                    <div className="aspect-video w-full rounded-xl bg-slate-200/70 flex items-center justify-center text-slate-500 font-bold">
                      Mídia da cobertura Mercúrio
                    </div>
                  );
                })()}
                <p className="mt-2 text-xs text-slate-500">Atualização visual da redação • contexto de {activeTrend.topic || activeTrend.title}</p>
              </div>

              <div className="mt-6 space-y-4 text-[17px] leading-8 text-slate-800">
                {paragraphs.slice(1).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-white/70 bg-gradient-to-br from-[#2442d5]/10 to-[#5ec8ff]/15 p-4">
                <p className="text-sm font-semibold text-[#18317d]">Conteúdo proprietário Mercúrio</p>
                <p className="text-sm text-slate-700 mt-1">
                  Esta matéria segue o padrão editorial Mercúrio: sinal social + contexto verificado + priorização por relevância na rede BIRD.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link to={getTagHref(activeTrend.hashtag)} className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold text-[#2442d5] bg-[#2442d5]/10 hover:bg-[#2442d5]/20">
                  <Hash className="w-4 h-4 mr-1" />
                  {activeTrend.hashtag.startsWith("#") ? activeTrend.hashtag : `#${activeTrend.hashtag}`}
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/70 bg-white/65 backdrop-blur-xl shadow-[0_10px_35px_rgba(80,93,255,0.12)] p-5 sm:p-6">
              <h2 className="text-sm font-black uppercase text-[#2442d5] tracking-wide">Veja também</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedArticles.map((t) => (
                  <Link key={t.id} to={`${basePath}/noticia/${getTrendSlug(t)}`} className="rounded-2xl border border-white/70 bg-white/60 p-3 hover:bg-white/85 transition-colors">
                    <div className="flex items-center gap-2 mb-1"><OriginPill origin={t.origin} weight={t.weight} /></div>
                    <p className={`text-[11px] font-black uppercase ${categoryStyle[t.category] || "text-[#e42313]"}`}>{t.category || "Mercúrio"}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900 leading-snug">{t.title || t.topic}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/70 bg-white/65 backdrop-blur-xl shadow-[0_10px_35px_rgba(80,93,255,0.12)] p-5 sm:p-6">
              <h2 className="text-sm font-black uppercase text-[#2442d5] tracking-wide">Mais da editoria</h2>
              <div className="mt-4 space-y-3">
                {news.slice(0, 6).map((item, index) => (
                  <Link key={`${item.title}-${index}`} to={`${basePath}/boletim/${getNewsSlug(item, index)}`} className="block border-b border-slate-200/70 pb-3 last:border-0">
                    <div className="mb-1"><OriginPill origin={item.origin} weight={item.weight} /></div>
                    <p className="text-xs text-slate-500 font-semibold">{item.source || "Mercúrio"}</p>
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </article>
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
                <div className="mt-3 flex items-center gap-2"><OriginPill origin={activeBulletin.origin} weight={activeBulletin.weight} /></div>
                <p className="mt-2 text-sm text-slate-500">Origem editorial: {activeBulletin.source || "Mercúrio"}</p>
                <p className="mt-4 text-base text-slate-700 leading-relaxed">Conteúdo próprio do Mercúrio publicado em boletim interno com curadoria editorial e distribuição no ecossistema BIRD.</p>
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
                      <div className="flex items-center gap-2 mb-1"><OriginPill origin={item.origin} weight={item.weight} /></div>
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

              <div className="mt-3 text-xs text-slate-500">
                Política de peso: Bird {data?.metadata?.weight_policy?.BIRD_NETWORK ?? 3} • RSS {data?.metadata?.weight_policy?.RSS ?? 2} • API {data?.metadata?.weight_policy?.API_NEWS ?? 1}
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
                  <div className="mt-5 flex flex-wrap gap-2 items-center">
                    <OriginPill origin={hero.origin} weight={hero.weight} />
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
                    <div className="mb-1"><OriginPill origin={item.origin} weight={item.weight} /></div>
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
                      <div className="mb-1"><OriginPill origin={item.origin} weight={item.weight} /></div>
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
                      <div className="mb-1"><OriginPill origin={item.origin} weight={item.weight} /></div>
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
    <GlassCard className="rounded-3xl">
      <CardContent className="p-4" id={id}>
        <h3 className={`text-lg font-black mb-3 ${color}`}>{title}</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl bg-white/55 border border-white/70 p-3">
              <div className="mb-1"><OriginPill origin={item.origin} weight={item.weight} /></div>
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