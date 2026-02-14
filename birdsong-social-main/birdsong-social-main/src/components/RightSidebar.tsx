import { Search } from "lucide-react";

const RightSidebar = () => {
  return (
    <div className="space-y-4 sticky top-6">
      {/* Search */}
      <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-2">
        <Search size={16} className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar no Bird"
          className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
        />
      </div>

      {/* Premium */}
      <div className="bg-foreground text-primary-foreground rounded-2xl p-5">
        <h3 className="font-bold text-lg">Bird Premium</h3>
        <p className="text-sm opacity-80 mt-1">
          Desbloqueie o poder da IA e apoie seus criadores favoritos.
        </p>
        <button className="mt-4 w-full bg-primary-foreground text-foreground font-semibold py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity">
          Inscrever-se
        </button>
      </div>

      {/* Trending */}
      <div className="glass-strong rounded-2xl p-5">
        <h3 className="font-bold text-lg text-foreground mb-4">O que está acontecendo</h3>
        <div className="space-y-4">
          {[
            { category: "TECNOLOGIA", tag: "#AuroraDesign", posts: "54.2K posts" },
            { category: "BRASIL", tag: "Django 5.0", posts: "12K posts" },
            { category: "GAMES", tag: "#IndieDevs", posts: "8.3K posts" },
          ].map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <span className="text-xs font-semibold text-primary uppercase">{item.category}</span>
              <p className="font-bold text-foreground group-hover:text-primary transition-colors">{item.tag}</p>
              <span className="text-xs text-muted-foreground">{item.posts}</span>
            </div>
          ))}
        </div>
        <button className="text-primary text-sm font-semibold mt-4 hover:underline">
          Mostrar mais
        </button>
      </div>

      {/* Who to follow */}
      <div className="glass-strong rounded-2xl p-5">
        <h3 className="font-bold text-lg text-foreground mb-4">Quem seguir</h3>
        <div className="space-y-3">
          {[
            { name: "Ian Santos", handle: "ian_dev" },
            { name: "Ana Costa", handle: "ana_ux" },
          ].map((user, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">@{user.handle}</p>
              </div>
              <button className="text-xs font-semibold border border-border rounded-full px-4 py-1.5 hover:bg-secondary transition-colors text-foreground">
                Seguir
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Termos · Privacidade · © 2026 Bird
      </p>
    </div>
  );
};

export default RightSidebar;
