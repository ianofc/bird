// LYV System - Componente Principal
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LyvProvider } from '@/context/lyvcontext';
import AppRoutes from '@/routers';
import { Toaster } from '@/components/ui/sonner';

const App: React.FC = () => {
  return (
    <LyvProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </LyvProvider>
  );
};

export default App;
