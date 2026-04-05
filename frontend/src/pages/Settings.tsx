import React, { useState } from 'react';
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { UserAvatar } from "@/components/lyv/UserAvatar";
import { useLyv } from "@/contexts/LyvContext";
import { Switch } from "@/components/ui/switch";
import { 
  User, Bell, Lock, ShieldCheck, Globe, Palette, 
  HelpCircle, ChevronRight, Moon, Wallet, HardDrive, 
  LogOut, Smartphone
} from 'lucide-react';
import { toast } from "sonner";

export default function Settings() {
  const { currentUser, logout } = useLyv();
  
  // Estados para os Toggles rápidos
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Aqui você integrará com o next-themes futuramente
    toast.success(`Modo ${!isDarkMode ? 'Escuro' : 'Claro'} ativado.`);
  };

  return (
    <LyvLayout>
      {/* bg-transparent para a Aurora Global brilhar através do Glassmorphism */}
      <div className="w-full max-w-[800px] mx-auto min-h-screen pt-4 md:pt-8 pb-24 px-4 md:px-0 bg-transparent">
        
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 mb-6 drop-shadow-sm px-2 md:px-0">
          Ajustes
        </h1>

        <div className="space-y-6">
          
          {/* 1. CARD DO PERFIL (Estilo Telegram/iOS) */}
          <div className="bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 flex items-center justify-between shadow-lg transition-colors cursor-pointer hover:bg-white/70 dark:hover:bg-[#1E293B]/60">
            <div className="flex items-center gap-4">
              <UserAvatar 
                user={currentUser} 
                className="w-16 h-16 border-2 border-white dark:border-slate-800 shadow-md" 
                showBadge={true} 
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser?.name || "Ian Santos"}
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {currentUser?.handle || "@iansantos"}
                </p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 font-semibold">
                  +55 75 99999-9999
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </div>

          {/* 2. CONFIGURAÇÕES PREMIUM / CARTEIRA */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 backdrop-blur-xl border border-amber-500/20 rounded-[2rem] overflow-hidden shadow-sm">
            <button className="w-full flex items-center justify-between p-5 transition-colors hover:bg-amber-500/10">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-500">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-amber-900 dark:text-amber-400">Lyv Wallet & Pentaia</h3>
                  <p className="text-sm text-amber-700/70 dark:text-amber-400/70">Saldo, Presentes (Lives) e Monetização</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-500/50" />
            </button>
          </div>

          {/* 3. BLOCO: GERAL (Com Switches Rápidos) */}
          <div className="bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-lg">
            <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/10">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Configurações Gerais</h2>
            </div>
            
            <div className="flex flex-col">
              {/* Toggle: Modo Escuro */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-900/5 dark:bg-white/10 rounded-xl text-slate-700 dark:text-slate-300">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Modo Escuro</h3>
                    <p className="text-xs text-slate-500">Tema noturno da interface</p>
                  </div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={handleToggleTheme} />
              </div>

              {/* Toggle: Notificações */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Notificações do Gaia</h3>
                    <p className="text-xs text-slate-500">Alertas de mensagens e lives</p>
                  </div>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>

              {/* Botão Padrão: Idioma */}
              <button className="flex items-center justify-between p-5 transition-colors hover:bg-white/40 dark:hover:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-white">Idioma</h3>
                    <p className="text-xs text-slate-500">Português (Brasil)</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* 4. BLOCO: DADOS E SEGURANÇA */}
          <div className="bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-lg">
            <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/10">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Dados e Privacidade</h2>
            </div>
            
            <div className="flex flex-col">
              <button className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 transition-colors hover:bg-white/40 dark:hover:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-white">Privacidade</h3>
                    <p className="text-xs text-slate-500">Quem pode ver seu perfil e status</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <button className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 transition-colors hover:bg-white/40 dark:hover:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-500/10 rounded-xl text-slate-600 dark:text-slate-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-white">Dispositivos</h3>
                    <p className="text-xs text-slate-500">Gerenciar sessões ativas (1 ativo)</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Economia de Dados</h3>
                    <p className="text-xs text-slate-500">Reduzir qualidade de vídeos no Feed</p>
                  </div>
                </div>
                <Switch checked={dataSaver} onCheckedChange={setDataSaver} />
              </div>
            </div>
          </div>

          {/* 5. SUPORTE E LOGOUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[1.5rem] p-5 flex items-center gap-4 cursor-pointer hover:bg-white/80 dark:hover:bg-[#1E293B]/60 transition-colors shadow-sm">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900 dark:text-white">Central de Ajuda</h3>
                <p className="text-xs text-slate-500">Perguntas e suporte Lyv</p>
              </div>
            </button>

            <button 
              onClick={logout}
              className="bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 backdrop-blur-xl rounded-[1.5rem] p-5 flex items-center gap-4 cursor-pointer hover:bg-rose-500/20 transition-colors shadow-sm"
            >
              <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-rose-700 dark:text-rose-400">Encerrar Sessão</h3>
                <p className="text-xs text-rose-600/70 dark:text-rose-400/70">Desconectar deste dispositivo</p>
              </div>
            </button>
          </div>

        </div>
      </div>
    </LyvLayout>
  );
}