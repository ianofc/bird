import { Home, Compass, MessageCircle, Users, Layers, Settings, LogOut, Newspaper } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useBird } from "@/contexts/BirdContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { UserAvatar } from "./UserAvatar"; // Importando o novo componente mestre

export function LeftSidebar({ mobile = false }: { mobile?: boolean }) {
  const { currentUser, logout } = useBird();

  const menu = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Newspaper, label: "Mercúrio", path: "/mercurio" },
    { icon: Compass, label: "Explorar", path: "/explore" },
    { icon: MessageCircle, label: "Mensagens", path: "/messages" },
    { icon: Users, label: "Comunidade", path: "/communities" },
    { icon: Layers, label: "Projetos", path: "/network" },
    { icon: Settings, label: "Ajustes", path: "/settings" },
  ];

  if (mobile) {
    return (
      <div className="flex items-center justify-between w-full px-2">
         {menu.slice(0, 5).map(i => <NavLink key={i.path} {...i} mobile to={i.path} />)}
      </div>
    );
  }

  // DESKTOP
  return (
    <div className="sticky top-0 z-50 flex items-center h-screen">
        <TooltipProvider delayDuration={100}>
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[50px] py-8 flex flex-col items-center gap-6 w-[72px] max-h-[85vh] transition-all duration-500 border-r-white/80 ml-auto mr-4">
            
            {/* Avatar do Usuário (Com suporte automático a Premium) */}
            <Link to="/profile">
                <UserAvatar 
                    user={currentUser} 
                    className="w-12 h-12" 
                    showBadge={true} 
                    hoverEffect={true}
                />
            </Link>

            {/* Menu de Navegação */}
            <nav className="flex flex-col items-center w-full gap-3 px-2 overflow-y-auto scrollbar-hide">
              {menu.map((item) => (
                <NavLink key={item.path} {...item} to={item.path} />
              ))}
            </nav>

            {/* Botão de Logout */}
            <div className="flex justify-center w-10 pt-4 mt-auto border-t border-gray-200/50">
                 <button onClick={logout} className="text-gray-400 transition-colors duration-300 hover:text-red-500" title="Sair">
                    <LogOut size={20} />
                 </button>
            </div>

          </div>
        </TooltipProvider>
    </div>
  );
}