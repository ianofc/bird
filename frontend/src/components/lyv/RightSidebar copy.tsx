import { useState, useEffect } from "react";
import { Search, MoreHorizontal, ShieldCheck, Star, UserPlus, Sparkles, Lock, RefreshCw, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { tasService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function RightSidebar() {
  const [trends, setTrends] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const fetchTasData = async () => {
    setLoading(true);
    try {
      const [trendsData, suggestedData] = await Promise.all([
        tasService.getTrending(),
        tasService.getSuggested()
      ]);
      setTrends(trendsData.slice(0, 5));
      setSuggestions(suggestedData);
    } catch (error) {
      console.error("TAS Offline", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasData();
  }, []);

  const handleFollow = async (username: string) => {
    // UI Otimista: Atualiza a tela antes mesmo da resposta do servidor
    setFollowingMap(prev => ({ ...prev, [username]: !prev[username] }));
    try {
      await tasService.followUser(username);
    } catch (error) {
      toast.error("Falha ao conectar com o usuário.");
      setFollowingMap(prev => ({ ...prev, [username]: !prev[username] })); // Reverte em caso de erro
    }
  };

  return (
    <aside className="sticky top-0 flex-col hidden h-screen gap-6 p-4 pb-24 overflow-y-auto bg-transparent lg:flex w-80 xl:w-96 xl:p-6 scrollbar-hide">
      
      {/* BARRA DE BUSCA FLUTUANTE */}
      <div className="relative z-20 group shrink-0 mt-2">
        <div className="absolute inset-0 transition-opacity duration-500 rounded-full opacity-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-md group-focus-within:opacity-100" />
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-indigo-600/70 group-focus-within:text-indigo-600 transition-colors z-30" />
        <Input 
          placeholder="Buscar no Lyv..." 
          className="relative z-20 h-12 pl-12 text-base transition-all border rounded-full shadow-lg bg-white/70 dark:bg-slate-900/70 border-white/50 dark:border-slate-800 focus:border-indigo-300 focus:bg-white/90 dark:focus:bg-slate-900/90 backdrop-blur-xl shadow-indigo-500/5 placeholder:text-gray-500/80" 
        />
      </div>

      {/* CARD 1: LYV PREMIUM */}
      <Card className="shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-2xl shadow-indigo-500/10 rounded-[30px] overflow-hidden relative group hover:scale-[1.02] transition-all duration-300">
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <CardHeader className="relative z-10 px-6 pt-6 pb-2">
          <CardTitle className="flex items-center justify-between text-xl font-black tracking-tight text-gray-800 dark:text-white">
            <span className="flex items-center gap-2">
              <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">Lyv Premium</span>
            </span>
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Assine
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 px-6 pb-6 space-y-5">
          <p className="text-sm font-medium leading-relaxed text-gray-600 dark:text-slate-300">
            Desbloqueie o selo <Star className="inline w-3.5 h-3.5 text-amber-500 fill-amber-500 mx-0.5" />, uploads 4K e o poder do <span className="font-bold text-indigo-600 dark:text-indigo-400">ZIOS AI</span>.
          </p>
          <Button className="w-full rounded-2xl font-bold text-sm h-11 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-indigo-600 dark:to-purple-600 text-white shadow-xl shadow-gray-900/20 hover:shadow-gray-900/30 hover:scale-[1.02] transition-all border border-white/10">
            Obter Premium
          </Button>
        </CardContent>
      </Card>

      {/* CARD 2: RADAR TAS (Antigo Iris Trends) */}
      <Card className="shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-[30px] overflow-hidden hover:bg-white/70 dark:hover:bg-slate-900/80 transition-colors duration-300">
        <CardHeader className="px-6 pt-6 pb-3 border-b border-gray-100/50 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
              <div className="p-2 rounded-xl bg-amber-100/50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4 fill-amber-600/20 dark:fill-amber-400/20" />
              </div>
              Radar TAS
            </CardTitle>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest bg-gray-100/50 dark:bg-slate-800 px-2 py-1 rounded-lg">Em Alta</span>
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-transparent" onClick={fetchTasData} disabled={loading}>
                    <RefreshCw className={`w-3.5 h-3.5 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-2">
          
          {loading ? (
             <div className="p-2 space-y-4">
                 {[1, 2, 3].map((i) => (
                     <div key={i} className="space-y-2">
                        <Skeleton className="w-1/2 h-3 rounded-full bg-gray-200/50 dark:bg-slate-800" />
                        <Skeleton className="w-3/4 h-4 rounded-full bg-gray-200/80 dark:bg-slate-700" />
                        <Skeleton className="w-1/3 h-3 rounded-full bg-gray-200/50 dark:bg-slate-800" />
                     </div>
                 ))}
             </div>
          ) : trends.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500 dark:text-slate-400">
                <AlertCircle className="w-6 h-6 mb-2 opacity-50 text-amber-500" />
                <p className="text-sm font-semibold">Radar Silencioso</p>
                <p className="text-xs opacity-70">Nenhum assunto em alta no momento.</p>
             </div>
          ) : (
            <>
              {trends.map((trend, i) => (
                <Link to={`/explore?q=${encodeURIComponent(trend.tag)}`} key={i} className="relative block p-3 transition-all cursor-pointer group rounded-2xl hover:bg-white/60 dark:hover:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide truncate max-w-[70%]">
                      {i + 1} • Lyvifi
                    </span>
                    <MoreHorizontal className="w-4 h-4 text-gray-300 dark:text-slate-600 transition-colors group-hover:text-gray-500 dark:group-hover:text-slate-400" />
                  </div>
                  <p className="text-[15px] font-black leading-tight text-gray-800 dark:text-slate-200 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {trend.tag}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-snug text-gray-500 dark:text-slate-400 line-clamp-2">
                     {trend.posts}
                  </p>
                </Link>
              ))}
            </>
          )}

          <Button variant="ghost" className="w-full h-10 mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 rounded-xl" asChild>
            <Link to="/explore">
              Explorar o Multiverso →
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* CARD 3: SUGESTÕES (TAS) */}
      <Card className="shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-[30px] overflow-hidden hover:bg-white/70 dark:hover:bg-slate-900/80 transition-colors duration-300">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
            <div className="p-2 text-blue-600 rounded-xl bg-blue-100/50 dark:bg-blue-500/20 dark:text-blue-400">
              <UserPlus className="w-4 h-4" />
            </div>
            Para você
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2 space-y-4">
          {loading ? (
             <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /></div>
          ) : suggestions.length === 0 ? (
             <p className="text-sm text-center text-gray-500 py-2">Sem sugestões no momento.</p>
          ) : (
            suggestions.slice(0, 3).map((user, i) => {
              const isFollowing = followingMap[user.username];
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={user.id} className="flex items-center justify-between gap-2 group">
                  <Link to={`/profile/${user.username}`} className="flex items-center gap-3 overflow-hidden flex-1">
                    <Avatar className="w-10 h-10 transition-transform border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 shrink-0">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-bold text-xs">{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-bold leading-none text-gray-800 dark:text-white truncate transition-colors cursor-pointer group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{user.name}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{user.handle}</span>
                    </div>
                  </Link>
                  <Button 
                    onClick={() => handleFollow(user.username)}
                    size="sm" 
                    className={`h-8 px-3 text-xs font-bold transition-all rounded-full shadow-sm shrink-0 border ${
                      isFollowing 
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' 
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                    }`}
                  >
                    {isFollowing ? <><Check className="w-3 h-3 mr-1" /> Seguindo</> : "Seguir"}
                  </Button>
                </motion.div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* CARD 4: HEIMDALL (Privacidade) */}
      <Card className="shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-800 shadow-xl shadow-emerald-500/5 rounded-[30px] overflow-hidden group hover:bg-white/70 dark:hover:bg-slate-900/80 transition-colors duration-300">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex items-center justify-center w-12 h-12 transition-all duration-300 border shadow-sm rounded-2xl bg-emerald-100/50 dark:bg-emerald-500/20 shrink-0 border-emerald-100 dark:border-emerald-500/30 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/30">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/20 dark:fill-emerald-400/20" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-800 dark:text-white">Privacidade Blindada</span>
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-xs font-medium leading-tight text-gray-500 dark:text-slate-400">
              Protegido pelo <span className="font-bold text-emerald-600 dark:text-emerald-400">Heimdall</span>. Seus dados são <br className="hidden xl:block"/> 100% criptografados.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="shrink-0 px-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-gray-400 dark:text-slate-500 pb-4">
        <a href="#" className="transition-colors hover:text-indigo-500">Privacidade</a>
        <a href="#" className="transition-colors hover:text-indigo-500">Termos</a>
        <a href="#" className="transition-colors hover:text-indigo-500">Cookies</a>
        <span className="w-full opacity-50">© 2026 Lyv Inc.</span>
      </footer>
    </aside>
  );
}