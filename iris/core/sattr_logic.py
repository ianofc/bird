import feedparser
import re
import logging
import urllib.request

logger = logging.getLogger("IRIS_SATTR")

class SATTR:
    def perform_scan(self):
        logger.info("Coletando Contexto Real via Google News RSS...")
        url = "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419"
        
        try:
            # Truque para evitar bloqueio 403/500 do Google
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                feed = feedparser.parse(response.read())
            
            real_trends = []
            
            if not feed.entries:
                logger.warning("Nenhuma notícia encontrada no feed.")
                return self._get_fallback_data()

            for entry in feed.entries[:5]: # Pega os 5 assuntos mais quentes
                title = entry.title
                main_subject = title.rsplit(' - ', 1)[0] if ' - ' in title else title
                source = entry.source.title if hasattr(entry, 'source') else "Mídia"
                
                # Gerar hashtag com regex mais seguro
                words = re.findall(r'\b[A-Za-zÀ-ÿ]{4,}\b', main_subject)
                hashtag = f"#{''.join([w.capitalize() for w in words[:2]])}" if words else "#Urgente"
                
                real_trends.append({
                    "topic": hashtag,
                    "context": main_subject,
                    "link": entry.link,
                    "source": source
                })

            return {
                "stats": {"trends_count": len(real_trends), "news_count": len(real_trends)},
                "google_trends": real_trends,
                "breaking_news": real_trends,
                "matches": []
            }
        except Exception as e:
            logger.error(f"Erro na coleta: {str(e)}")
            return self._get_fallback_data()

    def _get_fallback_data(self):
        # Se der erro 500, manda dados de backup para o frontend não quebrar
        return {
            "stats": {"trends_count": 1, "news_count": 1},
            "google_trends": [{
                "topic": "#ConexaoFalhou",
                "context": "O Google bloqueou temporariamente a leitura do RSS. Tentando novamente em breve...",
                "link": "#",
                "source": "Iris System"
            }],
            "breaking_news": [],
            "matches": []
        }