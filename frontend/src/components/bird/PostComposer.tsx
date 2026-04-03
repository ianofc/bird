import { X } from "lucide-react";
import { useBird } from "@/contexts/BirdContext";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { UserAvatar } from "./UserAvatar"; // Importação do Componente Mestre

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
        
        {/* AVATAR INTELIGENTE (Com suporte a Premium/Gold) */}
        <Link to="/profile">
            <UserAvatar 
                user={currentUser} 
                className="w-12 h-12" 
                hoverEffect={true}
                showBadge={false} // No composer não precisa do badge, só o anel
            />
        </Link>
        
        <div className="relative flex-1">
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-[16px] text-gray-800 placeholder:text-gray-400 min-h-[50px] p-0 mt-2.5 font-medium outline-none leading-relaxed"
            placeholder="No que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {selectedImage && (
            <div className="relative w-full mt-2 mb-4 overflow-hidden shadow-lg rounded-2xl group/preview">
                <img src={selectedImage} alt="Preview" className="w-full h-auto object-cover max-h-[300px]" />
                <button 
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-all backdrop-blur-md"
                >
                    <X size={16} />
                </button>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100/50">
            
            <div className="flex items-center gap-5 pl-1">
               {/* Ícones de Mídia */}
               <button onClick={handleImageClick} className="relative transition-transform group/icon focus:outline-none active:scale-90" title="Foto">
                  <img src={ICONS.camera} className="object-contain w-6 h-6 transition-all drop-shadow-sm group-hover/icon:scale-110 group-hover/icon:-translate-y-1" />
               </button>

               <button onClick={handleVideoClick} className="relative transition-transform group/icon focus:outline-none active:scale-90" title="Vídeo">
                  <img src={ICONS.video} className="object-contain w-6 h-6 transition-all drop-shadow-sm group-hover/icon:scale-110 group-hover/icon:-translate-y-1" />
               </button>

               <button className="relative transition-transform group/icon focus:outline-none active:scale-90" title="Sentimento">
                  <img src={ICONS.smile} className="object-contain w-6 h-6 transition-all drop-shadow-sm group-hover/icon:scale-110 group-hover/icon:-translate-y-1" />
               </button>
            </div>
            
            {/* Botão de Enviar (Foguete) */}
            <button 
                onClick={handlePost}
                disabled={!canPost}
                className={`
                    group/send relative focus:outline-none transition-all duration-500
                    ${canPost 
                        ? 'opacity-100 cursor-pointer active:scale-90 hover:drop-shadow-lg' 
                        : 'opacity-40 cursor-not-allowed grayscale'
                    }
                `}
                title="Publicar Bird"
            >
               <div className={`
                   p-2 rounded-full transition-all duration-500
                   ${canPost ? 'bg-indigo-50/50 hover:bg-indigo-100' : 'bg-transparent'}
               `}>
                   <img 
                       src={ICONS.rocket} 
                       className={`
                           w-8 h-8 object-contain transition-transform duration-700
                           ${canPost ? 'rotate-0 group-hover/send:translate-x-1 group-hover/send:-translate-y-2 group-hover/send:rotate-12' : 'rotate-0'}
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