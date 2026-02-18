import { Home, Compass, MessageCircle, Users, Layers, Settings, LogOut, Newspaper } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useBird } from "@/contexts/BirdContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

export function LeftSidebar({ mobile = false }: { mobile?: boolean }) {
  const { currentUser, logout } = useBird();

  const menu = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Newspaper, label: "News", path: "/news" },
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

  // DESKTOP: Pílula aproximada do centro
  return (
    <div className="sticky top-0 z-50 flex items-center h-screen">
        <TooltipProvider delayDuration={100}>
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[50px] py-8 flex flex-col items-center gap-6 w-[72px] max-h-[85vh] transition-all duration-500 border-r-white/80 ml-auto mr-4">
            
            <Link to="/profile">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-center w-full h-full overflow-hidden bg-white rounded-full">
                    {currentUser?.avatar ? (
                        <img src={currentUser.avatar} className="object-cover w-full h-full" />
                    ) : (
                        <span className="text-sm font-bold text-indigo-600">{currentUser?.initials || "EU"}</span>
                    )}
                </div>
                </div>
            </Link>

            <nav className="flex flex-col items-center w-full gap-3 px-2 overflow-y-auto scrollbar-hide">
              {menu.map((item) => (
                <NavLink key={item.path} {...item} to={item.path} />
              ))}
            </nav>

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