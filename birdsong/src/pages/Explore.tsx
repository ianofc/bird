import MainLayout from "@/components/MainLayout";
import { Hash, TrendingUp } from "lucide-react";

const Explore = () => {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Explorar</h1>
        <p className="text-muted-foreground mb-6">Descubra o que está em alta no Bird.</p>
        
        <div className="space-y-3">
          {[
            { category: "TECNOLOGIA", tag: "#AuroraDesign", posts: "54.2K", desc: "A nova tendência de design que está dominando o Bird" },
            { category: "BRASIL", tag: "Django 5.0", posts: "12K", desc: "Nova versão do framework Python com novidades incríveis" },
            { category: "GAMES", tag: "#IndieDevs", posts: "8.3K", desc: "Desenvolvedores independentes compartilham seus projetos" },
            { category: "MÚSICA", tag: "#LoFiBeats", posts: "5.1K", desc: "As melhores playlists lo-fi para programar" },
            { category: "CIÊNCIA", tag: "IA Generativa", posts: "32K", desc: "Os avanços mais recentes em inteligência artificial" },
          ].map((item, i) => (
            <div key={i} className="glass-strong rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-primary uppercase">{item.category}</span>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    <Hash size={16} /> {item.tag}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm shrink-0">
                  <TrendingUp size={14} />
                  {item.posts} posts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Explore;
