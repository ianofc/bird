import { useState } from "react";
import { useBird } from "@/contexts/BirdContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
// useNavigate removido de propósito para não conflitar com a lógica de reload

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  
  const { login } = useBird();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebugError(null);

    console.log("🚀 [BIRD] Iniciando processo de login...");

    try {
      await login(username, password);
      
      console.log("✅ [BIRD] Sucesso! Token salvo.");
      toast.success("Acesso Autorizado! A entrar...");

      // ☢️ SOLUÇÃO BRUTA (NUCLEAR):
      // Força o navegador a recarregar a raiz (/) do zero.
      // Isso limpa a memória do React e obriga o BirdContext a ler o token do LocalStorage na inicialização.
      // É impossível o Router bloquear isso se o token estiver válido.
      setTimeout(() => {
        window.location.href = "/";
      }, 500);

    } catch (error: any) {
      console.error("❌ [BIRD] Falha:", error);
      
      let errorMessage = "Erro desconhecido";
      if (error.response) {
        // Tenta pegar a mensagem de erro amigável do Django
        const data = error.response.data;
        if (data.non_field_errors) {
            errorMessage = data.non_field_errors[0]; // Ex: "Unable to log in..."
        } else if (data.detail) {
            errorMessage = data.detail;
        } else {
            errorMessage = `Erro (${error.response.status}): ${JSON.stringify(data)}`;
        }
      } else if (error.request) {
        errorMessage = "O servidor BIRD não respondeu. Verifique se o Docker está rodando.";
      } else {
        errorMessage = error.message;
      }

      setDebugError(errorMessage);
      toast.error("Falha no Login", { description: errorMessage });
      setIsLoading(false); // Para o loading apenas se der erro. Se der sucesso, o reload cuida.
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Acesso BIRD</h1>
        </div>

        {/* Área de Erro (Só aparece se algo der errado) */}
        {debugError && (
          <div className="p-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
            <div className="flex items-center gap-2 mb-1 font-bold">
              <AlertTriangle className="w-4 h-4" /> Acesso Negado:
            </div>
            <code className="break-all text-xs">{debugError}</code>
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
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando Credenciais...
              </>
            ) : (
              "Entrar no Sistema"
            )}
          </Button>
        </form>

        <div className="flex justify-center text-xs text-muted-foreground">
          <ShieldCheck className="w-3 h-3 mr-1" /> Protegido pelo AEGIS
        </div>
      </div>
    </div>
  );
}