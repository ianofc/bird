import React from 'react';
import { BirdLayout } from "@/components/bird/BirdLayout";
import { Heart, MessageCircle, Share2, MoreVertical, Music } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Reels() {
  const reels = [
    { id: 1, author: "Ian Santos", video: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4", description: "A tranquilidade de codar ouvindo as ondas do mar. 🌊 #DevLife", likes: "12.4k", comments: "342" },
    { id: 2, author: "Lívia", video: "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4", description: "Brisa de outono 🍃", likes: "8.1k", comments: "105" },
  ];

  return (
    <BirdLayout>
      <div className="w-full h-screen bg-transparent pt-4 flex justify-center overflow-hidden">
        {/* Motor de Rolagem Vertical (Snap Mandatory) */}
        <div className="w-full max-w-[450px] h-[calc(100vh-80px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide rounded-[2.5rem]">
          {reels.map((reel) => (
            <div key={reel.id} className="relative w-full h-full snap-start bg-black flex items-center justify-center group border border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem] mb-4">
              
              <video src={reel.video} className="absolute inset-0 w-full h-full object-cover opacity-90" autoPlay loop muted playsInline />
              
              {/* Overlay Gradiente Escuro para Leitura */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Informações do Reel (Inferior Esquerda) */}
              <div className="absolute bottom-6 left-4 right-16 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-10 h-10 border border-white shadow-lg">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${reel.author}`} />
                    <AvatarFallback>{reel.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-white text-sm drop-shadow-md">{reel.author}</span>
                  <button className="border border-white/50 text-white px-3 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm">Seguir</button>
                </div>
                <p className="text-white text-sm drop-shadow-md line-clamp-2">{reel.description}</p>
                <div className="flex items-center gap-2 mt-3 bg-black/30 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  <Music className="w-3 h-3 text-white animate-spin-slow" />
                  <span className="text-xs text-white">Som original - {reel.author}</span>
                </div>
              </div>

              {/* Botões de Ação (Direita) */}
              <div className="absolute bottom-6 right-4 flex flex-col items-center gap-6 z-10">
                <div className="flex flex-col items-center gap-1">
                  <button className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 transition-all active:scale-90">
                    <Heart className="w-6 h-6 text-white" />
                  </button>
                  <span className="text-white text-xs font-bold drop-shadow-md">{reel.likes}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 transition-all active:scale-90">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </button>
                  <span className="text-white text-xs font-bold drop-shadow-md">{reel.comments}</span>
                </div>
                <button className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 transition-all active:scale-90">
                  <Share2 className="w-6 h-6 text-white" />
                </button>
                <button className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 transition-all active:scale-90 mt-2">
                  <MoreVertical className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BirdLayout>
  );
}