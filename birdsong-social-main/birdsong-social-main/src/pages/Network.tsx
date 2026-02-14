import MainLayout from "@/components/MainLayout";
import { ArrowLeft, Search, UserPlus, Users, UserCheck, Megaphone, Sparkles, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const tabs = [
  { icon: UserPlus, label: "Solicitações" },
  { icon: Users, label: "Conexões (Amigos)" },
  { icon: UserCheck, label: "Seguindo" },
  { icon: Megaphone, label: "Seguidores" },
  { icon: Sparkles, label: "Sugestões", active: true },
];

const Network = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sua Rede</h1>
              <p className="text-muted-foreground">Gerencie suas conexões e descubra pessoas.</p>
            </div>
          </div>
          <div className="glass-strong rounded-full px-4 py-2 flex items-center gap-2 w-64">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar alguém..."
              className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Tab nav */}
          <div className="glass-strong rounded-2xl p-4 w-64 shrink-0 self-start">
            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === i
                      ? "text-primary bg-sidebar-accent"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {tabs[activeTab].label === "Solicitações" ? "Solicitações de Vínculo" : tabs[activeTab].label}
            </h2>
            <div className="glass-strong rounded-2xl p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <FileText size={24} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nenhuma solicitação pendente.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Network;
