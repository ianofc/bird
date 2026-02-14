import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"✅ Ajuste Aplicado: {path}")

# ==============================================================================
# 1. BIRD LAYOUT (Ajuste de Grid e Remoção de Fundo do Feed)
# ==============================================================================
bird_layout = """
import { ReactNode } from "react";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BirdLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex justify-center bg-[#f0f2f5] overflow-hidden relative">
      
      <div className="w-full max-w-[1400px] flex h-screen gap-6 md:px-4">
        
        {/* LEFT SIDEBAR: Centralizada Verticalmente */}
        <aside className="hidden md:flex flex-col w-[80px] h-full justify-center py-4 z-50 sticky top-0">
           <LeftSidebar />
        </aside>

        {/* MAIN FEED: Sem fundo (Transparente), apenas conteúdo scrollável */}
        <main className="flex-1 h-full relative z-10 overflow-hidden">
           <ScrollArea className="h-full w-full pr-4">
             <div className="pb-24 pt-4 md:pb-0">
               {children}
             </div>
           </ScrollArea>
        </main>

        {/* RIGHT SIDEBAR: Fixa e Scrollável */}
        <aside className="hidden lg:flex flex-col w-[350px] h-full z-20 py-4 overflow-y-auto scrollbar-hide">
          <RightSidebar />
        </aside>

      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white/80 backdrop-blur-xl border border-white/50 rounded-full flex justify-around items-center px-4 z-50 shadow-2xl">
          <LeftSidebar mobile />
      </div>
    </div>
  );
}
"""

# ==============================================================================
# 2. LEFT SIDEBAR (Pílula Flutuante, Ícones Juntos, Tooltips)
# ==============================================================================
left_sidebar = """
import { Home, Compass, MessageCircle, Users, Layers, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useBird } from "@/contexts/BirdContext";
import { TooltipProvider } from "@/components/ui/tooltip";

export function LeftSidebar({ mobile = false }: { mobile?: boolean }) {
  const { currentUser, logout } = useBird();

  const menu = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Compass, label: "Explorar", path: "/explore" },
    { icon: MessageCircle, label: "Mensagens", path: "/messages" },
    { icon: Users, label: "Comunidade", path: "/communities" },
    { icon: Layers, label: "Projetos", path: "/network" },
    { icon: Settings, label: "Ajustes", path: "/settings" }, // Configurações junto com o menu
  ];

  if (mobile) {
    return (
      <div className="flex w-full justify-between items-center px-2">
         {menu.slice(0, 4).map(i => <NavLink key={i.path} {...i} mobile to={i.path} />)}
         <div onClick={logout} className="p-2 text-gray-400 active:text-red-500"><LogOut size={24} /></div>
      </div>
    );
  }

  // DESKTOP: Pílula Única Flutuante
  return (
    <TooltipProvider delayDuration={100}>
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl rounded-[50px] py-6 flex flex-col items-center gap-6 w-full">
        
        {/* Avatar no Topo */}
        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] cursor-pointer hover:scale-105 transition-transform">
           <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {currentUser?.avatar ? (
                 <img src={currentUser.avatar} className="h-full w-full object-cover" />
              ) : (
                 <span className="font-bold text-indigo-600 text-sm">{currentUser?.initials || "EU"}</span>
              )}
           </div>
        </div>

        {/* Ícones Agrupados (Sem vácuo) */}
        <nav className="flex flex-col gap-3 items-center w-full px-2">
          {menu.map((item) => (
            <NavLink key={item.path} {...item} to={item.path} />
          ))}
        </nav>

        {/* Logout no finalzinho da pílula (opcional, ou pode tirar) */}
        <div className="mt-2 pt-4 border-t border-gray-200/50 w-12 flex justify-center">
             <button onClick={logout} className="text-gray-300 hover:text-red-500 transition-colors" title="Sair">
                <LogOut size={20} />
             </button>
        </div>

      </div>
    </TooltipProvider>
  );
}
"""

# ==============================================================================
# 3. NAVLINK (Com Tooltip Lateral)
# ==============================================================================
nav_link = """
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  mobile?: boolean;
  badge?: number;
}

export function NavLink({ to, icon: Icon, label, mobile, badge }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (mobile) {
    return (
      <Link to={to} className={cn("p-2 rounded-full transition-colors", isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-400")}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to={to} className="group relative flex items-center justify-center w-12 h-12">
          <div className={cn(
            "absolute inset-0 rounded-full transition-all duration-300",
            isActive ? "bg-indigo-600 shadow-md shadow-indigo-200" : "group-hover:bg-white/80"
          )} />
          
          <Icon 
            size={22} 
            className={cn(
                "relative z-10 transition-colors duration-300",
                isActive ? "text-white" : "text-gray-500 group-hover:text-indigo-600"
            )} 
            strokeWidth={isActive ? 2.5 : 2}
          />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-gray-900 text-white border-none rounded-lg ml-2 font-medium">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
"""

# ==============================================================================
# 4. STORIES BAR (Apenas Ícones, sem fundo)
# ==============================================================================
stories_bar = """
import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function StoriesBar() {
  const stories = [
    { id: 1, user: "Você", img: undefined, isUser: true },
    { id: 2, user: "Elon", img: "https://github.com/shadcn.png" },
    { id: 3, user: "Bill", img: undefined },
    { id: 4, user: "Lívia", img: undefined },
    { id: 5, user: "Diego", img: undefined },
    { id: 6, user: "Filipe", img: undefined },
  ];

  return (
    <div className="w-full mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-5 p-2 items-start">
          
          {/* Adicionar Story */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-[68px] h-[68px] rounded-full border-2 border-dashed border-indigo-300 p-[3px] group-hover:scale-105 transition-transform relative">
               <div className="w-full h-full bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                  <Plus className="w-6 h-6 text-indigo-600" />
               </div>
               <div className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 border-2 border-white">
                  <Plus className="w-3 h-3 text-white" />
               </div>
            </div>
            <span className="text-xs font-medium text-gray-600">Story</span>
          </div>

          {/* Outros Stories */}
          {stories.filter(s => !s.isUser).map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1.5 cursor-pointer group">
              <div className="w-[68px] h-[68px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-indigo-600 group-hover:scale-105 transition-transform shadow-sm">
                <div className="w-full h-full rounded-full border-[3px] border-[#f0f2f5] overflow-hidden bg-gray-200">
                    {story.img ? (
                        <img src={story.img} alt={story.user} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white text-sm font-bold text-gray-400">
                            {story.user[0]}
                        </div>
                    )}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600 max-w-[60px] truncate text-center">
                {story.user}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
"""

# ==============================================================================
# 5. POST COMPOSER (Ajuste visual para não ficar "solto" demais)
# ==============================================================================
post_composer = """
import { Button } from "@/components/ui/button";
import { ImageIcon, Video, Smile, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBird } from "@/contexts/BirdContext";
import { useState } from "react";

export function PostComposer() {
  const { currentUser, createPost } = useBird();
  const [content, setContent] = useState("");

  const handlePost = () => {
    if (content.trim()) {
      createPost(content);
      setContent("");
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-5 shadow-sm border border-white/50 mb-6 group transition-all hover:bg-white/80">
      <div className="flex gap-4">
        <Avatar className="h-11 w-11 cursor-pointer hover:opacity-90 transition-opacity">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
            {currentUser?.initials || "IA"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-[16px] text-gray-800 placeholder:text-gray-500 min-h-[50px] p-0 mt-2 font-medium"
            placeholder="No que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="flex items-center justify-between mt-3 border-t border-gray-200/50 pt-3">
            <div className="flex gap-1">
               <Button variant="ghost" size="icon" className="rounded-full text-indigo-500 hover:bg-indigo-50"><ImageIcon className="w-5 h-5" /></Button>
               <Button variant="ghost" size="icon" className="rounded-full text-indigo-500 hover:bg-indigo-50"><Video className="w-5 h-5" /></Button>
               <Button variant="ghost" size="icon" className="rounded-full text-indigo-500 hover:bg-indigo-50"><Smile className="w-5 h-5" /></Button>
            </div>
            
            <Button 
                onClick={handlePost}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-9 font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
               Publicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

print("🔧 Aplicando o Polimento Final (Modo Pílula & Feed Clean)...")

write_file("frontend/src/components/bird/BirdLayout.tsx", bird_layout)
write_file("frontend/src/components/bird/LeftSidebar.tsx", left_sidebar)
write_file("frontend/src/components/bird/StoriesBar.tsx", stories_bar)
write_file("frontend/src/components/NavLink.tsx", nav_link)
write_file("frontend/src/components/bird/PostComposer.tsx", post_composer)

print("🎉 Design Final Aplicado! Reinicie o Docker se necessário.")