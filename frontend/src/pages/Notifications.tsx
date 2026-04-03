import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirdLayout } from "@/components/bird/BirdLayout";
import { Heart, MessageCircle, UserPlus, Radio, CheckCheck, MoreHorizontal, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'live' | 'system';
  user: { name: string; avatar: string; isPremium?: boolean };
  content: string;
  time: string;
  isRead: boolean;
  postImage?: string;
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<'todas' | 'mencoes'>('todas');

  const notifications: Notification[] = [
    {
      id: '1', type: 'live',
      user: { name: 'Lívia', avatar: 'https://i.pravatar.cc/150?u=livia' },
      content: 'iniciou uma Batalha PK ao vivo agora. Entre para apoiar!',
      time: 'Agora mesmo', isRead: false
    },
    {
      id: '2', type: 'like',
      user: { name: 'Marcos Dev', avatar: 'https://i.pravatar.cc/150?u=marcos' },
      content: 'curtiu o seu Momento.',
      time: 'Há 5m', isRead: false,
      postImage: 'https://images.unsplash.com/photo-1618477388954-7852f32655c7?w=100&h=100&fit=crop'
    },
    {
      id: '3', type: 'comment',
      user: { name: 'Ana Silva', avatar: 'https://i.pravatar.cc/150?u=ana' },
      content: 'comentou: "A interface Aurora ficou incrível demais! 🚀"',
      time: 'Há 2h', isRead: true
    },
    {
      id: '4', type: 'follow',
      user: { name: 'Cyber Gamer', avatar: 'https://i.pravatar.cc/150?u=cyber', isPremium: true },
      content: 'começou a seguir você.',
      time: 'Há 4h', isRead: true
    },
    {
      id: '5', type: 'system',
      user: { name: 'Sistema Bird', avatar: 'https://github.com/shadcn.png' },
      content: 'Sua conta atingiu o nível Ouro no Gaia! Novas funções liberadas.',
      time: 'Ontem', isRead: true
    }
  ];

  const getIcon = (type: string) => {
    switch(type) {
      case 'like': return <div className="p-2 bg-rose-500/20 text-rose-500 rounded-full"><Heart className="w-4 h-4 fill-current" /></div>;
      case 'comment': return <div className="p-2 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full"><MessageCircle className="w-4 h-4 fill-current" /></div>;
      case 'follow': return <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full"><UserPlus className="w-4 h-4" /></div>;
      case 'live': return <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full animate-pulse"><Radio className="w-4 h-4" /></div>;
      case 'system': return <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-full"><Sparkles className="w-4 h-4" /></div>;
      default: return null;
    }
  };

  return (
    <BirdLayout>
      <div className="w-full max-w-[650px] mx-auto min-h-screen pt-4 md:pt-8 pb-24 px-4 md:px-0 bg-transparent">
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 drop-shadow-sm">
            Notificações
          </h1>
          <Button variant="ghost" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-full">
            <CheckCheck className="w-4 h-4 mr-2" /> Marcar lidas
          </Button>
        </div>

        {/* Abas Glassmorphism */}
        <div className="flex p-1.5 mb-6 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('todas')}
            className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-all z-10 ${activeTab === 'todas' ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {activeTab === 'todas' && <motion.div layoutId="notifTab" className="absolute inset-0 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
            Todas
          </button>
          <button
            onClick={() => setActiveTab('mencoes')}
            className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-all z-10 ${activeTab === 'mencoes' ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {activeTab === 'mencoes' && <motion.div layoutId="notifTab" className="absolute inset-0 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
            Menções
          </button>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-[1.5rem] flex gap-4 items-start transition-all cursor-pointer border ${
                  notif.isRead 
                    ? 'bg-white/40 dark:bg-[#1E293B]/20 border-transparent hover:bg-white/60 dark:hover:bg-[#1E293B]/40' 
                    : 'bg-white/80 dark:bg-[#1E293B]/60 border-cyan-200 dark:border-cyan-500/30 shadow-md'
                } backdrop-blur-xl`}
              >
                {getIcon(notif.type)}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-8 h-8 border border-white/50">
                      <AvatarImage src={notif.user.avatar} />
                      <AvatarFallback>{notif.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1">
                      {notif.user.name}
                      {notif.user.isPremium && <Sparkles className="w-3 h-3 text-amber-500" />}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 leading-snug">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{notif.user.name}</span> {notif.content}
                  </p>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{notif.time}</span>
                </div>

                {notif.postImage && (
                  <img src={notif.postImage} alt="Post" className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                )}
                {!notif.postImage && (
                  <Button variant="ghost" size="icon" className="text-slate-400 -mr-2"><MoreHorizontal className="w-4 h-4" /></Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </BirdLayout>
  );
}