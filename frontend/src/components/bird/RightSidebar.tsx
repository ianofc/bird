import { useBird } from "@/contexts/BirdContext";
import { TrendingUp, MoreHorizontal, Search, ShieldCheck, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export function RightSidebar() {
  const { trends } = useBird();
  const [scanStatus, setScanStatus] = useState("Idle");

  // Simulação do ciclo de vida do TAS (Selenium + Celery)
  useEffect(() => {
    const statuses = ["Mining Data...", "Parsing Trends...", "Optimizing ZIOS...", "TAS Active"];
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

      {/* TAS: TRENDING TOPICS & MONITORING */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 shadow-xl overflow-hidden relative group">
        
        {/* BARRA DE SCAN (FEEDBACK DO SELENIUM) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100/50">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-scan shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" /> TAS Trends
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{scanStatus}</span>
            </div>
          </div>
          <Activity className="w-4 h-4 text-gray-300" />
        </div>

        <div className="space-y-6">
          {trends.map((trend) => (
            <div key={trend.id} className="group/item cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">{trend.category}</p>
                  <p className="text-[15px] font-black text-gray-800 group-hover/item:text-indigo-600 transition-colors">#{trend.topic}</p>
                  <p className="text-xs font-medium text-gray-500 mt-1">{trend.volume}</p>
                </div>
                <button className="text-gray-300 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-8 py-3 text-xs font-black text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors border-2 border-dashed border-indigo-100 uppercase tracking-widest">
          Expandir Relatório TAS
        </button>
      </div>

      {/* SEGURANÇA THALAMUS */}
      <div className="bg-gray-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10">
            <ShieldCheck size={120} />
        </div>
        <div className="relative z-10">
            <h3 className="font-black text-lg mb-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" /> Thalamus Core
            </h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-4">Sessão Encriptada</p>
            <p className="text-xs text-gray-300 leading-relaxed">O Thalamus está a monitorizar a integridade dos agentes SARA, ZIOS e TAS.</p>
        </div>
      </div>
    </aside>
  );
}