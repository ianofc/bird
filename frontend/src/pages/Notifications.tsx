import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { 
  Heart, MessageCircle, UserPlus, Radio, CheckCheck, 
  MoreHorizontal, Sparkles, ShieldCheck, Loader2, Bell 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { heimdallService } from '@/services/api';
import { toast } from 'sonner';

interface ParsedNotification {
  id: number;
  username: string;
  action: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'system';
  time: string;
  isRead: boolean;
  originalData: any;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<ParsedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'todas' | 'alertas'>('todas');

  // ==========================================
  // BUSCA E PARSER DE NOTIFICAÇÕES REAIS
  // ==========================================
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await heimdallService.getNotifications();
        
        // O Parser: Transforma o texto do Django num formato rico para a UI
        const parsedData = data.map((n: any): ParsedNotification => {
          // Tenta extrair "@usuario ação..."
          const match = n.text.match(/^@([\w._]+)\s(.*)/);
          
          let username = 'Sistema Lyv';
          let action = n.text;
          let type: ParsedNotification['type'] = 'system';

          if (match) {
            username = match[1];
            action = match[2];
            if (action.includes('curtiu')) type = 'like';
            else if (action.includes('comentou')) type = 'comment';
            else if (action.includes('seguir')) type = 'follow';
            else if (action.includes('mensagem')) type = 'message';
          } else {
            if (n.text.includes('Heimdall') || n.text.includes('Gaia')) type = 'system';
          }

          return {
            id: n.id,
            username: username,
            action: action,
            type: type,
            time: formatTimeAgo(n.createdAt),
            isRead: n.is_read,
            originalData: n
          };
        });

        setNotifications(parsedData);
      } catch (error) {
        toast.error("O Heimdall está offline. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await heimdallService.markAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("Alertas limpos no Heimdall.");
    } catch (error) {
      toast.error("Erro ao marcar como lidas.");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const hours = Math.abs(new Date().getTime() - new Date(dateString).getTime()) / 3600000;
    if (hours < 1) return 'Agora mesmo';
    if (hours < 24) return `Há ${Math.floor(hours)}h`;
    return `Há ${Math.floor(hours / 24)}d`;
  };

  // ==========================================
  // RENDERIZADORES DE UI RICA
  // ==========================================
  const getIcon = (type: string) => {
    switch(type) {
      case 'like': return <div className="p-2 bg-rose-500/20 text-rose-500 rounded-full"><Heart className="w-4 h-4 fill-current" /></div>;
      case 'comment': return <div className="p-2 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full"><MessageCircle className="w-4 h-4 fill-current" /></div>;
      case 'follow': return <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full"><UserPlus className="w-4 h-4" /></div>;
      case 'message': return <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full"><Radio className="w-4 h-4" /></div>;
      case 'system': return <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-full"><ShieldCheck className="w-4 h-4" /></div>;
      default: return <div className="p-2 bg-slate-500/20 text-slate-600 rounded-full"><Bell className="w-4 h-4" /></div>;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filtro de abas
  const displayedNotifications = activeTab === 'todas' 
    ? notifications 
    : notifications.filter(n => n.type === 'system' || !n.isRead);

  return (
    <LyvLayout>
      <div className="w-full max-w-[650px] mx-auto min-h-screen pt-4 md:pt-8 pb-24 px-4 md:px-0 bg-transparent">
        
        {/* HEADER HEIMDALL */}
        <div className="flex items-center justify-between mb-6 bg-white/60 dark:bg-[#1E293B]/60 p-6 rounded-[2rem] backdrop-blur-xl border border-white/50 dark:border-white/5 shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 flex items-center gap-3 drop-shadow-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-500" /> Heimdall
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Sua central de interações</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAsRead} variant="ghost" className="text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl px-4 py-5 h-auto transition-all active:scale-95 border border-emerald-100 dark:border-emerald-800">
              <CheckCheck className="w-4 h-4 mr-2" /> Marcar Lidas
            </Button>
          )}
        </div>

        {/* ABAS GLASSMORPHISM */}
        <div className="flex p-1.5 mb-6 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('todas')}
            className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-all z-10 ${activeTab === 'todas' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {activeTab === 'todas' && <motion.div layoutId="notifTab" className="absolute inset-0 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
            Todas as Atividades
          </button>
          <button
            onClick={() => setActiveTab('alertas')}
            className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-all z-10 ${activeTab === 'alertas' ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {activeTab === 'alertas' && <motion.div layoutId="notifTab" className="absolute inset-0 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
            Não Lidas & Sistema
          </button>
        </div>

        {/* LISTA DE NOTIFICAÇÕES */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
               <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
            ) : displayedNotifications.length === 0 ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-10 bg-white/40 dark:bg-[#1E293B]/40 rounded-[2rem] border border-white/50 dark:border-white/5">
                 <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                 <p className="text-slate-500 font-medium">Seu radar está limpo.</p>
               </motion.div>
            ) : displayedNotifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-[1.5rem] flex gap-4 items-start transition-all cursor-pointer border ${
                  notif.isRead 
                    ? 'bg-white/40 dark:bg-[#1E293B]/30 border-transparent hover:bg-white/60 dark:hover:bg-[#1E293B]/50' 
                    : 'bg-white/80 dark:bg-[#1E293B]/80 border-emerald-200 dark:border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.05)]'
                } backdrop-blur-xl`}
              >
                {getIcon(notif.type)}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-7 h-7 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                      {/* Como não temos as fotos dos usuários salvos na string da notificação, colocamos a inicial ou ícone do sistema */}
                      {notif.type === 'system' ? <ShieldCheck className="w-4 h-4 m-auto text-emerald-500" /> : <AvatarFallback className="text-[10px] font-bold">{notif.username.substring(0,2).toUpperCase()}</AvatarFallback>}
                    </Avatar>
                    <span className="font-bold text-slate-900 dark:text-white text-[15px] flex items-center gap-1">
                      {notif.username === 'Sistema Lyv' ? 'Heimdall' : notif.username}
                      {notif.type === 'system' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    </span>
                  </div>
                  <p className="text-[14px] text-slate-600 dark:text-slate-300 mb-1.5 leading-snug">
                    {notif.action}
                  </p>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{notif.time}</span>
                </div>

                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 mt-3 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </LyvLayout>
  );
}