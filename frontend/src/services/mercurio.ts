import axios from 'axios';

const BASE_URL = "/service/iris";

export interface TrendContext {
  topic: string;
  context: string;
  link: string;
  source: string;
  hashtag?: string;
}

export interface IrisData {
  stats?: Record<string, number | boolean>;
  google_trends: TrendContext[];
  news?: any[];
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
