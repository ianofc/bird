import { Feather } from "lucide-react";

export function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-700">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Feather className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Tudo quieto por aqui</h2>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">
        Parece que ninguém postou nada ainda. Seja o primeiro a publicar algo!
      </p>
    </div>
  );
}