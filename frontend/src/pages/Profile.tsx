import { useState, useEffect } from "react";
import { BirdLayout } from "@/components/bird/BirdLayout";
import { UserAvatar } from "@/components/bird/UserAvatar"; // Componente Mestre
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/bird/PostCard";
import { 
  MapPin, 
  Link as LinkIcon, 
  Settings, 
  Zap, 
  Heart, 
  Repeat, 
  Clapperboard, 
  Info,
  Calendar,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Users,
  Edit3,
  Camera,
  Sparkles
} from "lucide-react";
import { useBird } from "@/contexts/BirdContext";
import api from "@/services/api";
import { toast } from "sonner";

// Interfaces Tipadas
interface Post {
  id: string | number;
  content: string;
  author: {
    id: number;
    name: string;
    handle: string;
    avatar?: string;
    initials: string;
    isPremium?: boolean; // Suporte a Premium nos posts
  };
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  liked?: boolean;
  image?: string;
}

interface ProfileStats {
  followers: number;
  following: number;
  friends: number;
  posts: number;
}

export default function Profile() {
  const { currentUser } = useBird();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');
  
  // Mock de estatísticas iniciais
  const [stats, setStats] = useState<ProfileStats>({
    followers: 1242,
    following: 856,
    friends: 340,
    posts: 42
  });

  // Buscar dados reais
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.handle) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // Em produção, descomentar as chamadas reais:
        // const postsRes = await api.get(`/api/users/${currentUser.handle}/posts/`);
        // setPosts(postsRes.data || []);
        
        // Simulação de delay para UX
        await new Promise(r => setTimeout(r, 800));
        
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast.error('Usando dados offline - API não conectada');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Posts de Demonstração (Fallback)
  const demoPosts: Post[] = [
    {
      id: 1,
      content: "Construindo o futuro do Multiverso IO 🚀 O Bird está voando alto! #LifeOS #Bird",
      author: {
        id: 1,
        name: currentUser?.name || "Ian Santos",
        handle: currentUser?.handle || "@iansantos",
        initials: currentUser?.initials || "IS",
        isPremium: currentUser?.isPremium // Herda status
      },
      likes: 42,
      comments: 8,
      shares: 3,
      created_at: new Date().toISOString(),
      liked: false
    },
    {
      id: 2,
      content: "Novo módulo TAS implementado com sucesso! A dopamina do feed está calibrada ⚡",
      author: {
        id: 1,
        name: currentUser?.name || "Ian Santos",
        handle: currentUser?.handle || "@iansantos",
        initials: currentUser?.initials || "IS",
        isPremium: currentUser?.isPremium
      },
      likes: 128,
      comments: 24,
      shares: 12,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      liked: true
    }
  ];

  const displayPosts = posts.length > 0 ? posts : demoPosts;

  const miniMedias = [
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop",
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <BirdLayout>
      <div className="w-full min-h-screen pb-20 bg-gradient-to-b from-slate-50/50 to-white">
        
        {/* HEADER COVER - Aurora Glass */}
        <div className="relative w-full h-[280px] md:h-[320px] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600" />
          
          {/* Texture Overlay */}
          <div 
            className="absolute inset-0 opacity-10 mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
          />
          
          {/* Dynamic Blurs */}
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-cyan-400/30 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-indigo-400/30 rounded-full blur-[80px]" />
          
          <img 
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=500&fit=crop" 
            className="object-cover w-full h-full transition-transform duration-700 opacity-30 mix-blend-overlay group-hover:scale-105"
            alt="Cover"
          />
          
          {/* Action Buttons (Top Right) */}
          <div className="absolute z-20 flex gap-3 top-6 right-6">
            <Button 
              variant="outline" 
              className="px-4 text-xs font-semibold tracking-wider text-white uppercase transition-all rounded-full border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:text-white h-9"
            >
              <Camera className="w-3.5 h-3.5 mr-2" /> 
              Alterar Capa
            </Button>
            {currentUser?.isPremium && (
                <Button 
                className="px-4 text-xs font-semibold tracking-wider uppercase transition-all rounded-full shadow-lg text-amber-900 bg-amber-400/90 backdrop-blur-md hover:bg-amber-400 h-9"
                >
                <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-800" /> 
                Editar Tema
                </Button>
            )}
          </div>
        </div>

        {/* PROFILE INFO CARD */}
        <div className="relative mx-4 md:mx-8 -mt-24 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 md:p-8 border border-white/50">
          <div className="flex flex-col items-start gap-6 md:flex-row md:gap-8">
            
            {/* AVATAR COM CÍRCULO PREMIUM */}
            <div className="relative z-10 mx-auto -mt-24 md:mx-0 md:-mt-20 shrink-0">
               <UserAvatar 
                  user={currentUser} 
                  className="h-36 w-36 md:h-40 md:w-40 border-[6px] border-white shadow-2xl bg-white"
                  showBadge={true} // Mostra a estrela se for premium
                  hoverEffect={false} // Estático no perfil
               />
               
               {/* Status Indicator (Online) */}
               <div className="absolute w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-sm bottom-3 right-3" />
            </div>

            {/* INFO TEXT & ACTIONS */}
            <div className="flex-1 w-full pt-2 text-center md:text-left">
              <div className="flex flex-col items-center justify-between gap-4 mb-4 md:flex-row md:items-start">
                <div>
                  <h1 className="flex items-center justify-center gap-2 text-3xl font-black tracking-tight md:justify-start md:text-4xl text-slate-900">
                    {currentUser?.name || "Ian Santos"}
                    {currentUser?.isPremium && (
                        <div className="p-1 border rounded-full bg-amber-100 border-amber-200" title="Membro Gold">
                            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </div>
                    )}
                  </h1>
                  <p className="mt-1 text-base font-medium text-slate-500">{currentUser?.handle || "@iansantos"}</p>
                  <p className="max-w-md mx-auto mt-3 text-sm leading-relaxed text-slate-600 md:mx-0">
                    {currentUser?.bio || "Construindo o Multiverso IO e o Bird 🚀 • Desenvolvedor Full Stack"}
                    <span className="ml-1 font-medium text-cyan-600">#LifeOS</span>
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-center w-full gap-3 md:w-auto">
                  <Button 
                    className="flex-1 px-6 font-semibold text-white transition-all shadow-lg md:flex-none bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/25 h-11 rounded-xl active:scale-95"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                  <Button 
                    variant="outline" 
                    className="p-0 transition-colors border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 h-11 w-11 rounded-xl"
                  >
                    <Settings className="w-5 h-5 text-slate-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="p-0 transition-colors border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 h-11 w-11 rounded-xl"
                  >
                    <MessageCircle className="w-5 h-5 text-slate-600" />
                  </Button>
                </div>
              </div>

              {/* Badges e Infos */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm md:justify-start text-slate-500">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  Multiverso IO
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Bahia, Brasil
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  <a href="#" className="font-medium text-cyan-600 hover:underline">github.com/ianofc</a>
                </span>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-center gap-8 pt-6 border-t md:justify-start border-slate-100/80">
                <div className="flex flex-col items-center cursor-pointer md:items-start group">
                  <span className="text-2xl font-black transition-colors text-slate-900 group-hover:text-cyan-600">{formatNumber(stats.followers)}</span>
                  <span className="text-xs font-bold tracking-wider uppercase transition-colors text-slate-400 group-hover:text-cyan-500">Seguidores</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex flex-col items-center cursor-pointer md:items-start group">
                  <span className="text-2xl font-black transition-colors text-slate-900 group-hover:text-cyan-600">{formatNumber(stats.following)}</span>
                  <span className="text-xs font-bold tracking-wider uppercase transition-colors text-slate-400 group-hover:text-cyan-500">Seguindo</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex flex-col items-center cursor-pointer md:items-start group">
                  <span className="flex items-center gap-1 text-2xl font-black transition-colors text-slate-900 group-hover:text-green-600">
                    {formatNumber(stats.friends)}
                    <Repeat className="w-4 h-4 text-green-500" />
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase transition-colors text-slate-400 group-hover:text-green-500">Amigos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 mt-6 px-4 md:px-8 max-w-[1400px] mx-auto">
          
          {/* SIDEBAR ESQUERDA (Info e Fotos) */}
          <div className="space-y-6">
            
            {/* Box Sobre */}
            <div className="p-6 border shadow-sm bg-white/60 backdrop-blur-xl rounded-[1.5rem] border-white/60">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-900">
                <Info className="w-5 h-5 text-cyan-500" /> 
                Sobre
              </h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Formação</p>
                    <p>Ciência da Computação • UNEB</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-rose-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Relacionamento</p>
                    <p className="font-medium text-rose-600">Namorando com Lívia 💕</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Box Mídias */}
            <div className="p-6 border shadow-sm bg-white/60 backdrop-blur-xl rounded-[1.5rem] border-white/60">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-900">
                <Clapperboard className="w-5 h-5 text-orange-500" /> 
                Galeria
              </h3>
              <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-xl">
                {miniMedias.map((url, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-lg cursor-pointer aspect-square group">
                    <img 
                      src={url} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                      alt={`Media ${idx}`}
                    />
                    <div className="absolute inset-0 transition-colors bg-black/0 group-hover:bg-black/20" />
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs font-bold tracking-wide uppercase text-slate-500 hover:text-cyan-600 hover:bg-cyan-50/50 rounded-xl">
                Ver Galeria Completa
              </Button>
            </div>
          </div>

          {/* MAIN FEED (Direita) */}
          <div className="space-y-6">
            
            {/* Tabs de Navegação */}
            <div className="p-1.5 border shadow-sm bg-white/80 backdrop-blur-xl rounded-2xl border-white/60 sticky top-20 z-30">
              <div className="flex gap-1">
                {[
                  { id: 'posts', label: 'Publicações', icon: Edit3 },
                  { id: 'media', label: 'Mídia', icon: Clapperboard },
                  { id: 'likes', label: 'Curtidas', icon: Heart },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-white shadow-md text-cyan-600 ring-1 ring-black/5' 
                        : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'fill-current' : ''}`} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Posts */}
            <div className="space-y-6 min-h-[500px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 rounded-full border-cyan-500/30 border-t-cyan-600 animate-spin" />
                </div>
              ) : displayPosts.length > 0 ? (
                displayPosts.map((post) => (
                  <div key={post.id} className="duration-500 animate-in fade-in slide-in-from-bottom-4">
                    <PostCard 
                        post={{
                        id: post.id.toString(),
                        content: post.content,
                        author: {
                            name: post.author.name,
                            handle: post.author.handle,
                            avatar: post.author.avatar,
                            isPremium: post.author.isPremium // Passando Premium pro Card
                        },
                        likes: post.likes,
                        comments: post.comments,
                        shares: post.shares,
                        createdAt: post.created_at,
                        liked: post.liked
                        }} 
                    />
                  </div>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed bg-white/40 backdrop-blur-sm rounded-3xl border-slate-200">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 text-slate-300">
                    <Edit3 className="w-10 h-10" />
                  </div>
                  <p className="mb-2 text-lg font-bold text-slate-700">Nenhuma publicação ainda</p>
                  <p className="mb-6 text-sm text-slate-500">Compartilhe seu primeiro Bird com o mundo!</p>
                  <Button className="px-8 text-white bg-slate-900 rounded-xl hover:bg-black">
                    Criar Publicação
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BirdLayout>
  );
}