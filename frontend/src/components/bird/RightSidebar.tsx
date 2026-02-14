import { Search, MoreHorizontal } from "lucide-react";

const trending = [
  { category: "TECNOLOGIA", tag: "#AuroraDesign", posts: "54.2K posts" },
  { category: "BRASIL", tag: "Django 5.0", posts: "12K posts" },
  { category: "GAMES", tag: "#IndieDevs", posts: "8.1K posts" },
];

const suggestions = [
  { name: "Ian Santos", handle: "@ian_dev", initials: "IS", color: "bg-primary/20 text-primary" },
  { name: "Maria Costa", handle: "@maria_ui", initials: "MC", color: "bg-pink-100 text-pink-600" },
];

export function RightSidebar() {
  return (
    <aside className="w-80 shrink-0 space-y-5 hidden lg:block">
      {/* Search */}
      <div className="bird-glass-strong rounded-full flex items-center gap-2 px-4 py-2.5 shadow-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar no Bird"
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
        />
      </div>

      {/* Premium */}
      <div className="bg-bird-premium text-bird-premium-foreground rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-lg mb-1">Bird Premium</h3>
        <p className="text-sm opacity-80 mb-4">
          Desbloqueie o poder da IA e apoie seus criadores favoritos.
        </p>
        <button className="w-full bg-card text-foreground font-semibold py-2.5 rounded-full text-sm hover:bg-secondary transition-colors">
          Inscrever-se
        </button>
      </div>

      {/* Trending */}
      <div className="bird-glass-strong rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-foreground">O que está acontecendo</h3>
        <div className="space-y-4">
          {trending.map((item) => (
            <div key={item.tag} className="flex justify-between items-start group cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-primary">{item.category}</p>
                <p className="font-bold text-foreground text-sm">{item.tag}</p>
                <p className="text-xs text-muted-foreground">{item.posts}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button className="text-primary text-sm font-semibold mt-4 hover:underline">
          Mostrar mais
        </button>
      </div>

      {/* Who to follow */}
      <div className="bird-glass-strong rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-foreground">Quem seguir</h3>
        <div className="space-y-3">
          {suggestions.map((user) => (
            <div key={user.handle} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-sm font-bold`}>
                {user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.handle}</p>
              </div>
              <button className="px-4 py-1.5 rounded-full border border-border text-sm font-semibold hover:bg-secondary transition-colors text-foreground">
                Seguir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 px-2">
        <span className="hover:underline cursor-pointer">Termos</span>
        <span className="hover:underline cursor-pointer">Privacidade</span>
        <span>© 2026 Bird</span>
      </div>
    </aside>
  );
}
