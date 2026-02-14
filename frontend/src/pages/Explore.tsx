import { BirdLayout } from "@/components/bird/BirdLayout";
import { Search, Heart, MessageCircle, Play, Layers } from "lucide-react";
import { Link } from "react-router-dom";

export default function Explore() {
  const gridItems = [
    { id: 1, type: "image", src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=600&fit=crop", likes: "2k", comments: "45" },
    { id: 2, type: "video", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=1200&fit=crop", likes: "12k", comments: "340", span: "row-span-2" },
    { id: 3, type: "image", src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop", likes: "890", comments: "12" },
    { id: 4, type: "video", src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=1200&fit=crop", likes: "8.5k", comments: "120", span: "row-span-2" },
    { id: 5, type: "image", src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop", likes: "3.4k", comments: "55" },
    { id: 6, type: "image", src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop", likes: "15k", comments: "900" },
    { id: 7, type: "image", src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=600&fit=crop", likes: "400", comments: "10" },
    { id: 8, type: "video", src: "https://images.unsplash.com/photo-1501854140884-074bf86ed91e?w=600&h=1200&fit=crop", likes: "45k", comments: "2k", span: "row-span-2" },
    { id: 9, type: "image", src: "https://images.unsplash.com/photo-1531297461136-82lw9z0u?w=600&h=600&fit=crop", likes: "9.5k", comments: "410" },
    { id: 10, type: "image", src: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&h=600&fit=crop", likes: "300", comments: "2" },
    { id: 11, type: "video", src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=1200&fit=crop", likes: "22k", comments: "500", span: "row-span-2" },
    { id: 12, type: "image", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop", likes: "1.2k", comments: "25" },
    { id: 13, type: "image", src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=600&fit=crop", likes: "2.1k", comments: "88" },
    { id: 14, type: "image", src: "https://images.unsplash.com/photo-1552793494-111afe03d0ca?w=600&h=600&fit=crop", likes: "700", comments: "40" },
    { id: 15, type: "video", src: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=600&h=1200&fit=crop", likes: "3k", comments: "150", span: "row-span-2" },
    { id: 16, type: "image", src: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&h=600&fit=crop", likes: "4k", comments: "120" },
  ];

  return (
    <BirdLayout>
        <div className="max-w-[900px] mx-auto pt-2 pb-10 px-0 md:px-2">
            
            <div className="mb-4 sticky top-4 z-40 px-2">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Pesquisar..." 
                        className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-xl border border-white/60 rounded-full text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-lg transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-1 md:gap-1.5 auto-rows-[120px] md:auto-rows-[300px] grid-flow-dense">
                {gridItems.map((item) => (
                    // WRAPPER LINK: Transforma o bloco em link clicável
                    <Link 
                        to={`/post/${item.id}`}
                        key={item.id} 
                        className={`
                           relative group cursor-pointer overflow-hidden bg-gray-200 block
                           ${item.span ? 'row-span-2' : 'row-span-1'} 
                           col-span-1
                        `}
                    >
                        <img 
                            src={item.src} 
                            alt="Explore" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        <div className="absolute top-2 right-2 text-white drop-shadow-md opacity-90">
                            {item.type === 'video' ? (
                                <Play className="w-5 h-5 fill-white" />
                            ) : (
                                Math.random() > 0.7 && <Layers className="w-5 h-5 fill-white" />
                            )}
                        </div>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-bold backdrop-blur-[1px]">
                            <div className="flex items-center gap-1.5">
                                <Heart className="w-6 h-6 fill-white" />
                                <span>{item.likes}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MessageCircle className="w-6 h-6 fill-white" />
                                <span>{item.comments}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    </BirdLayout>
  );
}