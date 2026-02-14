import { Home, Compass, MessageCircle, Users, Layers, Settings, User, Menu, X, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useBird } from "@/contexts/BirdContext";

const navItems = [
  { icon: User, label: "Perfil", path: "/profile" },
  { icon: Home, label: "Início", path: "/" },
  { icon: Compass, label: "Explorar", path: "/explore" },
  { icon: MessageCircle, label: "Gorjeio", path: "/messages" },
  { icon: Users, label: "Sua Rede", path: "/network" },
  { icon: Layers, label: "Comunidades", path: "/communities" },
];

export function LeftSidebar() {
  const location = useLocation();
  const { unreadNotifications } = useBird();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navContent = (
    <>
      {navItems.map((item, i) => (
        <div key={item.path}>
          {i === 1 && <div className="w-8 h-px bg-border my-2 mx-auto md:mx-0" />}
          <Link
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`w-full md:w-11 h-11 rounded-xl flex items-center gap-3 md:justify-center px-3 md:px-0 transition-all duration-200 relative ${
              isActive(item.path)
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            title={item.label}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="md:hidden text-sm font-medium">{item.label}</span>
            {item.path === "/messages" && unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 md:top-0 md:right-0 w-2 h-2 rounded-full bg-destructive" />
            )}
          </Link>
        </div>
      ))}
      <div className="w-8 h-px bg-border my-2 mx-auto md:mx-0" />
      <Link
        to="/notifications"
        onClick={() => setMobileOpen(false)}
        className={`w-full md:w-11 h-11 rounded-xl flex items-center gap-3 md:justify-center px-3 md:px-0 transition-all duration-200 relative ${
          isActive("/notifications")
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
        title="Notificações"
      >
        <Bell className="w-5 h-5 shrink-0" />
        <span className="md:hidden text-sm font-medium">Notificações</span>
        {unreadNotifications > 0 && (
          <span className="absolute top-1 right-1 md:top-0 md:right-0 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {unreadNotifications}
          </span>
        )}
      </Link>
      <Link
        to="/settings"
        onClick={() => setMobileOpen(false)}
        className={`w-full md:w-11 h-11 rounded-xl flex items-center gap-3 md:justify-center px-3 md:px-0 transition-all duration-200 ${
          isActive("/settings")
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
        title="Configurações"
      >
        <Settings className="w-5 h-5 shrink-0" />
        <span className="md:hidden text-sm font-medium">Configurações</span>
      </Link>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[60] md:hidden w-10 h-10 rounded-xl bird-glass-strong flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bird-glass-strong shadow-2xl p-4 flex flex-col gap-1 animate-in slide-in-from-left">
            <button onClick={() => setMobileOpen(false)} className="self-end mb-4 w-10 h-10 rounded-xl hover:bg-secondary flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg mb-4 px-3 text-foreground">Bird</h2>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden md:block">
        <nav className="bird-glass-strong rounded-2xl py-4 px-2 flex flex-col items-center gap-1 shadow-lg">
          {navContent}
        </nav>
      </aside>
    </>
  );
}
