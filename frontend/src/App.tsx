import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LyvProvider, useLyv } from "@/contexts/LyvContext";

// Páginas de Autenticação (Públicas)
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Páginas do Ecossistema Lyv (Privadas)
import Feed from "./pages/Feed"; // O Feed Principal (Momentos)
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages"; // Gaia (Messenger)
import Profile from "./pages/Profile";
import PostView from "./pages/PostView";
import Network from "./pages/Network";
import Canais from "./pages/Canais"; // Hub de Lives, Comunidades e Eventos
import Reels from "./pages/Reels"; // Módulo de vídeos curtos
import Settings from "./pages/Settings";
import Mercurio from "./pages/Mercurio"; // Hub de Notícias e IA
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 🛡️ Rota Privada: Só entra se estiver autenticado
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useLyv();

  if (isLoading) return null; // Evita piscar tela de login enquanto recupera o token

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 🔓 Rota Pública: Se já estiver logado, pula o login/signup e vai pra Home
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useLyv();

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    {/* Rotas Públicas */}
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
    
    {/* Rotas Privadas do Ecossistema Lyv */}
    <Route path="/" element={<PrivateRoute><Feed /></PrivateRoute>} />
    <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
    <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
    <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
    <Route path="/canais" element={<PrivateRoute><Canais /></PrivateRoute>} />
    <Route path="/reels" element={<PrivateRoute><Reels /></PrivateRoute>} />
    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    <Route path="/profile/:handle" element={<PrivateRoute><Profile /></PrivateRoute>} />
    <Route path="/post/:id" element={<PrivateRoute><PostView /></PrivateRoute>} />
    <Route path="/network" element={<PrivateRoute><Network /></PrivateRoute>} />
    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
    
    {/* Hub de Inteligência (PentaIA/Iris) */}
    <Route path="/mercurio" element={<PrivateRoute><Mercurio /></PrivateRoute>} />
    <Route path="/mercurio/*" element={<PrivateRoute><Mercurio /></PrivateRoute>} />
    
    {/* Fallback 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={100}>
      {/* BrowserRouter configurado para futuras atualizações do React Router v7 */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LyvProvider>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </LyvProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;