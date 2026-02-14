import MainLayout from "@/components/MainLayout";
import { MessageSquare, Plus, Layers } from "lucide-react";

const Communities = () => {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Comunidades</h1>
            <p className="text-muted-foreground mt-1">Conecte-se com pessoas que amam o que você ama.</p>
          </div>
          <button className="bg-foreground text-card font-semibold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus size={16} /> Criar Grupo
          </button>
        </div>

        <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
          <Layers size={18} className="text-primary" /> Seus Grupos
        </h2>
        <div className="glass-strong rounded-2xl p-12 text-center border border-dashed border-border">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={24} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Você não participa de nenhum grupo.</p>
          <p className="text-sm text-muted-foreground mt-1">Crie um novo ou explore as sugestões abaixo.</p>
        </div>

        <h2 className="font-bold text-foreground flex items-center gap-2 mt-8 mb-4">
          ✅ Sugestões para você
        </h2>
        <p className="text-sm text-muted-foreground italic">Nenhuma sugestão no momento.</p>
      </div>
    </MainLayout>
  );
};

export default Communities;
