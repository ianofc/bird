import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BirdProvider, useBird } from "@/contexts/BirdContext";

// Páginas
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import News from "./pages/News";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import PostView from "./pages/PostView";
import Network from "./pages/Network";
import Communities from "./pages/Communities";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 🛡️ Rota Privada: Só entra se estiver autenticado
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useBird();

  if (isLoading) return null; // Evita piscar tela de login enquanto recupera o token

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 🔓 Rota Pública: Se já estiver logado, pula o login/signup e vai pra Home
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useBird();

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    {/* Rotas Públicas */}
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
    
    {/* Rotas Privadas (Protegidas) */}
    <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
    <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
    <Route path="/news" element={<PrivateRoute><News /></PrivateRoute>} />
    <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
    <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    <Route path="/profile/:handle" element={<PrivateRoute><Profile /></PrivateRoute>} />
    <Route path="/post/:id" element={<PrivateRoute><PostView /></PrivateRoute>} />
    <Route path="/network" element={<PrivateRoute><Network /></PrivateRoute>} />
    <Route path="/communities" element={<PrivateRoute><Communities /></PrivateRoute>} />
    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <BirdProvider>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </BirdProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;