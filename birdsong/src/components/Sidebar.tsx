import { NavLink, useLocation } from "react-router-dom";
import { Home, Edit3, MessageCircle, Users, Layers, Settings, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: User, path: "/perfil", label: "Perfil" },
  { divider: true },
  { icon: Home, path: "/", label: "Início" },
  { icon: Edit3, path: "/explorar", label: "Explorar" },
  { icon: MessageCircle, path: "/gorjeio", label: "Gorjeio" },
  { icon: Users, path: "/rede", label: "Rede" },
  { icon: Layers, path: "/comunidades", label: "Comunidades" },
  { divider: true },
  { icon: Settings, path: "/config", label: "Configurações" },
];

const Sidebar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, user } = useAuth();

  const renderNav = (mobile = false) => (
    <>
      {navItems.map((item, i) => {
        if ('divider' in item) {
          return <div key={i} className={`${mobile ? 'w-full h-px' : 'w-8 h-px'} bg-border my-2`} />;
        }
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`${mobile ? 'w-full flex items-center gap-3 px-4 py-3' : 'w-11 h-11 flex items-center justify-center'} rounded-xl transition-all duration-200 group relative ${
              isActive
                ? "bg-sidebar-accent text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            {mobile && <span className="font-medium">{item.label}</span>}
            {!mobile && (
              <span className="absolute left-14 bg-foreground text-primary-foreground text-xs font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </span>
            )}
          </NavLink>
        );
      })}
      {user && (
        <button
          onClick={() => { signOut(); setMobileOpen(false); }}
          className={`${mobile ? 'w-full flex items-center gap-3 px-4 py-3' : 'w-11 h-11 flex items-center justify-center'} rounded-xl text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors mt-2`}
        >
          <LogOut size={20} />
          {mobile && <span className="font-medium">Sair</span>}
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden md:block">
        <nav className="glass-strong rounded-2xl p-3 flex flex-col items-center gap-1 shadow-lg shadow-primary/5">
          {renderNav()}
        </nav>
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden glass-strong w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
      >
        <Menu size={20} className="text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-64 glass-strong p-4 flex flex-col gap-1 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Bird</h2>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            {renderNav(true)}
          </nav>
        </div>
      )}
    </>
  );
};

export default Sidebar;
