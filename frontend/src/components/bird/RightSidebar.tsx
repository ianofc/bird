// frontend/src/components/bird/RightSidebar.tsx
import React, { useState, useEffect } from "react";
import { 
  Search, ShieldCheck, Zap, Brain, Rocket, Activity, 
  Lock, RefreshCw, Eye, TrendingUp, Sparkles, Shield,
  ChevronRight, LockKeyhole, Flame, Hash, ArrowUpRight,
  Radio, Cpu, Globe
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// --- Evolution System com Cores Vivas ---
const EVOLUTION_STAGES = [
  { 
    id: 1, 
    label: 'Reativo', 
    icon: Eye, 
    gradient: 'from-blue-400/20 via-blue-500/10 to-cyan-400/5',
    accent: 'blue-400',
    border: 'blue-400/40',
    glow: 'bg-blue-400/20',
    text: 'text-blue-300'
  },
  { 
    id: 2, 
    label: 'Contextual', 
    icon: ShieldCheck, 
    gradient: 'from-cyan-400/20 via-cyan-500/10 to-teal-400/5',
    accent: 'cyan-400',
    border: 'cyan-400/40',
    glow: 'bg-cyan-400/20',
    text: 'text-cyan-300'
  },
  { 
    id: 3, 
    label: 'Proativo', 
    icon: Zap, 
    gradient: 'from-amber-400/20 via-orange-500/10 to-yellow-400/5',
    accent: 'amber-400',
    border: 'amber-400/40',
    glow: 'bg-amber-400/20',
    text: 'text-amber-300'
  },
  { 
    id: 4, 
    label: 'Inovador', 
    icon: Brain, 
    gradient: 'from-purple-400/20 via-violet-500/10 to-fuchsia-400/5',
    accent: 'purple-400',
    border: 'purple-400/40',
    glow: 'bg-purple-400/20',
    text: 'text-purple-300'
  },
  { 
    id: 5, 
    label: 'Simbiótico', 
    icon: Rocket, 
    gradient: 'from-emerald-400/20 via-green-500/10 to-teal-400/5',
    accent: 'emerald-400',
    border: 'emerald-400/40',
    glow: 'bg-emerald-400/20',
    text: 'text-emerald-300'
  },
] as const;

const EvolutionCard = ({ level }: { level: number }) => {
  const stage = EVOLUTION_STAGES[Math.min(level - 1, 4)];
  const Icon = stage.icon;
  const progress = (level / 5) * 100;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-xl">
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stage.gradient} opacity-80 animate-pulse`} />
      
      {/* Floating Orbs */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${stage.glow} rounded-full blur-3xl animate-pulse`} />
      <div className={`absolute -bottom-10 -left-10 w-24 h-24 ${stage.glow} rounded-full blur-2xl animate-pulse delay-700`} />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-white/40" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
              Neural Core
            </span>
          </div>
          <Badge 
            className={`${stage.glow} ${stage.text} border-${stage.border} border px-3 py-1 text-[11px] font-bold backdrop-blur-md shadow-lg`}
          >
            <Icon size={12} className="mr-1.5" />
            LVL 0{level}
          </Badge>
        </div>

        {/* Progress Bar com Brilho */}
        <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden mb-5 border border-white/5 relative">
          <div 
            className={`h-full bg-gradient-to-r from-${stage.accent} to-white rounded-full transition-all duration-1000 ease-out relative`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${stage.glow} border border-${stage.border} backdrop-blur-sm shadow-inner`}>
              <Icon size={20} className={stage.text} />
            </div>
            <div>
              <p className={`text-lg font-bold ${stage.text}`}>{stage.label}</p>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Phase Active</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-white/30 font-mono">{Math.round(progress)}%</span>
            <ChevronRight size={18} className="text-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Trend Item Estilo Feed ---
const TrendItem = ({ trend, index }: { trend: any; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isViral = trend.viral || index < 3;
  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-orange-400', 'text-white/60'];

  return (
    <div 
      className="group cursor-pointer py-4 px-4 -mx-4 rounded-2xl transition-all duration-500 hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        {/* Ranking Number */}
        <div className="flex flex-col items-center gap-2 pt-1 min-w-[28px]">
          <span className={`text-lg font-black ${rankColors[index] || 'text-white/30'} font-mono`}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className={`w-1 rounded-full transition-all duration-500 ${isHovered ? 'h-12 bg-indigo-400' : 'h-6 bg-white/10'}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Globe size={10} />
              {trend.category || "Global"}
            </span>
            {isViral && (
              <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-300 border border-rose-500/30 font-bold">
                <Flame size={9} className="animate-pulse" />
                VIRAL
              </span>
            )}
          </div>
          
          <h3 className="text-[15px] font-bold text-white truncate group-hover:text-indigo-300 transition-colors duration-300">
            {trend.hashtag?.startsWith('#') ? trend.hashtag : `#${trend.hashtag || 'Trend'}`}
          </h3>
          
          <p className="text-[12px] text-white/50 truncate mt-1.5 leading-relaxed group-hover:text-white/70 transition-colors">
            {trend.topic || "Tópico em ascensão global"}
          </p>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <span className="text-[10px] text-white/40 flex items-center gap-1.5 font-medium">
                <Activity size={11} className="text-emerald-400" />
                {trend.engagement || '2.4k'} pulsações
              </span>
              <span className="text-[10px] text-white/30">•</span>
              <span className="text-[10px] text-indigo-400/60 font-medium">Ver análise</span>
            </div>
            <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              <ArrowUpRight size={16} className="text-indigo-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Security Card Vibrante ---
const SecurityCard = () => (
  <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/40 to-emerald-900/20 backdrop-blur-xl">
    {/* Glow Effects */}
    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl animate-pulse delay-1000" />
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
    
    <div className="relative p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
              <Shield size={22} className="text-emerald-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse shadow-lg shadow-emerald-400/50" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">HeimFrost</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400/90 uppercase tracking-wider">
                Guard Ativo
              </span>
            </div>
          </div>
        </div>
        <LockKeyhole size={20} className="text-emerald-400/40" />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[11px] text-white/50 font-medium">Criptografia</span>
          <span className="text-[11px] font-bold text-emerald-400/80 font-mono">AES-256-GCM</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[11px] text-white/50 font-medium">Status</span>
          <span className="text-[11px] font-bold text-emerald-400/80 font-mono">ONLINE</span>
        </div>
      </div>
    </div>
  </div>
);

// --- Search Component Estilo Feed ---
const SearchBox = () => (
  <div className="relative group">
    <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
    <div className="relative flex items-center">
      <Search className="absolute left-5 w-5 h-5 text-white/30 group-focus-within:text-indigo-400 transition-colors duration-300" />
      <Input
        placeholder="Sondar pulso da rede..."
        className="h-14 w-full bg-slate-900/50 border-white/[0.08] text-white placeholder:text-white/30 rounded-2xl pl-14 pr-16 focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/30 transition-all backdrop-blur-xl text-[14px] font-medium"
      />
      <div className="absolute right-4 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] shadow-inner">
        <span className="text-[11px] text-white/40 font-mono font-bold">⌘K</span>
      </div>
    </div>
  </div>
);

// --- Header Card Component ---
const SectionHeader = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  action, 
  loading 
}: { 
  icon: any, 
  title: string, 
  subtitle: string, 
  action: () => void,
  loading: boolean
}) => (
  <div className="relative p-6 border-b border-white/[0.08] bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
    <div className="absolute top-0 right-0 w-64 h-full bg-indigo-500/5 blur-3xl" />
    <div className="relative flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative p-3 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 shadow-lg shadow-indigo-500/20">
          <Icon className="w-6 h-6 text-indigo-400" />
          <div className="absolute inset-0 bg-indigo-400/20 rounded-2xl animate-pulse" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            {title}
            <Sparkles className="w-3.5 h-3.5 text-indigo-400/60" />
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-lg shadow-indigo-400/50" />
            <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-wider">
              {subtitle}
            </span>
          </div>
        </div>
      </div>
      <button 
        onClick={action}
        className="p-3 rounded-xl hover:bg-white/10 transition-all active:scale-95 group bg-white/[0.05] border border-white/[0.08]"
      >
        <RefreshCw 
          size={18} 
          className={`text-white/40 group-hover:text-indigo-400 transition-all ${loading ? 'animate-spin' : ''}`} 
        />
      </button>
    </div>
  </div>
);

export function RightSidebar() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBundle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/service/mercurio/api/v1/mercurio/bundle');
      if (!res.ok) throw new Error("Offline");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.warn("MERCÚRIO indisponível. Modo standby.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBundle(); }, []);

  const trends = data?.trends || [];

  return (
    <aside className="hidden lg:flex w-[400px] flex-col h-screen top-0 bg-transparent overflow-hidden shrink-0">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 px-6 py-8 space-y-6">
        
        {/* Search */}
        <SearchBox />

        {/* Íris Trends Card - Estilo Feed */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.1] bg-gradient-to-b from-slate-900/50 via-slate-800/30 to-slate-900/50 backdrop-blur-2xl shadow-2xl shadow-black/20">
          {/* Background Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          
          {/* Header */}
          <SectionHeader 
            icon={Radio}
            title="Íris Trends"
            subtitle="SATTR Real-time"
            action={fetchBundle}
            loading={loading}
          />

          {/* Trends List */}
          <div className="relative p-5">
            {loading && !data ? (
              <div className="py-16 flex flex-col items-center justify-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
                  <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-purple-400/40 rounded-full animate-spin delay-150" />
                </div>
                <span className="text-[11px] font-bold text-white/30 uppercase tracking-[0.3em] animate-pulse">
                  Sincronizando Sensores
                </span>
              </div>
            ) : trends.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/[0.08]">
                  <Eye className="w-10 h-10 text-white/10" />
                </div>
                <p className="text-[13px] text-white/30 font-medium">Aguardando sinais do ecossistema...</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/[0.04]">
                {trends.slice(0, 5).map((trend: any, i: number) => (
                  <TrendItem key={trend.id || i} trend={trend} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <button className="w-full py-5 text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] border-t border-white/[0.08] hover:text-indigo-300 hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 group">
            <Hash size={14} className="opacity-50" />
            Explorar Universo Completo
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Security Card */}
        <SecurityCard />

        {/* Evolution Card */}
        <EvolutionCard level={data?.metadata?.evolution_level || 1} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Nodes</span>
            </div>
            <p className="text-2xl font-black text-white">5</p>
            <p className="text-[10px] text-white/30 mt-1">PentaIA Online</p>
          </div>
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Latência</span>
            </div>
            <p className="text-2xl font-black text-white">12<span className="text-lg text-white/50">ms</span></p>
            <p className="text-[10px] text-white/30 mt-1">Real-time Sync</p>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-8 pb-4 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-xl">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            </div>
            <p className="text-[10px] text-white/30 font-bold tracking-[0.3em] uppercase">
              PentaIA System
            </p>
          </div>
          <p className="text-[9px] text-white/20 mt-4 tracking-widest font-mono">v2.0.4-stable • build 8921</p>
        </div>

      </div>
    </aside>
  );
}