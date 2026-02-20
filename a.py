import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"✅ Arquivo atualizado: {path}")

# ==========================================
# 1. O SEU RIGHTSIDEBAR EXATO, MAS COM IRIS E HEIMDALL
# ==========================================
right_sidebar_code = """
import { useBird } from "@/contexts/BirdContext";
import { TrendingUp, MoreHorizontal, Search, Lock, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export function RightSidebar() {
  const { trends } = useBird();
  const [scanStatus, setScanStatus] = useState("Idle");

  // Simulação do ciclo de vida da IRIS (SATTR)
  useEffect(() => {
    const statuses = ["Mining Data...", "Parsing Trends...", "Optimizing SATTR...", "IRIS Active"];
    let i = 0;
    const interval = setInterval(() => {
      setScanStatus(statuses[i % statuses.length]);
      i++;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="sticky top-0 h-screen p-6 space-y-6 overflow-y-auto scrollbar-hide">
      
      {/* BARRA DE BUSCA */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="O que procuras?" 
          className="w-full bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
        />
      </div>

      {/* IRIS (SATTR): TRENDING TOPICS */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 shadow-xl overflow-hidden relative group">
        
        {/* BARRA DE SCAN (FEEDBACK DA IRIS) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100/50">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-scan shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" /> IRIS Trends
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{scanStatus}</span>
            </div>
          </div>
          <Activity className="w-4 h-4 text-gray-300" />
        </div>

        <div className="space-y-6">
          {trends && trends.map((trend: any, index: number) => (
            <div key={trend.id || index} className="group/item cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">{trend.category}</p>
                  <p className="text-[15px] font-black text-gray-800 group-hover/item:text-indigo-600 transition-colors leading-tight line-clamp-2">{trend.topic}</p>
                  <p className="text-xs font-medium text-gray-500 mt-1">{trend.volume}</p>
                </div>
                <button className="text-gray-300 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all shrink-0 ml-2">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-8 py-3 text-xs font-black text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors border-2 border-dashed border-indigo-100 uppercase tracking-widest">
          Expandir Relatório IRIS
        </button>
      </div>

      {/* SEGURANÇA HEIMDALL */}
      <div className="bg-gray-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10">
            <Lock size={120} />
        </div>
        <div className="relative z-10">
            <h3 className="font-black text-lg mb-1 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" /> Heimdall
            </h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-4">Privacidade Blindada</p>
            <p className="text-xs text-gray-300 leading-relaxed">Heimdall ativo: protegendo a sua privacidade e mantendo seus dados a sete chaves.</p>
        </div>
      </div>
    </aside>
  );
}
"""
write_file("frontend/src/components/bird/RightSidebar.tsx", right_sidebar_code)

# ==========================================
# 2. CONSERTANDO O IRIS (G1 + Google Nativo Sem Quebrar o Docker)
# ==========================================
sattr_logic = """
import urllib.request
import xml.etree.ElementTree as ET
import logging

logger = logging.getLogger("IRIS_SATTR")

class SATTR:
    def perform_scan(self):
        logger.info("SATTR Iniciando varredura na Mídia (G1 + Google News)...")
        real_trends = []
        
        # 1. API DO G1 VIA RSS (Mesmo resultado do Selenium, 10x mais rapido e não quebra o Docker)
        try:
            req_g1 = urllib.request.Request("https://g1.globo.com/rss/g1/", headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req_g1, timeout=10) as response:
                root = ET.fromstring(response.read())
                for item in root.findall('.//item')[:3]: # Pega as 3 mais quentes do G1
                    title = item.find('title').text
                    real_trends.append({
                        "id": str(hash(title)),
                        "category": "G1",
                        "topic": title,
                        "volume": "Em alta"
                    })
        except Exception as e:
            logger.error(f"Erro G1: {e}")

        # 2. API DO GOOGLE NEWS
        try:
            url = "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                root = ET.fromstring(response.read())
                for item in root.findall('.//item')[:3]: # Pega 3 quentes do Google
                    title = item.find('title').text.rsplit(' - ', 1)[0]
                    real_trends.append({
                        "id": str(hash(title)),
                        "category": "Notícias Globais",
                        "topic": title,
                        "volume": "Destaque"
                    })
        except Exception as e:
            logger.error(f"Erro Google News: {e}")

        # Se tudo falhar, manda dados de fallback para o React nao bugar mapeando 'undefined'
        if not real_trends:
            real_trends = [
                {"id": "1", "category": "SATTR", "topic": "Aguardando sincronização...", "volume": "Online"}
            ]

        return {
            "stats": {"trends_count": len(real_trends), "news_count": len(real_trends)},
            "google_trends": real_trends,
            "breaking_news": [],
            "matches": []
        }
"""
write_file("iris/core/sattr_logic.py", sattr_logic)
print("🚀 Frontend atualizado com Heimdall e IRIS. Backend blindado contra Erro 500!")