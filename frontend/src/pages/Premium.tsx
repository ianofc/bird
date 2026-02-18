import { BirdLayout } from "@/components/bird/BirdLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ShieldCheck, Sparkles, Star, Zap, Crown, Palette } from "lucide-react";
import { useBird } from "@/contexts/BirdContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Premium() {
  const { currentUser, login } = useBird(); // Usamos login para simular update do usuario
  const navigate = useNavigate();

  const handleSubscribe = () => {
    // Simulação de compra
    if (currentUser) {
        // Atualiza o estado localmente para Premium (Hack para protótipo)
        // Num app real, isso chamaria uma API de pagamento
        const updatedUser = { ...currentUser, isPremium: true };
        // Forçamos uma atualização do estado simulando um novo login com os dados novos
        // Nota: Idealmente teriamos uma função updateProfile no context, mas isso serve pro teste
        // Voce precisa adicionar isPremium: boolean na interface User no BirdContext
        
        toast.success("Bem-vindo ao Bird Gold! 🌟", {
            description: "Seu perfil agora brilha mais que os outros."
        });
        
        setTimeout(() => navigate("/profile"), 1000);
    }
  };

  return (
    <BirdLayout>
      <div className="max-w-4xl px-4 py-8 mx-auto space-y-8 duration-500 animate-in fade-in">
        
        {/* Hero Section */}
        <div className="relative space-y-6 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-amber-500/20 blur-[100px] rounded-full -z-10" />
          
          <Badge className="bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 text-white border-0 px-4 py-1.5 text-xs tracking-widest font-black uppercase shadow-lg shadow-amber-500/20">
            Bird Gold
          </Badge>
          
          <h1 className="text-4xl font-black tracking-tight md:text-6xl text-foreground">
            Sua voz merece <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 drop-shadow-sm">
              o Toque de Midas
            </span>
          </h1>
          
          <p className="max-w-xl mx-auto text-lg leading-relaxed text-muted-foreground">
            Destaque-se na multidão com o selo dourado, ganhe prioridade no algoritmo IRIS e acesse ferramentas exclusivas de personalização.
          </p>
        </div>

        {/* Pricing Card Unico (Foco total) */}
        <Card className="relative max-w-md mx-auto overflow-hidden transition-all duration-500 shadow-2xl bg-background/60 backdrop-blur-xl border-amber-500/30 shadow-amber-500/10 ring-1 ring-amber-500/20 group hover:ring-amber-500/40">
            
            {/* Faixa de Destaque */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600" />
            
            <CardHeader className="pt-8 pb-4 text-center">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold">
                <div className="p-2 shadow-inner bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                    <Crown className="w-6 h-6 text-amber-700" />
                </div>
                Assinatura Gold
              </CardTitle>
              <div className="flex items-baseline justify-center gap-1 mt-2">
                <span className="text-4xl font-black text-foreground">R$ 19,90</span>
                <span className="text-sm font-medium text-muted-foreground">/mês</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Lista de Benefícios */}
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-amber-500/10 p-1 rounded-full"><Star className="w-4 h-4 text-amber-600 fill-amber-600" /></div>
                  <div>
                    <span className="block font-bold text-foreground">Halo Dourado & Selo</span>
                    <span className="text-xs text-muted-foreground">Círculo exclusivo na foto e selo no perfil.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-blue-500/10 p-1 rounded-full"><Zap className="w-4 h-4 text-blue-600 fill-blue-600" /></div>
                  <div>
                    <span className="block font-bold text-foreground">Prioridade IRIS</span>
                    <span className="text-xs text-muted-foreground">Seus posts e respostas aparecem primeiro.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-purple-500/10 p-1 rounded-full"><Palette className="w-4 h-4 text-purple-600" /></div>
                  <div>
                    <span className="block font-bold text-foreground">Temas Exclusivos</span>
                    <span className="text-xs text-muted-foreground">Ícones de app e cores de chat únicos.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-green-500/10 p-1 rounded-full"><ShieldCheck className="w-4 h-4 text-green-600" /></div>
                  <div>
                    <span className="block font-bold text-foreground">Heimdall Pro</span>
                    <span className="text-xs text-muted-foreground">Proteção ativa contra contas fake (impostores).</span>
                  </div>
                </li>
              </ul>

              <Button 
                onClick={handleSubscribe}
                className="w-full h-12 text-base bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold shadow-lg shadow-amber-500/25 border-0 transition-all hover:scale-[1.02]"
              >
                Tornar-se Gold Agora
              </Button>
              
              <p className="text-[10px] text-center text-muted-foreground">
                Ao assinar, você concorda com os Termos de Serviço do Bird. Cancelamento a qualquer momento.
              </p>
            </CardContent>
          </Card>

      </div>
    </BirdLayout>
  );
}