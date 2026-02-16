import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useBird } from "./contexts/BirdContext";
import Index from "./pages/Index";
import Login from "./pages/Login";

const ProtectedRoute = () => {
  const { isAuthenticated } = useBird();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { isAuthenticated } = useBird();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const Router = () => {
  return (
    <Routes>
      {/* Se estiver logado, não vê a tela de login */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Só entra na Home se estiver logado */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Index />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;