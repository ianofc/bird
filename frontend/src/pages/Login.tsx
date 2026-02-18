// frontend/src/pages/Login.tsx
import { useState } from "react";
import { useBird } from "@/contexts/BirdContext";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bird, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useBird();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Login] Iniciando login para:', username);
      
      // 1. Obter token do Django
      const authData = await authService.login({ username, password });
      console.log('[Login] Token obtido:', authData.token ? 'sim' : 'não');
      
      // 2. Salvar token e atualizar contexto (isso já busca /api/auth/me/)
      await login(username, authData.token);
      
      toast.success("Bem-vindo de volta!", {
        description: "Sessão iniciada com sucesso.",
      });

      // 3. Redirecionar (delay para toast aparecer)
      setTimeout(() => {
        window.location.replace("/");
      }, 600);

    } catch (error: any) {
      console.error('[Login] Erro:', error);
      
      let message = "Erro ao entrar";
      if (error.response?.status === 400) {
        message = "Usuário ou senha incorretos";
      } else if (error.response?.status === 500) {
        message = "Erro no servidor. Tente novamente.";
      } else if (!error.response) {
        message = "Servidor offline. Verifique se o Django está rodando na porta 8000.";
      }
      
      setError(message);
      toast.error("Falha na autenticação", { description: message });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen p-4 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      
      {/* Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" />
        <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse delay-1000" />
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-indigo-200/20 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse delay-2000" />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Glass Card */}
      <div className="relative w-full max-w-[420px]">
        <div className="absolute opacity-50 -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl" />
        
        <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)] overflow-hidden">
          
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6 overflow-hidden shadow-lg rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/25 group">
              <div className="absolute inset-0 transition-opacity opacity-0 bg-white/20 group-hover:opacity-100" />
              <Bird className="relative z-10 w-8 h-8 text-white" />
              <Sparkles className="absolute w-4 h-4 text-yellow-300 -top-1 -right-1 animate-pulse" />
            </div>
            
            <h1 className="mb-2 text-2xl font-bold text-transparent bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">
              Bem-vindo ao Bird
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Entre para continuar sua jornada
            </p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              
              {error && (
                <div className="flex items-start gap-3 p-4 text-sm text-red-600 border border-red-100 rounded-xl bg-red-50/80 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="ml-1 text-sm font-semibold text-slate-700">
                  Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="seu_usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="h-12 pl-4 pr-4 transition-all shadow-sm bg-white/60 border-slate-200/60 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                    Senha
                  </Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-medium transition-colors text-cyan-600 hover:text-cyan-700"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 pl-4 pr-12 transition-all shadow-sm bg-white/60 border-slate-200/60 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute p-2 transition-colors -translate-y-1/2 rounded-lg right-3 top-1/2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !username || !password}
                className="w-full h-12 mt-2 font-semibold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar no sistema
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>

            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/60"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 font-medium bg-white/50 text-slate-400">ou</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Ainda não tem uma conta?{' '}
                <Link 
                  to="/signup" 
                  className="inline-flex items-center gap-1 font-semibold transition-colors duration-300 text-cyan-600 hover:text-cyan-700 hover:gap-2"
                >
                  Criar agora
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 px-8 py-4 text-xs border-t bg-slate-50/50 border-slate-100/60 text-slate-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Protegido por criptografia AES-256</span>
          </div>

        </div>
        
        <p className="mt-6 text-xs font-medium text-center text-slate-400">
          Bird OS v2.0 • Life Intelligence Platform
        </p>
      </div>

    </div>
  );
}