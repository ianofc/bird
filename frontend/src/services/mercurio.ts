import { api } from './api';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string;
  category: string;
  publishedAt: string;
  aiInsight?: string; // Comentário da Íris sobre a notícia
}

export const mercurioService = {
  // Busca as tendências em alta (Integração com TAS)
  getTrending: async () => {
    try {
      const response = await api.get('/trending/');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar trends do TAS", error);
      return [];
    }
  },

  // Busca as notícias reais (Integração com Íris)
  getNews: async (category: string = 'todas'): Promise<NewsItem[]> => {
    try {
      // Como a Íris roda num microserviço separado (Api_Noticias_G1), 
      // idealmente o Django faz a ponte. Se não houver endpoint ainda, 
      // podemos bater direto no microserviço ou usar fallback premium.
      const response = await api.get(`/news/?category=${category}`);
      return response.data;
    } catch (error) {
      // Fallback Elegante de Desenvolvimento (Enquanto a Íris não está 100% plugada no ar)
      return [
        {
          id: "news-1",
          title: "A Revolução do Lyvifi: Como a Pentaia está mudando as redes sociais",
          summary: "Especialistas apontam que a nova arquitetura dividida em 5 motores de IA (Zios, Íris, TAS, Heimdall e Gaia) cria um ecossistema sem precedentes na internet moderna.",
          source: "TechTudo",
          url: "#",
          imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&fit=crop",
          category: "Tecnologia",
          publishedAt: new Date().toISOString(),
          aiInsight: "Análise Íris: A arquitetura distribuída aumenta a segurança dos dados em 40%."
        },
        {
          id: "news-2",
          title: "Mercados globais reagem à nova política de privacidade do Heimdall",
          summary: "A criptografia ponta-a-ponta nativa do novo guardião do Lyvifi estabelece um novo padrão que gigantes do Vale do Silício terão que seguir.",
          source: "G1 Economia",
          url: "#",
          imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&fit=crop",
          category: "Economia",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "news-3",
          title: "Inteligência Artificial Generativa chega aos Smartwatches",
          summary: "O processamento local permite que IAs funcionem direto do pulso, sem depender de conexão com a nuvem.",
          source: "Canaltech",
          url: "#",
          imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&fit=crop",
          category: "Inovação",
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          aiInsight: "Análise Íris: Hardware da Apple e Samsung receberão updates no Q3."
        }
      ];
    }
  }
};