// frontend/src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { BirdLayout } from "@/components/bird/BirdLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/bird/PostCard";
import { 
  MapPin, 
  Link as LinkIcon, 
  Settings, 
  Zap, 
  Heart, 
  Repeat, 
  Sparkles, 
  Clapperboard, 
  Info,
  Calendar,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Users,
  Edit3,
  Camera
} from "lucide-react";
import { useBird } from "@/contexts/BirdContext";
import api from "@/services/api"; // ✅ CORRETO: import default, não { api }
import { toast } from "sonner";

// Interface para Post alinhada com o backend Django
interface Post {
  id: string | number;
  content: string;
  author: {
    id: number;
    name: string;
    handle: string;
    avatar?: string;
    initials: string;
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
  const [stats, setStats] = useState<ProfileStats>({
    followers: 1242,
    following: 856,
    friends: 340,
    posts: 42
  });
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');

  // Buscar posts do usuário ao montar componente
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.handle) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Buscar posts do usuário
        const postsRes = await api.get(`/api/users/${currentUser.handle}/posts/`);
        setPosts(postsRes.data || []);
        
        // Buscar estatísticas
        const statsRes = await api.get(`/api/users/${currentUser.handle}/stats/`);
        setStats(statsRes.data);
        
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        // Não mostrar erro se a API não existir ainda, usar dados demo
        toast.error('Usando dados offline - API não conectada');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Fallback de posts para demo
  const demoPosts: Post[] = [
    {
      id: 1,
      content: "Construindo o futuro do Multiverso IO 🚀 O Bird está voando alto! #LifeOS #Bird",
      author: {
        id: 1,
        name: currentUser?.name || "Ian Santos",
        handle: currentUser?.handle || "iansantos",
        initials: currentUser?.initials || "IS"
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
        handle: currentUser?.handle || "iansantos",
        initials: currentUser?.initials || "IS"
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
        <div className="relative w-full h-[280px] md:h-[320px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600" />
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-cyan-400/30 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-indigo-400/30 rounded-full blur-[80px]" />
          <img 
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=500&fit=crop" 
            className="object-cover w-full h-full opacity-30 mix-blend-overlay"
            alt="Cover"
          />
          <div className="absolute flex gap-3 top-6 right-6">
            <Button 
              variant="outline" 
              className="px-4 text-xs font-semibold tracking-wider text-white uppercase rounded-full border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:text-white h-9"
            >
              <Camera className="w-3.5 h-3.5 mr-2" /> 
              Alterar Capa
            </Button>
            <Button 
              className="px-4 text-xs font-semibold tracking-wider text-indigo-900 uppercase rounded-full shadow-lg bg-white/90 backdrop-blur-md hover:bg-white h-9"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" /> 
              Editar Vibe
            </Button>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="relative mx-4 md:mx-8 -mt-24 bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 md:p-8 border border-white/50">
          <div className="flex flex-col items-start gap-6 md:flex-row md:gap-8">
            <div className="relative mx-auto -mt-20 shrink-0 md:mx-0 md:mt-0">
              <div className="w-[140px] h-[140px] rounded-full p-1.5 bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 shadow-xl">
                <div className="w-full h-full overflow-hidden bg-white border-4 border-white rounded-full">
                  <Avatar className="w-full h-full">
                    {currentUser?.avatar ? (
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    ) : (
                      <AvatarFallback className="text-4xl font-bold text-white bg-gradient-to-br from-slate-700 to-slate-900">
                        {currentUser?.initials || "IS"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg">
                <div className="p-2 text-white rounded-full shadow-inner bg-gradient-to-r from-green-400 to-emerald-500">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
              </div>
              <div className="absolute w-4 h-4 bg-green-500 border-white rounded-full bottom-3 right-3 border-3" />
            </div>

            <div className="flex-1 w-full pt-2 text-center md:text-left">
              <div className="flex flex-col items-center justify-between gap-4 mb-4 md:flex-row md:items-start">
                <div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl text-slate-900 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text">
                    {currentUser?.name || "Ian Santos"}
                  </h1>
                  <p className="mt-1 text-base font-medium text-slate-500">@{currentUser?.handle || "iansantos"}</p>
                  <p className="max-w-md mt-3 text-sm leading-relaxed text-slate-600">
                    Construindo o Multiverso IO e o Bird 🚀 • Desenvolvedor Full Stack • 
                    <span className="font-medium text-cyan-600"> #LifeOS</span>
                  </p>
                </div>

                <div className="flex w-full gap-3 md:w-auto">
                  <Button 
                    className="flex-1 px-6 font-semibold text-white transition-all shadow-lg md:flex-none bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/25 h-11 rounded-xl"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                  <Button 
                    variant="outline" 
                    className="p-0 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 h-11 w-11 rounded-xl"
                  >
                    <Settings className="w-5 h-5 text-slate-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="p-0 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 h-11 w-11 rounded-xl"
                  >
                    <MessageCircle className="w-5 h-5 text-slate-600" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm md:justify-start text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  Multiverso IO
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Bahia, Brasil
                </span>
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-slate-400" />
                  <a href="#" className="font-medium text-cyan-600 hover:underline">github.com/ianofc</a>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Ingressou em 2024
                </span>
              </div>

              <div className="flex items-center justify-center gap-8 pt-6 border-t md:justify-start border-slate-100">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-black text-slate-900">{formatNumber(stats.followers)}</span>
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Seguidores</span>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-black text-slate-900">{formatNumber(stats.following)}</span>
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Seguindo</span>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex flex-col items-center md:items-start">
                  <span className="flex items-center gap-1 text-2xl font-black text-slate-900">
                    {formatNumber(stats.friends)}
                    <Repeat className="w-4 h-4 text-green-500" />
                  </span>
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Amigos</span>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-black text-slate-900">{stats.posts}</span>
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 mt-6 px-4 md:px-8">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="p-6 border shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl border-white/60">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-900">
                <Info className="w-5 h-5 text-cyan-500" /> 
                Sobre
              </h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Formação</p>
                    <p>Ciência da Computação • UNEB</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Trabalho</p>
                    <p>Fundador & CTO na Multiverso IO</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-rose-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Relacionamento</p>
                    <p className="font-medium text-rose-600">Namorando com Lívia Almeida 💕</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl border-white/60">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-900">
                <Users className="w-5 h-5 text-indigo-500" /> 
                Círculos Próximos
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Lívia Almeida", role: "Namorada", color: "rose" },
                  { name: "João Pedro", role: "Dev Team", color: "blue" },
                  { name: "Maria Clara", role: "Design", color: "purple" },
                ].map((person, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-2 transition-colors cursor-pointer rounded-xl hover:bg-white/50 group"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={`text-xs font-bold bg-${person.color}-100 text-${person.color}-600`}>
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold transition-colors text-slate-900 group-hover:text-cyan-600">{person.name}</p>
                      <p className={`text-[11px] font-bold text-${person.color}-500 uppercase tracking-wider`}>{person.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-3 text-xs font-semibold text-slate-500 hover:text-cyan-600">
                Ver todos os círculos
              </Button>
            </div>

            <div className="p-6 border shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl border-white/60">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-900">
                <Clapperboard className="w-5 h-5 text-orange-500" /> 
                Mídias
              </h3>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                {miniMedias.map((url, idx) => (
                  <div key={idx} className="relative overflow-hidden cursor-pointer aspect-square group">
                    <img 
                      src={url} 
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110" 
                      alt={`Media ${idx}`}
                    />
                    <div className="absolute inset-0 transition-colors bg-black/0 group-hover:bg-black/20" />
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-3 text-xs font-semibold text-slate-500 hover:text-cyan-600">
                Ver todas as mídias
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN - FEED */}
          <div className="space-y-6">
            <div className="p-2 border shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl border-white/60">
              <div className="flex gap-1">
                {[
                  { id: 'posts', label: 'Publicações', icon: Edit3 },
                  { id: 'media', label: 'Mídia', icon: Clapperboard },
                  { id: 'likes', label: 'Curtidas', icon: Heart },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 border bg-white/60 backdrop-blur-xl rounded-2xl border-white/60">
                  <div className="w-8 h-8 mb-4 border-4 rounded-full border-cyan-500 border-t-transparent animate-spin" />
                  <p className="font-medium text-slate-500">Carregando publicações...</p>
                </div>
              ) : displayPosts.length > 0 ? (
                displayPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={{
                      id: post.id.toString(),
                      content: post.content,
                      author: {
                        name: post.author.name,
                        handle: post.author.handle,
                        avatar: post.author.avatar
                      },
                      likes: post.likes,
                      comments: post.comments,
                      shares: post.shares,
                      createdAt: post.created_at,
                      liked: post.liked
                    }} 
                  />
                ))
              ) : (
                <div className="py-20 text-center border border-dashed bg-white/60 backdrop-blur-xl rounded-2xl border-slate-300">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100">
                    <Edit3 className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="mb-2 text-lg font-semibold text-slate-700">Nenhuma publicação ainda</p>
                  <p className="mb-4 text-sm text-slate-500">Comece a compartilhar suas ideias com o mundo!</p>
                  <Button className="text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl">
                    Criar primeira publicação
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