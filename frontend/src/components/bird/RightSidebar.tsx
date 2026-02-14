import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function RightSidebar() {
  return (
    <div className="flex flex-col gap-6 h-full py-4 pr-4">
      
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
        <input 
          placeholder="Buscar no Bird" 
          className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm shadow-sm placeholder:text-gray-400"
        />
      </div>

      {/* Card Premium */}
      <div className="bg-white/70 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-bl-full -mr-4 -mt-4" />
        <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
            Bird Premium <Sparkles className="w-4 h-4 text-purple-500 fill-purple-500" />
        </h3>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            IA avançada e apoio aos criadores.
        </p>
        <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-xl h-10 font-semibold shadow-lg">
            Inscrever-se
        </Button>
      </div>

      {/* Trending Topics -> Linkam para NEWS */}
      <div className="bg-white/60 backdrop-blur-md border border-white/50 p-5 rounded-3xl shadow-sm">
        <h3 className="font-bold text-gray-800 text-lg mb-4">O que está acontecendo</h3>
        <div className="space-y-5">
            <Link to="/news" className="block cursor-pointer group">
                <p className="text-xs text-gray-400 font-semibold mb-0.5">Tecnologia · Ao vivo</p>
                <p className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors">#AuroraDesign</p>
                <p className="text-xs text-gray-500">54.2K posts</p>
            </Link>
            
            <Link to="/news" className="block cursor-pointer group">
                <p className="text-xs text-gray-400 font-semibold mb-0.5">Brasil · Tendência</p>
                <p className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Django 5.0</p>
                <p className="text-xs text-gray-500">12K posts</p>
            </Link>

            <Link to="/news" className="block cursor-pointer group">
                <p className="text-xs text-gray-400 font-semibold mb-0.5">Mundo · Notícia</p>
                <p className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Nova IA Generativa</p>
                <p className="text-xs text-gray-500">89K posts</p>
            </Link>
        </div>
        
        <Link to="/news" className="inline-block text-purple-600 text-sm font-medium mt-4 hover:underline">
            Mostrar mais
        </Link>
      </div>

      <div className="mt-auto px-2">
         <p className="text-[11px] text-gray-400 font-medium">Termos, Privacidade, © 2026 Bird</p>
      </div>
    </div>
  );
}