import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useBird } from "./contexts/BirdContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import ThalamusAdmin from "./pages/ThalamusAdmin";
import Login from "./pages/Login";

export default function Router() {
  const { isAuthenticated } = useBird();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Index /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/thalamus-admin" element={isAuthenticated ? <ThalamusAdmin /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}