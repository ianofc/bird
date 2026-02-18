// BIRD System - Componente Principal
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { BirdProvider } from '@/context/birdcontext';
import AppRoutes from '@/routers';
import { Toaster } from '@/components/ui/sonner';

const App: React.FC = () => {
  return (
    <BirdProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </BirdProvider>
  );
};

export default App;
