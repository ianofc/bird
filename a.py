import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"✅ Interatividade Aplicada: {path}")

# ==============================================================================
# 1. NOVA PÁGINA: POST VIEW (Detalhe da Postagem)
# ==============================================================================
post_view = """
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
"""

# ==============================================================================
# 2. ATUALIZAR EXPLORE (Tornar Grid Clicável)
# ==============================================================================
explore_page = """
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
"""

# ==============================================================================
# 3. ATUALIZAR ROTAS (Adicionar /post/:id)
# ==============================================================================
app_routes = """
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BirdProvider, useBird } from "@/contexts/BirdContext";

// Páginas
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import News from "./pages/News";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import PostView from "./pages/PostView"; // Nova Página
import Network from "./pages/Network";
import Communities from "./pages/Communities";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn } = useBird();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn } = useBird();
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    {/* Rotas Públicas */}
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
    
    {/* Rotas Privadas */}
    <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
    <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
    <Route path="/news" element={<PrivateRoute><News /></PrivateRoute>} />
    <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
    <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    <Route path="/profile/:handle" element={<PrivateRoute><Profile /></PrivateRoute>} />
    <Route path="/post/:id" element={<PrivateRoute><PostView /></PrivateRoute>} /> {/* Rota de Detalhe */}
    <Route path="/network" element={<PrivateRoute><Network /></PrivateRoute>} />
    <Route path="/communities" element={<PrivateRoute><Communities /></PrivateRoute>} />
    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <BirdProvider>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </BirdProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
"""

print("🔧 Conectando a Grid de Explorar à Página de Post...")
write_file("frontend/src/pages/PostView.tsx", post_view)
write_file("frontend/src/pages/Explore.tsx", explore_page)
write_file("frontend/src/App.tsx", app_routes)
print("🎉 Concluído! Clique nas imagens do Explorar para testar.")