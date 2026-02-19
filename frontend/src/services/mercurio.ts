import axios from 'axios';

// Usando o proxy do Vite
const BASE_URL = "/service/iris"; 

export interface TrendContext {
  topic: string;
  context: string;
  link: string;
  source: string;
}

export interface IrisData {
  stats: { trends_count: number; news_count: number };
  google_trends: TrendContext[];
  breaking_news: TrendContext[];
  matches: any[];
}

export const MercurioService = {
  async getFullScan(): Promise<IrisData | null> {
    try {
      const response = await axios.get(`${BASE_URL}/scan/full`);
      return response.data;
    } catch (error) {
      console.error("Erro Iris:", error);
      return null;
    }
  }
};