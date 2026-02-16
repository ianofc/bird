import { useState } from "react";
import { useBird } from "@/contexts/BirdContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; // Importação essencial

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  
  const { login } = useBird();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebugError(null);

    console.log("🚀 [BIRD] Iniciando login...");

    try {
      await login(username, password);
      
      console.log("✅ [BIRD] Login SUCESSO! Redirecionando...");
      toast.success("Login realizado! Entrando...", { duration: 2000 });

      // ============================================================
      // ☢️ REDIRECIONAMENTO NUCLEAR
      // ============================================================
      // Tenta usar o router do React primeiro
      setTimeout(() => {
        try {
          console.log("🔄 Tentando navigate('/')");
          navigate("/"); 
        } catch (err) {
          console.warn("⚠️ navigate falhou, usando window.location");
        }
        
        // Se ainda estivermos aqui após 500ms, força o reload
        setTimeout(() => {
           if (window.location.pathname === '/login') {
             console.log("🚀 Forçando window.location.href = '/'");
             window.location.href = '/';
           }
        }, 500);
      }, 500);

    } catch (error: any) {
      console.error("❌ [BIRD] Erro:", error);
      
      let errorMessage = "Erro desconhecido";
      if (error.response) {
        // Erro do Django (400, 401, 403, 500)
        errorMessage = `Erro Servidor (${error.response.status}): ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // Erro de Rede (Backend desligado ou CORS)
        errorMessage = "Erro de Rede: O servidor não respondeu.";
      } else {
        errorMessage = `Erro Config: ${error.message}`;
      }

      setDebugError(errorMessage);
      toast.error("Falha no Login", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Login BIRD</h1>
        </div>

        {debugError && (
          <div className="p-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
            <div className="flex items-center gap-2 mb-1 font-bold">
              <AlertTriangle className="w-4 h-4" /> Erro Detectado:
            </div>
            <code className="break-all">{debugError}</code>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Usuário (ex: iansantos)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              className="bg-background/50"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>

        <div className="flex justify-center text-xs text-muted-foreground">
          <ShieldCheck className="w-3 h-3 mr-1" /> Ambiente Seguro
        </div>
      </div>
    </div>
  );
}