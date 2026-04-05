import { LyvLayout } from "@/components/lyv/LyvLayout";
import { useLyv } from "@/contexts/LyvContext";
import { Terminal, ShieldAlert, Power, Activity, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThalamusAdmin() {
  const { currentUser, isSystemActive, triggerKillSwitch, logs } = useLyv();

  if (currentUser?.role !== "SUPERUSER") return null;

  return (
    <LyvLayout>
      <div className="max-w-[1100px] mx-auto pt-6 space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                <ShieldAlert className="text-indigo-600 w-10 h-10" /> Thalamus Control Center
            </h1>
            
            {/* BOTÃO KILL SWITCH - O Botão Vermelho */}
            <button 
                onClick={triggerKillSwitch}
                disabled={!isSystemActive}
                className={cn(
                    "px-8 h-14 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl",
                    isSystemActive 
                        ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
            >
                <Power size={24} /> {isSystemActive ? "Kill Switch" : "System Offline"}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-indigo-500 font-bold uppercase text-xs">
                    <Activity size={16} /> Selenium Nodes
                </div>
                <p className="text-4xl font-black text-gray-900">{isSystemActive ? "04 Active" : "00 Stopped"}</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-purple-500 font-bold uppercase text-xs">
                    <Cpu size={16} /> Celery Workers
                </div>
                <p className="text-4xl font-black text-gray-900">{isSystemActive ? "08 Online" : "00 Idle"}</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-green-500 font-bold uppercase text-xs">
                    <ShieldAlert size={16} /> System Health
                </div>
                <p className="text-4xl font-black text-gray-900">{isSystemActive ? "98%" : "OFF"}</p>
            </div>
        </div>

        {/* Live Terminal */}
        <div className="bg-gray-900 rounded-[3rem] p-10 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30"></div>
            <div className="flex items-center gap-3 mb-6">
                <Terminal className="text-indigo-400" size={20} />
                <span className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">ZIOS Real-Time Logs</span>
            </div>
            <div className="font-mono text-sm space-y-3 h-[350px] overflow-y-auto scrollbar-hide">
                {logs.map((log: string, i: number) => (
                    <div key={i} className={cn(
                        "flex gap-4",
                        log.includes("CRITICAL") ? "text-red-400" : "text-green-400/80"
                    )}>
                        <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                        <span className="font-bold">{log}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </LyvLayout>
  );
}