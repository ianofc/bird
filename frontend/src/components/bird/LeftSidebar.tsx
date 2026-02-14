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