import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { useBird } from '@/contexts/BirdContext';
import { 
  Home, Compass, MessageCircle, Sparkles, LayoutGrid, 
  X, Tv, Clapperboard, Store, Newspaper, Settings, User 
} from 'lucide-react';

export function BirdLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { currentUser } = useBird();
  
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);

  useEffect(() => {
    setIsRightSidebarOpen(false);
    setIsGridMenuOpen(false);
  }, [location.pathname]);

  const bottomNavItems = [
    { id: 'home', icon: Home, path: '/', exact: true },
    { id: 'explore', icon: Compass, path: '/explore' },
    { id: 'gaia', icon: MessageCircle, path: '/messages' },
  ];

  const gridMenuItems = [
    { label: 'Perfil', icon: User, path: '/profile', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Reels', icon: Clapperboard, path: '/reels', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Canais', icon: Tv, path: '/canais', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Loja', icon: Store, path: '/marketplace', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Mercúrio', icon: Newspaper, path: '/mercurio', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Ajustes', icon: Settings, path: '/settings', color: 'text-slate-500', bg: 'bg-slate-500/10' },
  ];

  const checkActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    document.body.style.overflow = (isRightSidebarOpen || isGridMenuOpen) ? 'hidden' : 'auto';
  }, [isRightSidebarOpen, isGridMenuOpen]);

  return (
    <div className="relative min-h-screen bg-[#FAF9FB] dark:bg-slate-900 transition-colors duration-300 selection:bg-cyan-500/30">
      
      <div className="flex justify-center max-w-[1500px] mx-auto w-full relative">
        <aside className="hidden md:flex w-24 lg:w-[280px] flex-col sticky top-0 h-screen overflow-y-auto scrollbar-hide pt-6 pb-6 pl-4 pr-2 z-40">
          <LeftSidebar />
        </aside>

        <main className="flex-1 w-full max-w-full md:max-w-[600px] lg:max-w-[700px] min-h-screen pb-28 md:pb-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <aside className="hidden lg:flex w-[320px] xl:w-[350px] flex-col sticky top-0 h-screen overflow-y-auto scrollbar-hide pt-6 pb-6 pr-4 pl-2 z-40">
          <RightSidebar />
        </aside>
      </div>

      {/* BOTTOM NAVIGATION (MOBILE) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-3xl p-2 flex items-center justify-around">
          
          {bottomNavItems.map((item) => {
            const isActive = checkActive(item.path, item.exact);
            return (
              <Link key={item.id} to={item.path} className="relative p-3 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95">
                {isActive && <motion.div layoutId="bottomNavBubble" className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-2xl -z-10" />}
                <item.icon className={`w-6 h-6 ${isActive ? 'text-cyan-600 dark:text-cyan-400 fill-cyan-500/20' : 'text-slate-500 dark:text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            );
          })}

          <button onClick={() => { setIsRightSidebarOpen(true); setIsGridMenuOpen(false); }} className={`relative p-3 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${isRightSidebarOpen ? 'text-purple-600 dark:text-purple-400 bg-purple-500/10' : 'text-slate-500 dark:text-slate-400'}`}>
             <Sparkles className="w-6 h-6" strokeWidth={isRightSidebarOpen ? 2.5 : 2} />
          </button>

          <button onClick={() => { setIsGridMenuOpen(true); setIsRightSidebarOpen(false); }} className={`relative p-3 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${isGridMenuOpen ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10' : 'text-slate-500 dark:text-slate-400'}`}>
             <LayoutGrid className="w-6 h-6" strokeWidth={isGridMenuOpen ? 2.5 : 2} />
          </button>

        </div>
      </div>

      {/* BOTTOM SHEETS */}
      <AnimatePresence>
        {isRightSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRightSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="md:hidden fixed bottom-0 left-0 right-0 h-[85vh] bg-[#FAF9FB] dark:bg-slate-900 rounded-t-[2.5rem] z-[70] shadow-2xl flex flex-col overflow-hidden border-t border-white/20 dark:border-white/10">
              <div className="p-4 pb-2 flex items-center justify-between bg-white/50 dark:bg-black/20 backdrop-blur-md z-10 sticky top-0 border-b border-slate-200/50 dark:border-white/5">
                <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> Radar Bird</h3>
                <button onClick={() => setIsRightSidebarOpen(false)} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 active:scale-95"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 pb-20 scrollbar-hide"><RightSidebar /></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGridMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGridMenuOpen(false)} className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-2xl rounded-t-[2.5rem] z-[70] shadow-2xl flex flex-col overflow-hidden border-t border-white/50 dark:border-white/10 p-6 pb-12">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-6 opacity-50" />
              <div className="flex items-center gap-4 mb-8 bg-slate-100 dark:bg-black/20 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                <img src={currentUser?.avatar || 'https://github.com/shadcn.png'} alt="User" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white leading-tight">{currentUser?.name || 'Ian Santos'}</p>
                  <p className="text-xs text-slate-500">{currentUser?.handle || '@iansantos'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {gridMenuItems.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => setIsGridMenuOpen(false)} className="flex flex-col items-center justify-center gap-2 p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm active:scale-95 transition-transform">
                    <div className={`w-12 h-12 rounded-full ${item.bg} ${item.color} flex items-center justify-center mb-1`}><item.icon className="w-6 h-6" /></div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}