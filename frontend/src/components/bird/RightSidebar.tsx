import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Sparkles } from "lucide-react";

export function RightSidebar() {
  return (
    <div className="flex flex-col gap-6 h-full py-4 pr-4">
      
      {/* 1. Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
        <input 
          placeholder="Buscar no Bird" 
          className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm shadow-sm placeholder:text-gray-400"
        />
      </div>

      {/* 2. Card Premium (Destaque) */}
      <div className="bg-white/70 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-bl-full -mr-4 -mt-4" />
        
        <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
            Bird Premium <Sparkles className="w-4 h-4 text-purple-500 fill-purple-500" />
        </h3>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Desbloqueie o poder da IA e apoie seus criadores favoritos.
        </p>
        <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-xl h-10 font-semibold shadow-lg">
            Inscrever-se
        </Button>
      </div>

      {/* 3. Trending Topics (Aurora Design) */}
      <div className="bg-white/60 backdrop-blur-md border border-white/50 p-5 rounded-3xl shadow-sm">
        <h3 className="font-bold text-gray-800 text-lg mb-4">O que está acontecendo</h3>
        <div className="space-y-5">
            <div className="cursor-pointer group">
                <p className="text-xs text-gray-400 font-semibold mb-0.5">Tecnologia · Ao vivo</p>
                <p className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors">#AuroraDesign</p>
                <p className="text-xs text-gray-500">54.2K posts</p>
            </div>
            <div className="cursor-pointer group">
                <p className="text-xs text-gray-400 font-semibold mb-0.5">Brasil · Tendência</p>
                <p className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Django 5.0</p>
                <p className="text-xs text-gray-500">12K posts</p>
            </div>
        </div>
        <button className="text-purple-600 text-sm font-medium mt-4 hover:underline">Mostrar mais</button>
      </div>

      {/* 4. Quem Seguir */}
      <div className="bg-white/60 backdrop-blur-md border border-white/50 p-5 rounded-3xl shadow-sm">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Quem seguir</h3>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">IS</div>
                <div className="leading-tight">
                    <p className="font-bold text-gray-900 text-sm">Ian Santos</p>
                    <p className="text-xs text-gray-500">@ian_dev</p>
                </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full border-purple-200 text-purple-600 hover:bg-purple-50 h-8 px-4">
                Seguir
            </Button>
        </div>
      </div>

      <div className="mt-auto px-2">
         <p className="text-[11px] text-gray-400 font-medium">Termos, Privacidade, © 2026 Bird</p>
      </div>
    </div>
  );
}