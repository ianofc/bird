import { useState } from "react";
import { useBird } from "@/contexts/BirdContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ShieldCheck } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useBird();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No Bird, o Superusuário entra com autoridade
    login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100">
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg">
                <span className="text-white font-black text-3xl">B</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic">Bem-vindo ao Bird</h1>
            <p className="text-gray-400 font-medium text-sm mt-2 font-mono uppercase tracking-widest text-[10px]">Identidade Requerida</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input 
              placeholder="Identificador (ex: iansantos)" 
              className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Input 
              type="password"
              placeholder="Senha" 
              className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* BOTÃO VERDE (ESTILO UX RECOMENDADO) */}
          <Button 
            type="submit"
            className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center gap-2"
          >
            <ShieldCheck size={20} /> Entrar no Multiverso
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter flex items-center justify-center gap-2">
                <Zap size={12} className="text-orange-400" /> Protegido por Thalamus Core
            </p>
        </div>
      </div>
    </div>
  );
}