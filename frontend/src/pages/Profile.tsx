import { BirdLayout } from "@/components/bird/BirdLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/bird/PostCard";
import { MapPin, Link as LinkIcon, Grid3X3, Settings, Zap, Heart, Repeat, Sparkles, Clapperboard, Info } from "lucide-react";
import { useBird } from "@/contexts/BirdContext";

export default function Profile() {
  const { currentUser, posts } = useBird();

  // FILTRO: Apenas posts do dono do perfil
  const myPosts = posts.filter(post => post.userName === currentUser?.name);

  const miniMedias = [
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1531297461136-82lw9z0u?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=300&h=300&fit=crop",
  ];

  return (
    <BirdLayout>
      <div className="w-full pb-20">
        
        {/* HEADER E IDENTIDADE (Mantidos conforme sua análise de Broken Grid) */}
        <div className="relative w-full h-[300px] md:h-[380px] rounded-[2.5rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl overflow-hidden z-0">
            <img src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=500&fit=crop" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
            <div className="absolute top-6 right-6">
                <Button className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/40 rounded-full px-5 h-9 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 mr-2 text-yellow-300" /> Alterar Vibe
                </Button>
            </div>
        </div>

        <div className="relative mx-4 md:mx-10 -mt-20 bg-white rounded-[2.5rem] shadow-xl p-6 md:p-8 z-10 flex flex-col md:flex-row gap-8 items-start border border-gray-100">
            <div className="relative shrink-0">
                <div className="w-[130px] h-[130px] rounded-full p-1 bg-gradient-to-tr from-purple-600 to-blue-500 shadow-lg">
                    <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-white">
                        <Avatar className="w-full h-full">
                            <AvatarFallback className="bg-gray-900 text-3xl text-white font-bold">{currentUser?.initials || "IA"}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md">
                    <div className="bg-orange-500 text-white p-1.5 rounded-full shadow-inner"><Zap className="w-4 h-4 fill-white" /></div>
                </div>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{currentUser?.name || "Ian Santos"}</h1>
                        <p className="text-gray-500 font-medium text-lg">@{currentUser?.handle || "iansantos"}</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-11 rounded-2xl shadow-lg">Editar Identidade</Button>
                        <Button variant="outline" className="h-11 w-11 p-0 rounded-2xl border-2 border-gray-100"><Settings className="w-5 h-5 text-gray-700" /></Button>
                    </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-8 border-t border-gray-100 pt-6">
                    <div className="flex flex-col"><span className="font-black text-xl text-gray-900">4.2k</span><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seguidores</span></div>
                    <div className="flex flex-col"><span className="font-black text-xl text-gray-900">890</span><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seguindo</span></div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-green-600 justify-center md:justify-start"><span className="font-black text-xl">340</span><Repeat className="w-4 h-4" /></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amigos</span>
                    </div>
                </div>
            </div>
        </div>

        {/* CORPO DO PERFIL - 2 COLUNAS (FACEBOOK STYLE) */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 mt-10">
            
            {/* COLUNA ESQUERDA: INFOS */}
            <div className="space-y-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-4 text-lg flex items-center gap-2"><Info className="w-5 h-5 text-indigo-500" /> Sobre</h3>
                    <div className="space-y-4 text-[15px] text-gray-600">
                        <p className="leading-relaxed font-medium">Construindo o Multiverso IO e o Bird 🚀.</p>
                        <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gray-400" /> Bahia, Brasil</div>
                        <div className="flex items-center gap-3"><LinkIcon className="w-5 h-5 text-gray-400" /> <span className="text-indigo-600 font-bold">github.com/ianofc</span></div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-4 text-lg flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Círculos</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
                            <Avatar className="w-10 h-10"><AvatarFallback className="bg-rose-100 text-rose-600 font-bold text-xs">LA</AvatarFallback></Avatar>
                            <div><p className="font-bold text-sm text-gray-900">Lívia Almeida</p><p className="text-[11px] font-bold text-rose-500 uppercase tracking-widest">Namorada</p></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-4 text-lg flex items-center gap-2"><Clapperboard className="w-5 h-5 text-orange-500" /> Mídias</h3>
                    <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
                        {miniMedias.map((url, idx) => (
                            <img key={idx} src={url} className="aspect-square object-cover hover:opacity-80 transition-opacity cursor-pointer" />
                        ))}
                    </div>
                </div>
            </div>

            {/* COLUNA DIREITA: FEED RESTRITO (SÓ OS MEUS POSTS) */}
            <div className="space-y-6">
                <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex items-center justify-between px-6">
                    <span className="font-black text-gray-900 text-lg">Minhas Publicações</span>
                </div>

                <div className="space-y-6">
                    {myPosts.length > 0 ? (
                        myPosts.map((post) => (
                            <div key={post.id} className="max-w-full">
                                <PostCard post={post} />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium italic">Você ainda não lançou nenhum post...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </BirdLayout>
  );
}