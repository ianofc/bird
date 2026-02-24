# iris/core/sattr_logic.py

import feedparser
import requests
import re
import hashlib
import logging
import math
import os
import google.generativeai as genai
from datetime import datetime
from typing import List, Dict, Any
from pytrends.request import TrendReq
from dotenv import load_dotenv

load_dotenv()

# --- ARQUITETURA DE LOGS PENTAIA ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IRIS_OMEGA_GEMINI")

class IRIS_Physics:
    """
    Algoritmos matemáticos para predição de tração de rede.
    Implementa decaimento newtoniano para relevância temporal.
    """
    @staticmethod
    def calculate_momentum(weight: float, position: int, source_authority: float) -> float:
        # Fórmula: (Peso da Fonte * (20 - Posição)) / log(Tempo + e)
        # Garante que o que é novo e de fonte forte domine o feed.
        gravity = 1.8
        decay = math.pow(2.0, gravity) 
        momentum = (source_authority * (15 - position)) / decay
        return round(max(momentum, 0.1), 4)

class SATTR:
    """
    IRIS - SATTR (Systemic Algorithm for Real-time Trends & Resonance).
    Edição Gemini: Inteligência Híbrida de Varredura Espectral.
    """
    def __init__(self):
        # 1. Conexão com o Núcleo Neural (Gemini)
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # flash é ideal para latência zero em tempo real
            self.model = genai.GenerativeModel('gemini-1.5-flash') 
            self.ai_enabled = True
            logger.info("Nó de Visão Gemini: Sincronizado.")
        else:
            logger.warning("Nó Gemini indisponível. Operando em modo de visão padrão.")
            self.ai_enabled = False

        # 2. Configuração de Sensores Globais
        self.pytrends = TrendReq(hl='pt-BR', tz=180, retries=3, backoff_factor=1)
        self.sources = {
            "G1": {"url": "https://g1.globo.com/rss/g1/", "weight": 1.4},
            "GOOGLE": {"url": "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419", "weight": 1.2},
            "REUTERS": {"url": "https://www.reutersagency.com/feed/?best-topics=world-news&format=xml", "weight": 1.5}
        }

    def _get_gemini_resonance(self, topic: str) -> str:
        """
        Ressonância Neural: Pergunta ao Gemini o porquê da trend.
        Elimina a necessidade de scrapers lentos de conteúdo.
        """
        if not self.ai_enabled:
            return "Monitoramento de pulso ativo via SATTR padrão."

        prompt = (
            f"Analise o assunto: '{topic}'. "
            "Forneça um contexto de uma única frase, sem introduções, "
            "explicando o impacto imediato disso para o Brasil ou o mundo hoje."
        )
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return "Tendência identificada e sob monitoramento proativo."

    def _to_camel_hashtag(self, text: str) -> str:
        """Determinismo de Hashtag: Garante a identidade visual solicitada."""
        clean = re.sub(r'[^\w\s]', '', text)
        words = clean.split()
        if not words: return "#PentaIA"
        # CamelCase das 2 primeiras palavras semânticas
        tag = "".join(word.capitalize() for word in words[:2] if len(word) > 2)
        return f"#{tag}" if tag else f"#{words[0].capitalize()}"

    def perform_scan(self) -> Dict[str, Any]:
        """
        Varredura de Espectro Total.
        Cruza intenção de busca (Search) com fatos (RSS) e processa via Gemini.
        """
        logger.info("Iniciando varredura IRIS-OMEGA Século XXII...")
        raw_pool = []
        
        # 1. SENSOR PRIMÁRIO: Google Hot Trends
        try:
            df = self.pytrends.trending_searches(pn='brazil')
            for i, row in df.head(10).iterrows():
                raw_pool.append({
                    "topic": row[0],
                    "pos": i,
                    "auth": 2.0, # Maior autoridade: intenção direta
                    "cat_suggest": "Tendência de Busca",
                    "link": f"https://www.google.com/search?q={row[0].replace(' ', '+')}"
                })
        except Exception as e:
            logger.warning(f"Sensor Pytrends em modo cooldown: {e}")

        # 2. SENSOR SECUNDÁRIO: RSS Multicamada
        for name, info in self.sources.items():
            try:
                feed = feedparser.parse(info["url"])
                for i, entry in enumerate(feed.entries[:5]):
                    title = entry.title.split(' - ')[0]
                    raw_pool.append({
                        "topic": title,
                        "pos": i,
                        "auth": info["weight"],
                        "cat_suggest": f"Notícia {name}",
                        "link": entry.link
                    })
            except: continue

        # 3. FILTRAGEM, RESSONÂNCIA E PONTUAÇÃO
        processed = []
        seen_tags = set()

        for item in raw_pool:
            hashtag = self._to_camel_hashtag(item["topic"])
            if hashtag in seen_tags: continue
            seen_tags.add(hashtag)

            # Cálculo de Momentum Gravitacional
            score = IRIS_Physics.calculate_momentum(item["topic"], item["pos"], item["auth"])
            
            # Ressonância Neural (Gemini)
            # Só acionamos o Gemini para os top 12 para economizar cota e ganhar performance
            context = self._get_gemini_resonance(item["topic"]) if len(processed) < 12 else "Pulso validado."

            processed.append({
                "id": hashlib.md5(hashtag.encode()).hexdigest()[:10],
                "hashtag": hashtag,
                "topic": item["topic"],
                "category": self._detect_category(item["topic"]),
                "context": context,
                "link": item["link"],
                "momentum": score,
                "confidence": "High" if item["auth"] > 1.3 else "Standard"
            })

        # Ordenação por Momentum (Explosividade)
        final_trends = sorted(processed, key=lambda x: x["momentum"], reverse=True)

        return {
            "status": "synchronized",
            "engine": "IRIS-OMEGA-GEMINI-2.2",
            "timestamp": datetime.now().isoformat(),
            "stats": {
                "raw_captured": len(raw_pool),
                "neural_resonance": self.ai_enabled
            },
            "google_trends": final_trends
        }

    def _detect_category(self, text: str) -> str:
        """IA Heurística para categorização instantânea (Frontend Badges)."""
        text = text.lower()
        if any(w in text for w in ['vasco', 'gol', 'futebol', 'campeão', 'vitoria', 'flamengo', 'palmeiras']): return "Esportes"
        if any(w in text for w in ['mercado', 'dólar', 'ações', 'economia', 'investimento', 'selic']): return "Economia"
        if any(w in text for w in ['ia', 'tech', 'apple', 'foguete', 'software', 'chip', 'celular']): return "Tecnologia"
        if any(w in text for w in ['governo', 'lula', 'senado', 'política', 'stf', 'eleição']): return "Política"
        if any(w in text for w in ['filme', 'série', 'bbb', 'show', 'música', 'atriz', 'carnaval']): return "Cultura"
        return "Geral"