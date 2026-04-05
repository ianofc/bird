import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { PostCard, Post } from "@/components/lyv/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Heart, MoreHorizontal, Smile } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Simulando a busca do Post no Banco de Dados
  const mockPost: Post = {
    id: id || "1",
    content: "O ecossistema Lyv rodando liso na nova atualização. O Glassmorphism direto na Aurora muda tudo! 🌌 A arquitetura que estamos montando aqui vai servir de base para o futuro. #LyvOS #Aurora",
    author: { name: "Ian Santos", handle: "@iansantos", avatar: "https://i.pravatar.cc/150?u=ian", isPremium: true },
    layoutPreference: 'grid',
    media: [
      { id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&fit=crop' },
      { id: 'm2', type: 'image', url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&fit=crop' }
    ],
    likes: 342, comments: 12, shares: 8, createdAt: "Há 2 horas", liked: true
  };

  const mockComments = [
    { id: 'c1', user: 'Lívia', handle: '@livia_art', avatar: 'https://i.pravatar.cc/150?u=livia', text: 'Ficou absolutamente impecável! Ansiosa para testar o Gaia completo.', time: '1h', likes: 15 },
    { id: 'c2', user: 'Marcos Dev', handle: '@marcos', avatar: 'https://i.pravatar.cc/150?u=marcos', text: 'Cara, a transição entre o feed e o canal de live está surreal de fluida.', time: '45m', likes: 8 },
    { id: 'c3', user: 'Ana Silva', handle: '@ana', avatar: 'https://i.pravatar.cc/150?u=ana', text: 'Qual biblioteca você usou para as animações? Framer Motion?', time: '10m', likes: 2 },
  ];

  useEffect(() => {
    // Simula tempo de rede
    setTimeout(() => setIsLoading(false), 500);
  }, [id]);

  if (isLoading) {
    return (
      <LyvLayout>
        <div className="w-full max-w-[650px] mx-auto min-h-screen pt-10 flex justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </LyvLayout>
    );
  }

  return (
    <LyvLayout>
      <div className="w-full max-w-[650px] mx-auto min-h-screen pt-2 pb-24 px-0 md:px-0 bg-transparent">
        
        {/* Header Pegajoso (Sticky) */}
        <div className="sticky top-0 z-40 px-4 py-3 bg-white/70 dark:bg-[#0B1120]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Momento</h2>
        </div>

        {/* O Post Principal */}
        <div className="px-2 md:px-0">
          <PostCard post={mockPost} />
        </div>

        {/* Linha Divisória Elegante */}
        <div className="flex items-center gap-4 my-6 px-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Comentários</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
        </div>

        {/* Área de Comentários */}
        <div className="px-4 space-y-5">
          {mockComments.map((comment, idx) => (
            <motion.div 
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-3"
            >
              <Avatar className="w-10 h-10 mt-1 shadow-sm">
                <AvatarImage src={comment.avatar} />
                <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-md border border-slate-200/50 dark:border-white/5 rounded-2xl rounded-tl-sm p-3.5 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{comment.user}</span>
                      <span className="text-xs text-slate-500">{comment.handle}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 -mr-2"><MoreHorizontal className="w-3 h-3" /></Button>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
                </div>
                <div className="flex items-center gap-4 mt-1.5 ml-2 text-xs font-semibold text-slate-500">
                  <span>{comment.time}</span>
                  <button className="hover:text-slate-800 dark:hover:text-white transition-colors">Responder</button>
                  <div className="flex items-center gap-1 cursor-pointer hover:text-rose-500 transition-colors group">
                    <Heart className="w-3.5 h-3.5 group-hover:fill-current" /> {comment.likes}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input de Comentário Fixo no Rodapé */}
        <div className="fixed bottom-[70px] md:bottom-0 left-0 w-full bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-2xl border-t border-slate-200/50 dark:border-white/10 p-3 z-40">
          <div className="max-w-[650px] mx-auto flex items-end gap-3">
            <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-800">
              <AvatarImage src="https://github.com/shadcn.png" />
            </Avatar>
            <div className="flex-1 bg-slate-100 dark:bg-[#1E293B] rounded-3xl flex items-center px-4 py-2 border border-transparent focus-within:border-cyan-500/50 transition-colors">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Adicione um comentário..." 
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-500"
              />
              <button className="text-slate-400 hover:text-cyan-500 transition-colors p-1.5"><Smile className="w-5 h-5" /></button>
            </div>
            <button 
              disabled={!commentText.trim()}
              className="w-10 h-10 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

      </div>
    </LyvLayout>
  );
}