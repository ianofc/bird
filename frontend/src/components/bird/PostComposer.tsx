import { X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBird } from "@/contexts/BirdContext";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";

const ICONS = {
  camera: "/icons3d/camera.png",
  video: "/icons3d/video.png",
  smile: "/icons3d/smile.png",
  rocket: "/icons3d/rocket.png"
};

export function PostComposer() {
  const { currentUser, createPost } = useBird();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => imageInputRef.current?.click();
  const handleVideoClick = () => videoInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handlePost = () => {
    if (content.trim() || selectedImage) {
      createPost(content, selectedImage); 
      setContent("");
      setSelectedImage(null);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const canPost = content.trim().length > 0 || selectedImage !== null;

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-5 shadow-sm border border-white/50 mb-6 group transition-all hover:bg-white/80 relative z-20">
      
      <input type="file" ref={imageInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <input type="file" ref={videoInputRef} accept="video/*" className="hidden" />

      <div className="flex gap-4">
        <Link to="/profile">
            <Avatar className="h-11 w-11 cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                {currentUser?.initials || "IA"}
            </AvatarFallback>
            </Avatar>
        </Link>
        
        <div className="flex-1 relative">
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-[16px] text-gray-800 placeholder:text-gray-400 min-h-[50px] p-0 mt-2 font-medium outline-none leading-relaxed"
            placeholder="No que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {selectedImage && (
            <div className="relative mt-2 mb-4 w-full rounded-2xl overflow-hidden shadow-lg group/preview">
                <img src={selectedImage} alt="Preview" className="w-full h-auto object-cover max-h-[300px]" />
                <button 
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-all backdrop-blur-md"
                >
                    <X size={16} />
                </button>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2 pt-2">
            
            <div className="flex items-center gap-5 pl-1">
               {/* ÍCONES REDUZIDOS: w-6 h-6 (24px) */}
               <button onClick={handleImageClick} className="group relative focus:outline-none transition-transform active:scale-90" title="Foto">
                  <img src={ICONS.camera} className="w-6 h-6 object-contain drop-shadow-sm transition-all group-hover:scale-110 group-hover:-translate-y-1" />
               </button>

               <button onClick={handleVideoClick} className="group relative focus:outline-none transition-transform active:scale-90" title="Vídeo">
                  <img src={ICONS.video} className="w-6 h-6 object-contain drop-shadow-sm transition-all group-hover:scale-110 group-hover:-translate-y-1" />
               </button>

               <button className="group relative focus:outline-none transition-transform active:scale-90" title="Sentimento">
                  <img src={ICONS.smile} className="w-6 h-6 object-contain drop-shadow-sm transition-all group-hover:scale-110 group-hover:-translate-y-1" />
               </button>
            </div>
            
            {/* FOGUETE REDUZIDO: w-8 h-8 (Antes era 10) */}
            <button 
                onClick={handlePost}
                disabled={!canPost}
                className={`
                    group relative focus:outline-none transition-all duration-500
                    ${canPost 
                        ? 'opacity-100 cursor-pointer active:scale-90 hover:drop-shadow-lg' 
                        : 'opacity-40 cursor-not-allowed grayscale'
                    }
                `}
                title="Lançar Post"
            >
               <div className={`
                    p-2 rounded-full transition-all duration-500
                    ${canPost ? 'bg-indigo-50/50 hover:bg-indigo-100' : 'bg-transparent'}
               `}>
                   <img 
                        src={ICONS.rocket} 
                        className={`
                            w-8 h-8 object-contain transition-transform duration-700
                            ${canPost ? 'rotate-0 group-hover:translate-x-1 group-hover:-translate-y-2 group-hover:rotate-12' : 'rotate-0'}
                        `} 
                   />
               </div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}