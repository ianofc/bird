import React, { useState, useEffect } from "react";
import { 
  Search, Eye, Shield, Zap, Brain, Rocket, Activity 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/services/api";

// --- Evolution Gauge Component (Agora refletindo dados reais) ---
const EvolutionGauge = ({ level }: { level: number }) => {
  const levels = [
    { id: 1, label: 'Reativo', icon: <Eye size={16}/>, color: 'text-blue-500', bg: 'bg-blue-500', glow: 'shadow-blue-500/20' },
    { id: 2, label: 'Contextual', icon: <Shield size={16}/>, color: 'text-cyan-500', bg: 'bg-cyan-500', glow: 'shadow-cyan-500/20' },
    { id: 3, label: 'Proativo', icon: <Zap size={16}/>, color: 'text-amber-500', bg: 'bg-amber-500', glow: 'shadow-amber-500/30' },
    { id: 4, label: 'Inovador', icon: <Brain size={16}/>, color: 'text-purple-500', bg: 'bg-purple-500', glow: 'shadow-purple-500/30' },
    { id: 5, label: 'Simbiótico', icon: <Rocket size={16}/>, color: 'text-emerald-500', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/40' },
  ];

  // Limita o nível entre 1 e 5
  const currentLevel = Math.min(Math.max(level, 1), 5);
  const current = levels[currentLevel - 1];

  return (
    <div className={`p-5 rounded-3xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-xl ${current.glow} transition-all duration-700`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Evolução Zios</span>
        <span className={`flex items-center gap-1.5 text-xs font-mono font-bold ${current.color}`}>
          {current.icon} LVL 0{currentLevel}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden relative">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out bg-gradient-to-r from-transparent via-white/50 to-current ${current.bg}`}
          style={{ width: `${(currentLevel / 5) * 100}%` }}
        />
      </div>
      <p className="mt-3 text-[13px] font-semibold text-slate-700 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${current.bg} shadow-lg`} />
        Estágio {current.label}
      </p>
    </div>
  );
};

export function RightSidebar() {
  const [trends, setTrends] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  
  // Aqui você buscará o nível real do usuário no contexto ou API. 
  // Iniciando em 1 (Reativo) para novas contas.
  const userEvolutionLevel = 1; 

  // Busca as Trends REAIS da sua API (IRIS/TAS)
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        // Ajuste a rota para a sua rota real do backend quando ela estiver pronta
        const response = await api.get('/discovery/trends/'); 
        setTrends(response.data);
      } catch (error) {
        console.error("Erro ao buscar trends do IRIS, usando fallback temporário", error);
        // Fallback temporário até a rota estar enviando os dados do scraper
        setTrends([
          { tag: "InteligenciaArtificial", vol: "Monitorando...", cat: "Tecnologia", hot: true },
          { tag: "InovaçãoSustentável", vol: "Monitorando...", cat: "Educação", hot: false },
          { tag: "MercadoTech", vol: "Monitorando...", cat: "Economia", hot: false },
        ]);
      } finally {
        setLoadingTrends(false);
      }
    };

    fetchTrends();
  }, []);

  return (
    <aside className="hidden lg:flex w-[350px] flex-col gap-6 px-4 py-6 h-[calc(100vh)] sticky top-0 bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* 1. Search Bar */}
      <div className="relative group sticky top-0 z-20">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <Input
          type="text"
          placeholder="Buscar no ecossistema..."
          className="w-full bg-white/50 backdrop-blur-xl border-white/60 text-slate-800 placeholder:text-slate-400 rounded-2xl pl-11 pr-4 py-6 focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 transition-all shadow-lg shadow-slate-200/40"
        />
      </div>

      {/* 2. IRIS - Real Trends */}
      <div className="rounded-3xl bg-white/50 backdrop-blur-xl border border-white/60 p-5 shadow-xl shadow-slate-200/40 relative overflow-hidden transition-all hover:bg-white/70">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">IRIS Trends</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mapeamento em Rede</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 shadow-sm">
               <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${loadingTrends ? 'animate-pulse' : ''}`} />
               <span className="text-[10px] text-emerald-600 font-bold">{loadingTrends ? 'BUSCANDO' : 'LIVE'}</span>
             </div>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          {loadingTrends ? (
            <p className="text-xs text-center text-slate-400 py-4 font-medium">Sincronizando com o TAS...</p>
          ) : (
            trends.map((trend, i) => (
              <div key={i} className="group cursor-pointer p-3.5 rounded-2xl bg-white/40 hover:bg-indigo-50/60 transition-all border border-transparent hover:border-indigo-100 hover:shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{trend.cat}</span>
                  {trend.hot && <span className="text-[9px] font-black tracking-wider bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded shadow-sm">HOT</span>}
                </div>
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-0.5">
                  <span className="text-indigo-400 font-black">#</span>{trend.tag}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{trend.vol}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. HEIMDALL - Guardião Simplificado */}
      <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 px-4 py-3 shadow-lg shadow-slate-200/40 flex items-center justify-between hover:bg-white/70 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-slate-800">Heimdall</h2>
            <p className="text-[9px] text-slate-500 font-medium">Ecossistema Seguro</p>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold text-emerald-600 bg-white px-2 py-1 rounded border border-emerald-100 shadow-sm">
          CRIPTO: ATIVA
        </span>
      </div>

      {/* 4. Evolution Gauge (Fim da rolagem) */}
      <EvolutionGauge level={userEvolutionLevel} />
      
    </aside>
  );
}