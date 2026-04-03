import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BirdLayout } from "@/components/bird/BirdLayout";
import { UserAvatar } from "@/components/bird/UserAvatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/bird/PostCard";
import { 
  MapPin, Link as LinkIcon, Settings, Heart, Clapperboard, 
  Info, Briefcase, GraduationCap, MessageCircle, Users, Edit3, 
  Camera, Sparkles, Star, Flame, Image as ImageIcon, Video, 
  X, Send, LayoutGrid, Rows, Shield
} from "lucide-react";
import { useBird } from "@/contexts/BirdContext";
import { toast } from "sonner";

export interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
}

interface Post {
  id: string | number;
  content: string;
  author: {
    id: number;
    name: string;
    handle: string;
    avatar?: string;
    initials: string;
    isPremium?: boolean;
  };
  media?: Media[];
  layoutPreference?: 'single' | 'grid' | 'carousel';
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  liked?: boolean;
}

interface ProfileStats {
  followers: number;
  following: number;
  friends: number;
  family: number;
  vips: number;
  matches: number;
  posts: number;
}

export default function Profile() {
  const { currentUser } = useBird();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Composer
  const [isComposing, setIsComposing] = useState(false);
  const [postText, setPostText] = useState("");
  const [stagedMedia, setStagedMedia] = useState<Media[]>([]);
  const [postLayout, setPostLayout] = useState<'grid' | 'carousel' | 'single'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats] = useState<ProfileStats>({
    followers: 1242,
    following: 856,
    friends: 340,
    family: 12,
    vips: 5,
    matches: 2,
    posts: 42
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.handle) return;
      try {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 800)); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const demoPosts: Post[] = [
    {
      id: 1,
      content: "A dopamina visual do novo grid de Momentos ⚡ O Glassmorphism flutuando livre da Aurora ao fundo é outra história.",
      author: {
        id: 1,
        name: currentUser?.name || "Ian Santos",
        handle: currentUser?.handle || "@iansantos",
        initials: currentUser?.initials || "IS",
        isPremium: currentUser?.isPremium
      },
      layoutPreference: 'grid',
      media: [
        { id: 'p2', type: 'image', url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&fit=crop' },
        { id: 'p3', type: 'image', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&fit=crop' },
      ],
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
  ];

  const formatNumber = (num: number) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();

  const handleMediaPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file, idx) => ({
        id: `temp-${Date.now()}-${idx}`,
        type: file.type.startsWith('video/') ? 'video' : 'image' as 'image' | 'video',
        url: URL.createObjectURL(file)
      }));
      setStagedMedia(prev => [...prev, ...newFiles]);
    }
  };

  const handlePublishPost = () => {
    if (!postText.trim() && stagedMedia.length === 0) {
      toast.error("O momento não pode estar vazio.");
      return;
    }
    const newPost: Post = {
      id: Date.now().toString(),
      content: postText,
      author: {
        id: 1,
        name: currentUser?.name || "Ian Santos",
        handle: currentUser?.handle || "@iansantos",
        initials: currentUser?.initials || "IS",
        isPremium: currentUser?.isPremium
      },
      layoutPreference: postLayout,
      media: stagedMedia,
      likes: 0,
      comments: 0,
      shares: 0,
      created_at: new Date().toISOString(),
      liked: false
    };
    setPosts([newPost, ...displayPosts]);
    setPostText("");
    setStagedMedia([]);
    setIsComposing(false);
    toast.success("Momento publicado com sucesso no Bird!");
  };

  return (
    <BirdLayout>
      <div className="w-full min-h-screen pb-20 bg-transparent transition-colors duration-500">
        
        <div className="relative w-full h-[280px] md:h-[320px] rounded-t-[3rem] overflow-hidden group shadow-2xl mt-2 md:mt-4 mx-auto max-w-[1400px]">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-900 dark:via-[#0B1120] dark:to-purple-900" />
          <img 
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=500&fit=crop" 
            className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 opacity-40 mix-blend-overlay group-hover:scale-105"
            alt="Cover"
          />
          <div className="absolute z-20 flex gap-3 top-6 right-6">
            <Button variant="outline" className="px-4 text-xs font-semibold tracking-wider text-white uppercase transition-all rounded-full border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:text-white h-9 shadow-lg">
              <Camera className="w-3.5 h-3.5 mr-2" /> Alterar Capa
            </Button>
          </div>
        </div>

        <div className="relative mx-4 md:mx-auto max-w-[1360px] -mt-24 bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-2xl rounded-[2.5rem] shadow-xl p-6 md:p-8 border border-white/50 dark:border-white/10">
          <div className="flex items-end gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide -mt-24 md:-mt-20">
            <div className="relative z-10 shrink-0">
               <UserAvatar user={currentUser} className="h-32 w-32 md:h-40 md:w-40 border-[6px] border-white/80 dark:border-[#1E293B]/80 backdrop-blur-md shadow-2xl bg-white dark:bg-slate-800" showBadge={true} hoverEffect={false} />
               <div className="absolute w-5 h-5 bg-green-500 border-4 border-white dark:border-[#1E293B] rounded-full shadow-sm bottom-3 right-3" />
            </div>

            {miniMedias.map((url, idx) => (
              <div key={idx} className="relative z-10 shrink-0 h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-white/80 dark:border-[#1E293B]/80 backdrop-blur-md shadow-xl overflow-hidden cursor-pointer group transition-transform hover:scale-105">
                <img src={url} className="w-full h-full object-cover" alt={`Highlight ${idx}`} />
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/40 to-purple-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start gap-6 md:flex-row md:gap-8 mt-2">
            <div className="flex-1 w-full pt-2 text-center md:text-left">
              <div className="flex flex-col items-center justify-between gap-4 mb-4 md:flex-row md:items-start">
                <div>
                  <h1 className="flex items-center justify-center gap-2 text-3xl font-black tracking-tight md:justify-start md:text-4xl text-slate-900 dark:text-white drop-shadow-sm">
                    {currentUser?.name || "Ian Santos"}
                    {currentUser?.isPremium && (
                        <div className="p-1 border rounded-full bg-amber-100 border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/30" title="Membro Gold">
                            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </div>
                    )}
                  </h1>
                  <p className="mt-1 text-base font-medium text-slate-600 dark:text-slate-300">{currentUser?.handle || "@iansantos"}</p>
                  <p className="max-w-md mx-auto mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200 md:mx-0">
                    {currentUser?.bio || "Construindo o Multiverso IO e o Bird 🚀 • Desenvolvedor Full Stack"}
                  </p>
                </div>

                <div className="flex justify-center w-full gap-3 md:w-auto">
                  <Button onClick={() => setIsEditingProfile(true)} className="flex-1 px-6 font-semibold text-white shadow-lg md:flex-none bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 h-11 rounded-xl border-0">
                    <Edit3 className="w-4 h-4 mr-2" /> Editar Perfil
                  </Button>
                  <Button variant="outline" className="p-0 border-2 border-white/50 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-md h-11 w-11 rounded-xl">
                    <Settings className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center overflow-x-auto pb-2 scrollbar-hide justify-start gap-6 pt-6 border-t border-slate-200/50 dark:border-white/10">
                <div className="flex flex-col items-center shrink-0 cursor-pointer md:items-start group">
                  <span className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-cyan-600">{formatNumber(stats.followers)}</span>
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-500 group-hover:text-cyan-500">Seguidores</span>
                </div>
                <div className="w-px h-8 bg-slate-300/50 dark:bg-white/10 shrink-0" />
                <div className="flex flex-col items-center shrink-0 cursor-pointer md:items-start group">
                  <span className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-cyan-600">{formatNumber(stats.following)}</span>
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-500 group-hover:text-cyan-500">Seguindo</span>
                </div>
                <div className="w-px h-8 bg-slate-300/50 dark:bg-white/10 shrink-0" />
                <div className="flex flex-col items-center shrink-0 cursor-pointer md:items-start group">
                  <span className="flex items-center gap-1 text-2xl font-black text-slate-900 dark:text-white group-hover:text-green-500">
                    {formatNumber(stats.friends)} <Users className="w-4 h-4 text-green-500 drop-shadow-sm" />
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-500 group-hover:text-green-500">Amigos</span>
                </div>
                <div className="w-px h-8 bg-slate-300/50 dark:bg-white/10 shrink-0" />
                <div className="flex flex-col items-center shrink-0 cursor-pointer md:items-start group">
                  <span className="flex items-center gap-1 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-500">
                    {stats.family} <Heart className="w-4 h-4 text-blue-500 drop-shadow-sm" />
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-500 group-hover:text-blue-500">Família</span>
                </div>
                <div className="w-px h-8 bg-slate-300/50 dark:bg-white/10 shrink-0" />
                <div className="flex flex-col items-center shrink-0 cursor-pointer md:items-start group">
                  <span className="flex items-center gap-1 text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-500">
                    {stats.vips} <Star className="w-4 h-4 text-amber-500 drop-shadow-sm" />
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-500 group-hover:text-amber-500">VIPs</span>
                </div>
                <div className="w-px h-8 bg-slate-300/50 dark:bg-white/10 shrink-0" />
                <div className="flex flex-col items-center shrink-0 cursor-pointer md:items-start group">
                  <span className="flex items-center gap-1 text-2xl font-black text-slate-900 dark:text-white group-hover:text-rose-500">
                    {stats.matches} <Flame className="w-4 h-4 text-rose-500 drop-shadow-sm" />
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-500 group-hover:text-rose-500">Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 mt-6 px-4 md:px-8 max-w-[1400px] mx-auto">
          
          <div className="space-y-6">
            <div className="p-6 border shadow-sm bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-2xl rounded-[2rem] border-white/50 dark:border-white/10">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-900 dark:text-white">
                <Info className="w-5 h-5 text-cyan-500" /> Sobre
              </h3>
              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div><p className="font-bold text-slate-900 dark:text-white">Formação</p><p>Ciência da Computação • UNEB</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-rose-500 mt-0.5 drop-shadow-sm" />
                  <div><p className="font-bold text-slate-900 dark:text-white">Relacionamento</p><p className="font-medium text-rose-600 dark:text-rose-400">Namorando com Lívia 💕</p></div>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
                  <Shield className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div><p className="font-bold text-slate-900 dark:text-white">Confiabilidade Bird</p><p className="text-xs mt-1 text-slate-500">Identidade verificada via Pentaia.</p></div>
                </div>
              </div>
            </div>

            <div className="p-6 border shadow-sm bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-2xl rounded-[2rem] border-white/50 dark:border-white/10">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-900 dark:text-white">
                <Clapperboard className="w-5 h-5 text-purple-500" /> Galeria
              </h3>
              <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-xl">
                {miniMedias.map((url, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-lg cursor-pointer aspect-square group">
                    <img src={url} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" alt={`Media ${idx}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* O NOVO COMPOSER SUBSTITUINDO AS ABAS */}
            <div className="p-1 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-[2rem] shadow-sm">
              <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-2xl p-5 rounded-[1.8rem]">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Camera className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Crie um Momento
                </h3>
                
                <textarea 
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Sobre o que você quer falar? Adicione fotos ou vídeos..."
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none transition-all placeholder:text-slate-400"
                  rows={isComposing || postText || stagedMedia.length > 0 ? 3 : 1}
                  onFocus={() => setIsComposing(true)}
                />

                {stagedMedia.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {stagedMedia.map(media => (
                      <div key={media.id} className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10 shadow-sm">
                        <img src={media.url} className="w-full h-full object-cover" alt="Preview" />
                        <button onClick={() => removeStagedMedia(media.id)} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-rose-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <AnimatePresence>
                  {(isComposing || postText || stagedMedia.length > 0) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col gap-3">
                      {stagedMedia.length > 1 && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-lg w-fit">
                          <span className="text-xs font-semibold text-slate-500 px-2">Layout:</span>
                          <button onClick={() => setPostLayout('grid')} className={`p-1.5 rounded-md transition-colors ${postLayout === 'grid' ? 'bg-white dark:bg-black/40 shadow-sm text-cyan-500' : 'text-slate-400'}`}>
                            <LayoutGrid className="w-4 h-4" />
                          </button>
                          <button onClick={() => setPostLayout('carousel')} className={`p-1.5 rounded-md transition-colors ${postLayout === 'carousel' ? 'bg-white dark:bg-black/40 shadow-sm text-purple-500' : 'text-slate-400'}`}>
                            <Rows className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <input type="file" multiple accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleMediaPick} />
                          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg hover:bg-cyan-100">
                            <ImageIcon className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-purple-600 bg-purple-50 dark:bg-purple-500/10 rounded-lg hover:bg-purple-100">
                            <Video className="w-5 h-5" />
                          </button>
                        </div>
                        <Button onClick={handlePublishPost} className="rounded-full px-6 font-bold bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg border-0">
                          Publicar <Send className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Lista de Posts */}
            <div className="space-y-6 min-h-[500px]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 rounded-full border-cyan-500/30 border-t-cyan-500 animate-spin" />
                  </motion.div>
                ) : displayPosts.map((post, idx) => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                      <PostCard post={post as any} />
                    </motion.div>
                  ))
                }
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/10">
                <h2 className="text-xl font-bold">Editar Perfil</h2>
                <button onClick={() => setIsEditingProfile(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Nome</label>
                    <input type="text" defaultValue={currentUser?.name} className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Bio</label>
                    <textarea defaultValue={currentUser?.bio || "Construindo o Multiverso IO 🚀"} rows={3} className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 resize-none" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-3 bg-slate-50 dark:bg-white/5">
                <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="rounded-xl">Cancelar</Button>
                <Button onClick={() => { toast.success("Perfil atualizado!"); setIsEditingProfile(false); }} className="rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white border-0">Salvar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </BirdLayout>
  );
}