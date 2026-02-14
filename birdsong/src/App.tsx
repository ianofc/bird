import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Gorjeio from "./pages/Gorjeio";
import Network from "./pages/Network";
import Communities from "./pages/Communities";
import Explore from "./pages/Explore";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/gorjeio" element={<Gorjeio />} />
            <Route path="/rede" element={<Network />} />
            <Route path="/comunidades" element={<Communities />} />
            <Route path="/explorar" element={<Explore />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
