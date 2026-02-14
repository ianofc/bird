import { Home, Compass, MessageCircle, Users, Layers, Settings, LogOut, Newspaper } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useBird } from "@/contexts/BirdContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

export function LeftSidebar({ mobile = false }: { mobile?: boolean }) {
  const { currentUser, logout } = useBird();

  const menu = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Newspaper, label: "News", path: "/news" }, // Novo Link
    { icon: Compass, label: "Explorar", path: "/explore" },
    { icon: MessageCircle, label: "Mensagens", path: "/messages" },
    { icon: Users, label: "Comunidade", path: "/communities" },
    { icon: Layers, label: "Projetos", path: "/network" },
    { icon: Settings, label: "Ajustes", path: "/settings" },
  ];

  if (mobile) {
    return (
      <div className="flex w-full justify-between items-center px-2">
         {menu.slice(0, 5).map(i => <NavLink key={i.path} {...i} mobile to={i.path} />)}
      </div>
    );
  }

  // DESKTOP: Pílula Única Flutuante
  return (
    <TooltipProvider delayDuration={100}>
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl rounded-[50px] py-6 flex flex-col items-center gap-6 w-full max-h-[85vh]">
        
        {/* Avatar no Topo */}
        <Link to="/profile">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-300">
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {currentUser?.avatar ? (
                    <img src={currentUser.avatar} className="h-full w-full object-cover" />
                ) : (
                    <span className="font-bold text-indigo-600 text-sm">{currentUser?.initials || "EU"}</span>
                )}
            </div>
            </div>
        </Link>

        {/* Ícones Agrupados */}
        <nav className="flex flex-col gap-2 items-center w-full px-2 overflow-y-auto scrollbar-hide">
          {menu.map((item) => (
            <NavLink key={item.path} {...item} to={item.path} />
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-2 border-t border-gray-200/50 w-12 flex justify-center">
             <button onClick={logout} className="text-gray-300 hover:text-red-500 transition-colors" title="Sair">
                <LogOut size={20} />
             </button>
        </div>

      </div>
    </TooltipProvider>
  );
}