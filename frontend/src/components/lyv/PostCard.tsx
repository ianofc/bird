import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, MessageCircle, Repeat, Bookmark, Share2, 
  MoreHorizontal, Sparkles, ChevronLeft, ChevronRight, Video,
  ImageOff
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
}

export interface Post {
  id: string | number;
  content: string;
  author: {
    name: string;
    handle: string;
    avatar?: string;
    isPremium?: boolean;
  };
  media?: Media[];
  layoutPreference?: 'single' | 'grid' | 'carousel'; 
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked?: boolean;
  saved?: boolean;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.liked || false);
  const [isSaved, setIsSaved] = useState(post.saved || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.85;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Sistema de Fallback para imagens quebradas (Evita o erro da "Imagem 2")
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/800x800/1E293B/cyan?text=Momento+Indispon%C3%ADvel';
    e.currentTarget.onerror = null; // Previne loop infinito
  };

  const renderMediaItem = (item: Media, className: string = "", isGrid: boolean = false) => {
    if (item.type === 'video') {
      return (
        <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
          <video 
            src={item.url} 
            className={`w-full h-full object-cover ${className}`}
            controls={!isGrid}
            autoPlay={isGrid}
            muted={isGrid}
            loop={isGrid}
            playsInline
            onError={(e) => {
              // Se o vídeo falhar, exibe ícone de erro
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
            }}
          />
          {isGrid && (
            <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full text-white shadow-lg">
              <Video className="w-4 h-4" />
            </div>
          )}
        </div>
      );
    }
    return (
      <img 
        src={item.url} 
        alt="Momento" 
        className={`w-full h-full object-cover bg-slate-100 dark:bg-slate-800 ${className}`} 
        onError={handleImageError}
      />
    );
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    const layout = post.layoutPreference || 'grid';
    const mediaCount = post.media.length;

    // 1. SINGLE
    if (mediaCount === 1 || layout === 'single') {
      return (
        <div className="relative w-full mt-3 overflow-hidden rounded-[1.5rem] shadow-sm max-h-[500px]">
          {renderMediaItem(post.media[0], "transition-transform duration-700 hover:scale-105")}
        </div>
      );
    }

    // 2. CAROUSEL
    if (layout === 'carousel') {
      return (
        <div className="relative w-full mt-3 group">
          <button 
            onClick={() => scrollCarousel('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/30 dark:bg-black/40 backdrop-blur-md text-slate-800 dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-white/50 dark:hover:bg-black/60"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div 
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-2 pb-2"
          >
            {post.media.map((item, idx) => (
              <div key={item.id} className="relative shrink-0 w-[85%] h-[350px] md:h-[400px] snap-center rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                {renderMediaItem(item)}
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {idx + 1} / {mediaCount}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => scrollCarousel('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/30 dark:bg-black/40 backdrop-blur-md text-slate-800 dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/50 dark:hover:bg-black/60"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      );
    }

    // 3. GRID (Mosaico)
    return (
      <div className={`mt-3 grid gap-2 ${mediaCount === 2 ? 'grid-cols-2 h-[250px]' : 'grid-cols-2 grid-rows-2 h-[350px]'} rounded-[1.5rem] overflow-hidden border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800`}>
        {post.media.slice(0, 4).map((item, idx) => {
          const isFirstOfThree = mediaCount === 3 && idx === 0;
          return (
            <div 
              key={item.id} 
              className={`relative overflow-hidden group/item ${isFirstOfThree ? 'col-span-2 row-span-1' : ''}`}
            >
              {renderMediaItem(item, "transition-transform duration-500 group-hover/item:scale-110", true)}
              
              {idx === 3 && mediaCount > 4 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold cursor-pointer hover:bg-black/70 transition-colors">
                  +{mediaCount - 4}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 mb-6 transition-colors border shadow-sm bg-white/70 dark:bg-[#1E293B]/60 backdrop-blur-xl rounded-[2rem] border-white/60 dark:border-white/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer">
          <Avatar className="w-12 h-12 border-2 border-white shadow-md dark:border-slate-800">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className="font-bold text-cyan-700 bg-cyan-100">{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white hover:underline">{post.author.name}</h4>
              {post.author.isPremium && (
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="hover:text-cyan-600 transition-colors">{post.author.handle}</span>
              <span>•</span>
              <span className="hover:underline">{post.createdAt}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      <div className="mt-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 break-words">
        {post.content.split(/(#\w+)/g).map((word, idx) => 
          word.startsWith('#') 
            ? <span key={idx} className="font-medium text-cyan-600 dark:text-cyan-400 cursor-pointer hover:underline">{word}</span>
            : <span key={idx}>{word}</span>
        )}
      </div>

      {renderMedia()}

      <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-200/50 dark:border-white/10">
        <div className="flex items-center gap-6">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isLiked ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments}</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <Repeat className="w-5 h-5" />
            <span>{post.shares}</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-full h-9 w-9">
            <Share2 className="w-5 h-5" />
          </Button>
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center justify-center h-9 w-9 rounded-full transition-colors ${isSaved ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-indigo-500'}`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}