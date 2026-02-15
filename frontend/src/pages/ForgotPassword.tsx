import { useState } from "react";
import { Link } from "react-router-dom";
import { useBird } from "@/contexts/BirdContext";
import { Button } from "@/components/ui/button";
import { KeyRound, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { recoverSovereignty } = useBird();

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    recoverSovereignty(email);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 text-center">
        {!sent ? (
          <>
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <KeyRound size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Recuperação de Soberania</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Insira o seu e-mail para que o TAS valide sua identidade e o ZIOS inicie a re-sincronização.
            </p>
            <form onSubmit={handleRecover} className="space-y-4">
                <input 
                    type="email" 
                    placeholder="Seu e-mail" 
                    required
                    className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold text-white shadow-lg shadow-indigo-200">
                    Enviar Instruções
                </Button>
            </form>
          </>
        ) : (
          <div className="animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
                <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Sincronia Iniciada</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                O ZIOS enviou as chaves para <strong>{email}</strong>. Siga os passos no e-mail para recuperar seu acesso.
            </p>
          </div>
        )}
        
        <Link to="/login" className="inline-flex items-center gap-2 mt-8 text-gray-400 hover:text-indigo-600 font-bold text-sm transition-colors">
            <ArrowLeft size={16} /> Voltar para o Login
        </Link>
      </div>
    </div>
  );
}