// frontend/src/Router.tsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useBird } from "./contexts/BirdContext";
import Index from "./pages/Index";
import Login from "./pages/Login";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useBird();
  
  if (isLoading) return null; // Aguardar validação inicial
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useBird();
  
  if (isLoading) return null;
  
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const Router = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Index />} />
        {/* Adicione outras rotas protegidas aqui */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;