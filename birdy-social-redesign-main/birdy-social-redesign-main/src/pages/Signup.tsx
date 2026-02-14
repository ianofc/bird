import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBird } from "@/contexts/BirdContext";
import { Feather } from "lucide-react";

const Signup = () => {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useBird();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    signup(name, handle, password);
    navigate("/");
  };

  return (
    <div className="min-h-screen bird-gradient-bg flex items-center justify-center px-4">
      <div className="bird-glass-strong rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Feather className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">Bird</span>
        </div>
        <h1 className="text-xl font-bold text-foreground text-center mb-6">Criar sua conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Usuário</label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="seu_usuario"
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
          <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Criar conta
          </button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Já tem conta? <Link to="/login" className="text-primary font-semibold hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
