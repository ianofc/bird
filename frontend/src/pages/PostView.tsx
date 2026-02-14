import { useParams, useNavigate } from "react-router-dom";
import { BirdLayout } from "@/components/bird/BirdLayout";
import { PostCard } from "@/components/bird/PostCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Simulando dados de um post recuperado pelo ID
  // Na vida real, isso viria de um useQuery(id)
  const mockPost = {
    id: id || "1",
    userName: "Usuário Criativo",
    userHandle: "@criativo",
    userInitials: "UC",
    userColor: "bg-gradient-to-br from-pink-500 to-orange-400",
    content: "Essa é a visão detalhada da postagem que você clicou no Explorar! Aqui você veria os comentários, threads e toda a discussão em alta resolução.",
    imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&auto=format&fit=crop", // Imagem placeholder
    likes: 1240,
    comments: 45,
    shares: 12,
    liked: true,
    createdAt: new Date(),
    verified: false
  };

  return (
    <BirdLayout>
      <div className="max-w-[600px] mx-auto pt-2">
        
        {/* Header de Navegação (UX: Botão Voltar) */}
        <div className="flex items-center gap-4 mb-6 px-2 sticky top-0 bg-white/80 backdrop-blur-md z-30 py-4 rounded-b-2xl -mx-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full hover:bg-gray-200/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Button>
          <h2 className="text-xl font-bold text-gray-900">Postagem</h2>
        </div>

        {/* O Post em si */}
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <PostCard post={mockPost} />
        </div>

        {/* Seção de Comentários (Mock) */}
        <div className="glass-card p-6 mt-4 rounded-3xl">
            <h3 className="font-bold text-gray-800 mb-4">Comentários</h3>
            <div className="text-center py-8 text-gray-400">
                <p>Carregando conversas...</p>
            </div>
        </div>

      </div>
    </BirdLayout>
  );
}