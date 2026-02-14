import { Feather } from "lucide-react";

export function EmptyFeed() {
  return (
    <div className="bird-glass rounded-2xl py-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Feather className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <p className="font-semibold text-foreground mb-1">Tudo quieto por aqui</p>
      <p className="text-sm text-muted-foreground">Seja o primeiro a publicar algo!</p>
    </div>
  );
}
