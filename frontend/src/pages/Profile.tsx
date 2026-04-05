import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { UserAvatar } from "@/components/lyv/UserAvatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/lyv/PostCard";
import { 
  MapPin, Settings, Heart, Clapperboard, 
  Info, Briefcase, GraduationCap, Users, Edit3, 
  Camera, Sparkles, Image as ImageIcon, Video, 
  X, Send, Loader2, Star, CalendarHeart, Baby, BriefcaseBusiness
} from "lucide-react";
import { useLyv } from "@/contexts/LyvContext";
import { toast } from "sonner";
import { api } from "@/services/api";

export interface Media { id: string; type: 'image' | 'video'; url: string; file?: File; }

export default function Profile() {
  const { currentUser, login } = useLyv();
  const [profileData, setProfileData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ==========================================
  // ESTADOS: EDIÇÃO DE PERFIL
  // ==========================================
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // ESTADOS: COMPOSER E EVENTOS DE VIDA
  // ==========================================
  const [isComposing, setIsComposing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [postText, setPostText] = useState("");
  const [stagedMedia, setStagedMedia] = useState<Media[]>([]);
  const [showLifeEvent, setShowLifeEvent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // LIFECYCLE: BUSCA DE DADOS REAIS
  // ==========================================
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.handle) return;
      const username = currentUser.handle.replace('@', '');
      
      try {
        setIsLoading(true);
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${username}/`),
          api.get(`/users/${username}/posts/`)
        ]);
        
        setProfileData(profileRes.data);
        setPosts(postsRes.data);
        
        // Popula o formulário de edição com os dados reais
        setEditData({
          name: profileRes.data.name || "",
          bio: profileRes.data.bio || "",
          location: profileRes.data.location || "",
          work: profileRes.data.work || "",
          education: profileRes.data.education || "",
          relationship: profileRes.data.relationship || "",
        });
      } catch (error) {
        toast.error("Erro ao sincronizar dados do perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const formatNumber = (num: number) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : (num || 0).toString();

  // ==========================================
  // ACTIONS: CRIAÇÃO DE POSTS E EVENTOS
  // ==========================================
  const handleMediaPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setStagedMedia([{ 
        id: `temp-${Date.now()}`, 
        type: file.type.startsWith('video/') ? 'video' : 'image', 
        url: URL.createObjectURL(file), 
        file 
      }]);
    }
  };

  const handleLifeEventSelect = (emoji: string, title: string) => {
    // Formatação elegante para o Evento de Vida no texto do post
    setPostText(`${emoji} **Marco:** ${title}\n\n`);
    setShowLifeEvent(false);
    setIsComposing(true);
  };

  const handlePublishPost = async () => {
    if (!postText.trim() && stagedMedia.length === 0) {
      toast.error("Seu momento precisa de texto ou imagem.");
      return;
    }
    
    setIsPublishing(true);
    
    try {
      const formData = new FormData();
      formData.append("content", postText);
      if (stagedMedia.length > 0 && stagedMedia[0].file) {
        formData.append(stagedMedia[0].type === 'video' ? "video" : "image", stagedMedia[0].file);
      }

      // Envia via Multipart/Form-Data gerido automaticamente pelo Axios
      const response = await api.post('/lyvs/', formData);
      setPosts([response.data, ...posts]);
      
      // Limpa os estados após sucesso
      setPostText(""); 
      setStagedMedia([]); 
      setIsComposing(false);
      toast.success("Momento eternizado com sucesso!");
    } catch (error) {
      toast.error("Falha de conexão. O servidor Django está rodando?");
    } finally {
      setIsPublishing(false);
    }
  };

  // ==========================================
  // ACTIONS: SALVAR PERFIL COMPLETO (FACEBOOK STYLE)
  // ==========================================
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      
      // Anexa os dados de texto estruturados
      Object.keys(editData).forEach(key => {
        if (editData[key]) formData.append(key, editData[key]);
      });
      
      // Anexa as mídias apenas se tiverem sido alteradas
      if (editAvatarFile) formData.append("avatar", editAvatarFile);
      if (editCoverFile) formData.append("cover", editCoverFile);

      const response = await api.put('/auth/profile/', formData);
      
      // Atualiza a UI imediatamente com a resposta do backend
      setProfileData(response.data);
      
      // Força a atualização do Contexto Global (gambiarra técnica limpa)
      if (currentUser) {
         localStorage.setItem('@lyv:user', JSON.stringify({ 
           ...currentUser, 
           name: response.data.name, 
           bio: response.data.bio, 
           avatar: response.data.avatar 
         }));
      }
      
      toast.success("Identidade atualizada no Multiverso.");
      setIsEditingProfile(false);
    } catch (error) {
      toast.error("Erro ao salvar as informações do perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Extrai miniaturas de mídia reais dos posts do usuário
  const miniMedias = posts
    .filter(p => p.media && p.media.length > 0)
    .slice(0, 4)
    .map(p => p.media[0].url);

  return (
    <LyvLayout>
      <div className="w-full min-h-screen pb-24 bg-transparent transition-colors duration-500">
        
        {/* ========================================== */}
        {/* SESSÃO 1: CAPA E IDENTIDADE VISUAL        */}
        {/* ========================================== */}
        <div className="relative w-full h-[250px] md:h-[350px] rounded-b-[2rem] md:rounded-t-[2rem] overflow-hidden shadow-xl mx-auto max-w-[1100px] bg-slate-200 dark:bg-slate-800">
          {isLoading ? (
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ) : profileData?.cover ? (
             <img src={profileData.cover} className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 hover:scale-105" alt="Capa do Perfil" />
          ) : (
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700" />
          )}
          
          <div className="absolute z-20 bottom-4 right-4 md:top-6 md:right-6 md:bottom-auto">
            <Button onClick={() => setIsEditingProfile(true)} variant="secondary" className="px-4 text-xs font-bold text-slate-800 bg-white/90 hover:bg-white shadow-lg rounded-xl h-10 backdrop-blur-sm transition-all active:scale-95">
              <Camera className="w-4 h-4 mr-2" /> Editar Capa
            </Button>
          </div>
        </div>

        {/* HEADER INFO: Avatar, Nome e Botão de Editar */}
        <div className="relative mx-auto max-w-[1050px] px-4 sm:px-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-12 mb-4 relative z-10">
            <div className="relative">
               {isLoading ? (
                  <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white dark:border-[#1E293B] bg-slate-200 dark:bg-slate-800 animate-pulse" />
               ) : (
                  <>
                    <UserAvatar user={{...currentUser, ...profileData}} className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-white dark:border-[#1E293B] shadow-lg bg-white dark:bg-slate-800" showBadge={false} hoverEffect={false} />
                    <div className="absolute w-6 h-6 bg-green-500 border-4 border-white dark:border-[#1E293B] rounded-full bottom-4 right-4 shadow-sm" />
                  </>
               )}
            </div>
            
            <div className="flex-1 text-center sm:text-left pb-2">
              {isLoading ? (
                <div className="space-y-2 flex flex-col items-center sm:items-start">
                  <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2 drop-shadow-sm">
                    {profileData?.name || currentUser?.name}
                    {(profileData?.isPremium) && <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" title="Verificado" />}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{currentUser?.handle}</p>
                </>
              )}
            </div>
            
            <div className="flex gap-2 pb-2">
               <Button onClick={() => setIsEditingProfile(true)} disabled={isLoading} className="rounded-xl font-bold bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 border-0 shadow-sm transition-all active:scale-95">
                  <Edit3 className="w-4 h-4 mr-2" /> Editar Perfil
               </Button>
            </div>
          </div>
          
          <div className="flex justify-center sm:justify-start">
            {isLoading ? (
              <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" />
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300 text-center sm:text-left max-w-2xl leading-relaxed">
                {profileData?.bio || "Olá, estou usando o Lyvifi 🚀"}
              </p>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* SESSÃO 2: ESTRUTURA DE COLUNAS (GRID)     */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 px-4 md:px-0 max-w-[1100px] mx-auto">
          
          {/* --- COLUNA ESQUERDA: INTRO & FOTOS --- */}
          <div className="space-y-6">
            
            {/* CARD SOBRE (Estilo FB Robusto) */}
            <div className="p-6 bg-white dark:bg-[#1E293B] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-5">Sobre mim</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                   {[1, 2, 3, 4].map(i => <div key={i} className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-4 text-[14px] text-slate-700 dark:text-slate-300">
                  {profileData?.work && (
                    <div className="flex items-start gap-3 group">
                      <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" />
                      <span>Trabalha em <strong>{profileData.work}</strong></span>
                    </div>
                  )}
                  {profileData?.education && (
                    <div className="flex items-start gap-3 group">
                      <GraduationCap className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors shrink-0 mt-0.5" />
                      <span>Estudou em <strong>{profileData.education}</strong></span>
                    </div>
                  )}
                  {profileData?.location && (
                    <div className="flex items-start gap-3 group">
                      <MapPin className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors shrink-0 mt-0.5" />
                      <span>Mora em <strong>{profileData.location}</strong></span>
                    </div>
                  )}
                  {profileData?.relationship && (
                    <div className="flex items-start gap-3 group">
                      <Heart className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors shrink-0 mt-0.5" />
                      <span>{profileData.relationship}</span>
                    </div>
                  )}
                  
                  {/* Status de Verificação (Heimdall Core) */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Shield className="w-5 h-5 text-cyan-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 block">Identidade Verificada</span>
                      <span className="text-[11px] text-slate-400">Protegido pelo Heimdall Engine</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CARD GALERIA DE MÍDIA */}
            {!isLoading && miniMedias.length > 0 && (
              <div className="p-6 bg-white dark:bg-[#1E293B] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white">Fotos</h3>
                  <span className="text-sm font-semibold text-cyan-600 hover:underline cursor-pointer">Ver todas</span>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                  {miniMedias.map((url, idx) => (
                    <img key={idx} src={url} className="aspect-square object-cover w-full cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-300" alt="Galeria de Mídia" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- COLUNA DIREITA: COMPOSER & FEED --- */}
          <div className="space-y-6">
            
            {/* O COMPOSER DE POSTS E EVENTOS DE VIDA */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 transition-shadow focus-within:shadow-md">
              <div className="flex gap-3 mb-4">
                <UserAvatar user={{...currentUser, ...profileData}} className="w-10 h-10 shrink-0" />
                <textarea 
                  value={postText} 
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={`No que você está pensando, ${profileData?.name?.split(' ')[0] || 'hoje'}?`}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3.5 text-[15px] focus:outline-none resize-none placeholder:text-slate-400 transition-all border border-transparent focus:border-cyan-500/30"
                  rows={isComposing || postText || stagedMedia.length > 0 ? 3 : 1}
                  onFocus={() => setIsComposing(true)}
                  disabled={isPublishing}
                />
              </div>

              {/* Preview de Mídia Anexada */}
              {stagedMedia.length > 0 && (
                <div className="mb-4 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[350px] flex justify-center bg-slate-100 dark:bg-black/20">
                  {stagedMedia[0].type === 'video' ? (
                     <video src={stagedMedia[0].url} className="max-h-[350px] object-contain" controls />
                  ) : (
                     <img src={stagedMedia[0].url} className="max-h-[350px] object-contain" alt="Preview da publicação" />
                  )}
                  <button onClick={() => setStagedMedia([])} className="absolute top-3 right-3 bg-slate-900/70 p-2 rounded-full text-white hover:bg-rose-500 transition-colors backdrop-blur-md">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex flex-wrap gap-1">
                  
                  <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleMediaPick} />
                  
                  <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-3 h-9 rounded-xl font-semibold">
                    <ImageIcon className="w-5 h-5 mr-2" /> Foto / Vídeo
                  </Button>
                  
                  {/* DROPDOWN: EVENTOS DE VIDA */}
                  <div className="relative">
                    <Button variant="ghost" onClick={() => setShowLifeEvent(!showLifeEvent)} className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 px-3 h-9 rounded-xl font-semibold">
                      <Star className="w-5 h-5 mr-2" /> Evento de Vida
                    </Button>
                    
                    <AnimatePresence>
                      {showLifeEvent && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowLifeEvent(false)} />
                          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-2 z-50 overflow-hidden">
                            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registrar Marco Histórico</p>
                            </div>
                            
                            <button onClick={() => handleLifeEventSelect('💼', 'Começou em um novo emprego')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors text-slate-700 dark:text-slate-200">
                               <BriefcaseBusiness className="w-4 h-4 text-blue-500" /> Novo Emprego
                            </button>
                            <button onClick={() => handleLifeEventSelect('🎓', 'Se formou!')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors text-slate-700 dark:text-slate-200">
                               <GraduationCap className="w-4 h-4 text-purple-500" /> Formação Acadêmica
                            </button>
                            <button onClick={() => handleLifeEventSelect('❤️', 'Está em um novo relacionamento')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors text-slate-700 dark:text-slate-200">
                               <Heart className="w-4 h-4 text-rose-500" /> Novo Relacionamento
                            </button>
                            <button onClick={() => handleLifeEventSelect('👶', 'Deu boas vindas a um novo membro na família')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors text-slate-700 dark:text-slate-200">
                               <Baby className="w-4 h-4 text-amber-500" /> Nascimento
                            </button>
                            <button onClick={() => handleLifeEventSelect('🎂', 'Está celebrando mais um ano de vida')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors text-slate-700 dark:text-slate-200">
                               <CalendarHeart className="w-4 h-4 text-cyan-500" /> Aniversário
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <Button 
                   onClick={handlePublishPost} 
                   disabled={isPublishing || (!postText.trim() && stagedMedia.length === 0)} 
                   className="rounded-full px-6 font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar"}
                </Button>
              </div>
            </div>

            {/* LISTA DE POSTS DO FEED DO PERFIL */}
            <div className="space-y-5">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
                ) : posts.length === 0 ? (
                   <div className="text-center py-16 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-3xl text-slate-500 shadow-sm flex flex-col items-center">
                      <Camera className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Nenhum Momento Registrado</h3>
                      <p className="text-sm mt-1 max-w-xs mx-auto">Use a caixa acima para eternizar sua primeira lembrança no Lyvifi.</p>
                   </div>
                ) : posts.map((post, idx) => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                      <PostCard post={post as any} />
                    </motion.div>
                  ))
                }
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: EDIÇÃO DE PERFIL ESTILO FACEBOOK    */}
      {/* ========================================== */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="w-full max-w-[600px] bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl flex flex-col my-auto max-h-[90vh]">
              
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-[#0F172A] rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Perfil</h2>
                <button onClick={() => setIsEditingProfile(false)} disabled={isSavingProfile} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                   <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-8 scrollbar-hide">
                
                {/* 1. Editor de Avatar */}
                <div>
                   <div className="flex justify-between items-center mb-3">
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white">Foto do Perfil</h3>
                     <span onClick={() => avatarInputRef.current?.click()} className="text-cyan-600 font-semibold cursor-pointer hover:underline bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1 rounded-lg text-sm">Atualizar</span>
                     <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) { setEditAvatarFile(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])) } }}/>
                   </div>
                   <div className="flex justify-center">
                     <div className="relative group">
                       <img src={avatarPreview || profileData?.avatar || "https://github.com/shadcn.png"} className="w-36 h-36 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md transition-all group-hover:brightness-75" alt="Avatar" />
                       <div onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                         <Camera className="w-8 h-8 text-white drop-shadow-md" />
                       </div>
                     </div>
                   </div>
                </div>

                {/* 2. Editor de Capa */}
                <div>
                   <div className="flex justify-between items-center mb-3">
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white">Foto da Capa</h3>
                     <span onClick={() => coverInputRef.current?.click()} className="text-cyan-600 font-semibold cursor-pointer hover:underline bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1 rounded-lg text-sm">Atualizar</span>
                     <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) { setEditCoverFile(e.target.files[0]); setCoverPreview(URL.createObjectURL(e.target.files[0])) } }}/>
                   </div>
                   <div onClick={() => coverInputRef.current?.click()} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative group cursor-pointer border border-slate-200 dark:border-slate-700 shadow-inner">
                      {coverPreview || profileData?.cover ? (
                        <>
                          <img src={coverPreview || profileData?.cover} className="w-full h-full object-cover transition-all group-hover:brightness-75" alt="Capa" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white drop-shadow-md" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 group-hover:text-slate-500 transition-colors">
                          <Camera className="w-8 h-8 mb-2" />
                          <span className="font-medium text-sm">Adicionar Capa</span>
                        </div>
                      )}
                   </div>
                </div>

                {/* 3. Editor de Informações (Bio e Detalhes) */}
                <div className="space-y-5 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Detalhes Básicos</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nome Completo</label>
                      <input type="text" placeholder="Seu nome verdadeiro" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium text-slate-900 dark:text-white" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Apresentação (Bio)</label>
                      <textarea placeholder="Fale um pouco sobre você..." value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none text-slate-900 dark:text-white" rows={3} />
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 dark:text-white pt-2">Vida Profissional e Social</h3>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <Briefcase className="absolute w-5 h-5 text-slate-400 left-3 top-3.5" />
                      <input type="text" placeholder="Trabalho (Ex: Desenvolvedor no Multiverso IO)" value={editData.work} onChange={e => setEditData({...editData, work: e.target.value})} className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white" />
                    </div>
                    <div className="relative">
                      <GraduationCap className="absolute w-5 h-5 text-slate-400 left-3 top-3.5" />
                      <input type="text" placeholder="Educação (Ex: Estudou Engenharia de Software)" value={editData.education} onChange={e => setEditData({...editData, education: e.target.value})} className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white" />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute w-5 h-5 text-slate-400 left-3 top-3.5" />
                      <input type="text" placeholder="Localização (Ex: São Paulo, Brasil)" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white" />
                    </div>
                    <div className="relative">
                      <Heart className="absolute w-5 h-5 text-slate-400 left-3 top-3.5" />
                      <input type="text" placeholder="Relacionamento (Ex: Casado com Lívia)" value={editData.relationship} onChange={e => setEditData({...editData, relationship: e.target.value})} className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Rodapé de Salvar */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-[#0F172A] rounded-b-3xl sticky bottom-0">
                <Button variant="ghost" onClick={() => setIsEditingProfile(false)} disabled={isSavingProfile} className="rounded-xl font-semibold px-5">Cancelar</Button>
                <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl px-8 font-bold shadow-md active:scale-95 transition-all">
                  {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </LyvLayout>
  );
}