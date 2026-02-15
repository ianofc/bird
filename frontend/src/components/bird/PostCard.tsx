import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

const ICONS = {
  like: "/icons3d/heart.png",
  comment: "/icons3d/comment.png",
  share: "/icons3d/megaphone.png",
  save: "/icons3d/save.png"
};

export function PostCard({ post }: { post: any }) {
  // Estado local para Like e Animação
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  // A Mágica do Instagram: Double Tap
  const handleDoubleTap = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount(likesCount + 1);
    }
    // Dispara a animação
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 800); // Remove após a animação
  };

  return (
    <article className="bg-white mb-8 overflow-hidden rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 transition-all duration-300 hover:shadow-2xl relative z-10 select-none">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-4">
            <Link to="/profile">
                <Avatar className="cursor-pointer h-10 w-10 ring-2 ring-offset-2 ring-indigo-50 hover:ring-indigo-300 transition-all">
                    <AvatarFallback className={cn(post.userColor || 'bg-gradient-to-br from-indigo-500 to-purple-600', "text-white font-bold text-xs")}>
                        {post.userInitials}
                    </AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex flex-col">
                <Link to="/profile" className="font-bold text-gray-800 text-[15px] hover:text-indigo-600 transition-colors">
                    {post.userName}
                </Link>
                {post.userHandle && <span className="text-xs text-gray-500 font-medium">{post.userHandle}</span>}
            </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-50 rounded-full h-8 w-8">
            <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* MÍDIA (Com Double Tap Zone) */}
      <div className="px-0 relative group">
          {post.imageUrl ? (
            <div 
                className="w-full relative cursor-pointer overflow-hidden bg-gray-50"
                onDoubleClick={handleDoubleTap} // GATILHO DE DOPAMINA
            >
                <img 
                    src={post.imageUrl} 
                    className="w-full h-auto object-cover max-h-[650px] min-h-[300px]" 
                    alt="Post content" 
                />
                
                {/* Overlay do Coração Explosivo */}
                {showHeartOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <img 
                            src={ICONS.like} 
                            className="w-24 h-24 animate-heart-burst drop-shadow-2xl"
                        />
                    </div>
                )}
            </div>
          ) : (
            <div className="px-10 py-16 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center min-h-[220px] border-y border-gray-50" onDoubleClick={handleDoubleTap}>
                <p className="text-xl font-semibold text-gray-800 leading-relaxed text-center font-serif italic relative z-10">
                    "{post.content}"
                </p>
                 {showHeartOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <img src={ICONS.like} className="w-24 h-24 animate-heart-burst drop-shadow-2xl opacity-80" />
                    </div>
                )}
            </div>
          )}
      </div>

      {/* AÇÕES */}
      <div className="px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-6">
            
            {/* LIKE BUTTON (Reflete o estado do Double Tap) */}
            <button 
                onClick={toggleLike}
                className="group flex items-center gap-2 focus:outline-none transition-transform active:scale-90"
            >
                <img 
                    src={ICONS.like} 
                    alt="Like" 
                    className={cn(
                        "w-6 h-6 object-contain drop-shadow-sm transition-all group-hover:scale-110 group-hover:-translate-y-1",
                        liked ? "brightness-110 scale-110" : "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
                    )}
                />
                <span className={cn("text-sm font-bold", liked ? "text-red-500" : "text-gray-500 group-hover:text-red-500")}>
                    {likesCount}
                </span>
            </button>

            <button className="group flex items-center gap-2 focus:outline-none transition-transform active:scale-90">
                <img src={ICONS.comment} className="w-6 h-6 object-contain drop-shadow-sm transition-all group-hover:scale-110 group-hover:-translate-y-1 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" />
                <span className="text-sm font-bold text-gray-500 group-hover:text-indigo-600">
                    {post.comments}
                </span>
            </button>

            <button className="group focus:outline-none transition-transform active:scale-90" title="Amplificar">
                <img src={ICONS.share} className="w-6 h-6 object-contain drop-shadow-sm transition-all group-hover:scale-110 group-hover:-translate-y-1 -rotate-12 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" />
            </button>
         </div>

         <button className="group focus:outline-none transition-transform active:scale-90">
            <img src={ICONS.save} className="w-5 h-5 object-contain drop-shadow-sm transition-all group-hover:scale-110 group-hover:-translate-y-1 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" />
         </button>
      </div>

      {/* LEGENDA */}
      <div className="px-6 pb-6 pt-0">
         {post.imageUrl && (
             <div className="text-[15px] text-gray-700 leading-relaxed font-medium">
                <Link to="/profile" className="font-bold text-gray-900 mr-2 hover:underline cursor-pointer">
                    {post.userName}
                </Link>
                {post.content}
             </div>
         )}
         <p className="text-[10px] text-gray-400 font-bold uppercase mt-3 tracking-wider flex items-center gap-2">
            Há 2 horas
         </p>
      </div>
    </article>
  )
}