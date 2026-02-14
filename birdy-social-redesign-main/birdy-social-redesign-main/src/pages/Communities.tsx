import { BirdLayout } from "@/components/bird/BirdLayout";
import { useBird } from "@/contexts/BirdContext";
import { Plus, MessageSquare } from "lucide-react";

const Communities = () => {
  const { users } = useBird();

  return (
    <BirdLayout>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-foreground">Comunidades</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Criar Grupo
        </button>
      </div>
      <p className="text-muted-foreground text-sm mb-6">Conecte-se com pessoas que amam o que você ama.</p>

      {/* Seus Grupos */}
      <div className="mb-8">
        <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="text-primary">≡</span> Seus Grupos
        </h2>
        <div className="bird-glass rounded-2xl py-12 flex flex-col items-center text-center border border-dashed border-border">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
            <MessageSquare className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="font-semibold text-foreground mb-1">Você não participa de nenhum grupo.</p>
          <p className="text-sm text-muted-foreground">Crie um novo ou explore as sugestões abaixo.</p>
        </div>
      </div>

      {/* Sugestões */}
      <div>
        <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="text-primary">✦</span> Sugestões para você
        </h2>
        <p className="text-sm text-muted-foreground italic">Nenhuma sugestão no momento.</p>
      </div>
    </BirdLayout>
  );
};

export default Communities;
