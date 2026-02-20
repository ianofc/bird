import requests
from bs4 import BeautifulSoup
import re
import logging
import hashlib

# Configuração de Logs para o Ecossistema PentaIA
logger = logging.getLogger("IRIS_SATTR")
logging.basicConfig(level=logging.INFO)

class SATTR:
    """
    Componente de Varredura Ativa da IRIS.
    Responsável por capturar dados crus da mídia e eventos em tempo real.
    """
    def __init__(self):
        self.sources = {
            "g1": "https://g1.globo.com/rss/g1/",
            "google": "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419",
            "football": "https://api.football-data.org/v4/matches" # Placeholder para integração TAS
        }

    def _generate_id(self, text):
        return hashlib.md_item(text.encode()).hexdigest()[:10]

    def _clean_hashtag(self, text):
        # Lógica compartilhada com o TAS para transformar títulos em #hashtags
        words = re.findall(r'\w+', text)
        if not words: return "#Trend"
        # Pega as duas primeiras palavras significativas e junta
        tag = "".join(word.capitalize() for word in words[:2])
        return f"#{tag}"

    def perform_scan(self):
        logger.info("SATTR: Iniciando varredura PentaIA (G1 + Google News)...")
        real_trends = []
        headers = {'User-Agent': 'Mozilla/5.0'}

        # 1. Captura G1 (RSS)
        try:
            res_g1 = requests.get(self.sources["g1"], headers=headers, timeout=5)
            soup_g1 = BeautifulSoup(res_g1.content, 'xml')
            for item in soup_g1.find_all('item')[:5]:
                title = item.title.text
                real_trends.append({
                    "id": self._generate_id(title),
                    "category": "G1 - Brasil",
                    "topic": title,
                    "hashtag": self._clean_hashtag(title),
                    "volume": "Explodindo",
                    "link": item.link.text
                })
        except Exception as e:
            logger.error(f"SATTR Erro G1: {e}")

        # 2. Captura Google News (RSS)
        try:
            res_gn = requests.get(self.sources["google"], headers=headers, timeout=5)
            soup_gn = BeautifulSoup(res_gn.content, 'xml')
            for item in soup_gn.find_all('item')[:5]:
                full_title = item.title.text
                title = full_title.rsplit(' - ', 1)[0] # Remove o nome do veículo
                real_trends.append({
                    "id": self._generate_id(title),
                    "category": "Global",
                    "topic": title,
                    "hashtag": self._clean_hashtag(title),
                    "volume": "Em Alta",
                    "link": item.link.text
                })
        except Exception as e:
            logger.error(f"SATTR Erro Google News: {e}")

        # Fallback de segurança para não quebrar o React
        if not real_trends:
            real_trends = [{
                "id": "offline", 
                "category": "Sema", 
                "topic": "Sincronizando pulso de rede...", 
                "hashtag": "#Offline", 
                "volume": "0"
            }]

        return {
            "stats": {
                "trends_count": len(real_trends),
                "active_sensors": ["G1", "GoogleNews"],
                "shield_status": "Active" # Status pro-ativo do Heimdall
            },
            "google_trends": real_trends, # Mantido nome da chave para compatibilidade com o front-end
            "breaking_news": real_trends[:2], # ZIOS usaria isso para os cards de destaque
            "matches": [] # TAS preencherá via API de Futebol
        }

class IRISAnalyzer:
    """
    Interface de alto nível para o Mercúrio e ZIOS.
    """
    def __init__(self):
        self.sattr = SATTR()

    def get_real_trends(self):
        """
        Método final chamado pelo main.py do Mercúrio.
        Retorna o bundle completo processado.
        """
        scan_result = self.sattr.perform_scan()
        # Aqui, no futuro, o ZIOS pode interceptar o scan_result['google_trends'] 
        # e adicionar um campo "summary": zios.summarize(topic)
        return scan_result["google_trends"]

# Instâncias prontas para uso
sattr = SATTR()
iris_analyzer = IRISAnalyzer()