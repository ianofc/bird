import { 
  Home, Compass, MessageCircle, Settings, LogOut, 
  Newspaper, Tv, Clapperboard, Store 
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLyv } from "@/contexts/LyvContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { UserAvatar } from "./UserAvatar";

export function LeftSidebar({ mobile = false }: { mobile?: boolean }) {
  const { currentUser, logout } = useLyv();

  // Menu consolidado com todas as funcionalidades do ecossistema Lyv
  const menu = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Clapperboard, label: "Reels", path: "/reels" },
    { icon: Tv, label: "Canais", path: "/canais" },
    { icon: Store, label: "Network", path: "/network" }, // O HUB DO MARKETPLACE AQUI!
    { icon: Newspaper, label: "Mercúrio", path: "/mercurio" },
    { icon: Compass, label: "Explorar", path: "/explore" },
    { icon: MessageCircle, label: "Gaia", path: "/messages" },
    { icon: Settings, label: "Ajustes", path: "/settings" },
  ];

  if (mobile) {
    return (
      <div className="flex items-center justify-between w-full px-2">
         {/* No mobile, priorizamos as 5 rotas essenciais */}
         {menu.slice(0, 5).map(i => <NavLink key={i.path} {...i} mobile to={i.path} />)}
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 flex items-center h-screen">
        <TooltipProvider delayDuration={100}>
          <div className="bg-white/70 dark:bg-[#1E293B]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-2xl rounded-[50px] py-8 flex flex-col items-center gap-6 w-[72px] max-h-[85vh] transition-all duration-500 ml-auto mr-4">
            
            <Link to="/profile" className="transition-transform hover:scale-105">
                <UserAvatar 
                    user={currentUser} 
                    className="w-12 h-12 shadow-md border-2 border-white dark:border-[#1E293B]" 
                    showBadge={true} 
                    hoverEffect={true}
                />
            </Link>

            <nav className="flex flex-col items-center w-full gap-3 px-2 overflow-y-auto scrollbar-hide">
              {menu.map((item) => (
                <NavLink key={item.path} {...item} to={item.path} />
              ))}
            </nav>

            <div className="flex justify-center w-10 pt-4 mt-auto border-t border-slate-200/50 dark:border-white/10">
                 <button onClick={logout} className="text-slate-400 transition-colors duration-300 hover:text-rose-500" title="Sair">
                    <LogOut size={20} />
                 </button>
            </div>

          </div>
        </TooltipProvider>
    </div>
  );
}