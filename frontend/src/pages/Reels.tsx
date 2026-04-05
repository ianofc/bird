import React, { useState, useEffect, useRef } from 'react';
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { Heart, MessageCircle, Share2, Bookmark, Music, Loader2, Sparkles, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from '@/services/api';
import { toast } from 'sonner';

interface ReelPost {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string | null;
    initials: string;
    isPremium?: boolean;
  };
  media: { url: string; type: string }[];
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
}

// Sub-componente para um Vídeo Individual (Controla o seu próprio Play/Pause)
const ReelItem = ({ post, isActive }: { post: ReelPost, isActive: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(post.saved);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => console.log("Autoplay bloqueado pelo navegador"));
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0; // Reseta o vídeo quando sai da tela
    }
  }, [isActive]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    try { await api.post(`/lyvs/${post.id}/like/`); } catch (err) { /* Reversão otimista se falhar */ }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    try { await api.post(`/lyvs/${post.id}/save/`); } catch (err) { }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    }
  };

  const videoUrl = post.media?.[0]?.url || "https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-neon-lit-room-4131-large.mp4";

  return (
    <div className="relative w-full h-full snap-start bg-black flex items-center justify-center overflow-hidden">
      {/* Vídeo */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        onClick={togglePlay}
      />
      
      {/* Gradiente de proteção para os textos */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

      {/* DADOS DO AUTOR (Bottom Left) */}
      <div className="absolute bottom-4 left-4 right-16 md:bottom-8 md:left-6 z-10">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
            <AvatarImage src={post.author.avatar || ''} />
            <AvatarFallback className="bg-gradient-to-tr from-cyan-500 to-purple-500 text-white font-bold">{post.author.initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base leading-none drop-shadow-md">{post.author.name}</h3>
              {post.author.isPremium && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              <button className="ml-2 text-xs font-bold bg-transparent border border-white/50 text-white px-2.5 py-0.5 rounded-full hover:bg-white hover:text-black transition-colors">
                Seguir
              </button>
            </div>
            <p className="text-xs text-white/80 font-medium drop-shadow-sm">{post.author.handle}</p>
          </div>
        </div>
        <p className="text-white text-sm md:text-base leading-snug drop-shadow-md line-clamp-2">
          {post.content || "Mais um momento incrível no Lyvifi 🚀"}
        </p>
        <div className="flex items-center gap-2 mt-3 text-white/90 text-xs font-medium bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
          <Music className="w-3.5 h-3.5" />
          <span>Som original - {post.author.name}</span>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO (Right Side) */}
      <div className="absolute bottom-6 right-2 md:bottom-10 md:right-4 z-10 flex flex-col items-center gap-5">
        <button onClick={handleLike} className="group flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90">
            <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{likesCount}</span>
        </button>

        <button className="group flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90">
            <MessageCircle className="w-6 h-6 text-white fill-white/20" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{post.comments}</span>
        </button>

        <button onClick={handleSave} className="group flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90">
            <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{isSaved ? 'Salvo' : 'Salvar'}</span>
        </button>

        <button className="group flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
        </button>

        <div className="mt-4 w-10 h-10 rounded-full border-2 border-slate-500 overflow-hidden animate-[spin_6s_linear_infinite]">
           <img src={post.author.avatar || 'https://github.com/shadcn.png'} className="w-full h-full object-cover" alt="Música" />
        </div>
      </div>
    </div>
  );
};

export default function Reels() {
  const [reels, setReels] = useState<ReelPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Busca os vídeos do backend
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/feed/'); // Reutilizamos o endpoint do feed
        // Filtra apenas as postagens que são do tipo 'video'
        const videoPosts = response.data.results.filter((p: any) => p.post_type === 'video');
        
        if (videoPosts.length > 0) {
          setReels(videoPosts);
        } else {
          // Fallback interativo caso o banco ainda não tenha vídeos reais
          setReels([
            {
              id: 'demo-1', content: "Testando a fluidez incrível do Lyv Reels! 🌊 #LyvOS",
              author: { id: 'sys1', name: "Lívia", handle: "@livia", initials: "LI", isPremium: true, avatar: "https://i.pravatar.cc/150?u=livia" },
              media: [{ url: "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4", type: "video" }],
              likes: 14500, comments: 342, liked: true, saved: false
            },
            {
              id: 'demo-2', content: "Setup noturno finalizado. ZIOS integrado. 💻✨",
              author: { id: 'sys2', name: "Ian Santos", handle: "@iansantos", initials: "IS", isPremium: true, avatar: "https://i.pravatar.cc/150?u=ian" },
              media: [{ url: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4", type: "video" }],
              likes: 8900, comments: 120, liked: false, saved: true
            }
          ]);
        }
      } catch (error) {
        toast.error("Erro ao carregar os Reels.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReels();
  }, []);

  // Intersection Observer para o Auto-Play dinâmico via Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.6 } // Aciona quando 60% do vídeo está na tela
    );

    const elements = document.querySelectorAll('.reel-container');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [reels]);

  return (
    <LyvLayout>
      {/* O container tem a classe "snap-y snap-mandatory" que cria o efeito "travado" igual ao TikTok */}
      <div className="w-full max-w-[500px] mx-auto h-[100dvh] md:h-[calc(100vh-2rem)] md:mt-4 md:rounded-[2.5rem] bg-black overflow-hidden relative shadow-2xl">
        
        {/* Cabecalho Flutuante */}
        <div className="absolute top-4 md:top-8 left-0 right-0 z-20 flex justify-center gap-6 text-white/80 font-bold text-sm md:text-base drop-shadow-md">
          <span className="cursor-pointer hover:text-white transition-colors">Seguindo</span>
          <div className="w-px h-4 bg-white/30 my-auto" />
          <span className="text-white border-b-2 border-white pb-1 cursor-pointer">Para Você</span>
        </div>

        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
            <p className="text-slate-400 font-bold">Carregando Reels...</p>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
            {reels.map((post, index) => (
              <div key={post.id} data-index={index} className="reel-container w-full h-full snap-start">
                <ReelItem post={post} isActive={index === activeIndex} />
              </div>
            ))}
          </div>
        )}
      </div>
    </LyvLayout>
  );
}