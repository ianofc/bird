import axios from "axios";

const BASE_URL = "/service/iris";

export interface TrendContext {
  id?: string;
  hashtag: string;
  topic: string;
  category?: string;
  context: string;
  link: string;
  momentum?: number;
  confidence?: string;
  source: string;
  related_posts_count?: number;
  related_news_count?: number;
}

export interface IrisData {
  stats?: {
    raw_captured?: number;
    neural_resonance?: boolean;
    [key: string]: number | boolean | undefined;
  };
  google_trends: TrendContext[];
  news: Array<{ source: string; title: string; link: string; published?: string }>;
}

const normalizeTrend = (trend: Partial<TrendContext>): TrendContext => ({
  id: trend.id,
  hashtag: trend.hashtag || `#${(trend.topic || "PentaIA Trend Agora Brasil").replace(/\s+/g, "")}`,
  topic: trend.topic || "Tendência sem título",
  category: trend.category || "Geral",
  context: trend.context || "Sem contexto disponível.",
  link: trend.link || "",
  momentum: trend.momentum,
  confidence: trend.confidence,
  source: trend.source || "IRIS",
  related_posts_count: trend.related_posts_count ?? 0,
  related_news_count: trend.related_news_count ?? 0,
});

export const MercurioService = {
  async getFullScan(): Promise<IrisData | null> {
    try {
      const response = await axios.get<IrisData>(`${BASE_URL}/scan/full`);
      const payload = response.data;

      return {
        stats: payload?.stats || {},
        google_trends: Array.isArray(payload?.google_trends)
          ? payload.google_trends.map((trend) => normalizeTrend(trend))
          : [],
        news: Array.isArray(payload?.news) ? payload.news : [],
      };
    } catch (error) {
      console.error("Erro Iris:", error);
      return null;
    }
  },
};
