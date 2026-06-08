import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Páginas internas do seu sistema
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts.jsx';
import Train from './pages/Train';
import Progression from './pages/Progression';
import BioimpedancePage from './pages/BioimpedancePage';

// Importação do seu logo oficial com fundo transparente
import logo from '/logo-of.png';

// COMPONENTE DE LAYOUT ATUALIZADO (CENTRALIZADO, GRANDE E NA COR ORIGINAL)
const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      
      {/* HEADER PREMIUM CENTRALIZADO - COR ORIGINAL E TEXTO ABAIXO */}
      <header className="py-8 bg-card border-b border-border">
        <div className="container flex flex-col items-center justify-center text-center">
          
          {/* Logo Bronze Ampliado e Centralizado */}
          <img 
            src={logo} 
            alt="OF Training Logo" 
            className="h-28 w-28 object-contain mb-3 filter drop-shadow-[0_0_15px_rgba(179,143,97,0.25)]"
          />
          
          {/* Título Principal */}
          <h1 className="font-heading font-bold text-3xl tracking-tighter text-primary">
            OF TRAINING
          </h1>
          
          {/* Linha de Assinatura Profissional */}
          <p className="text-[11px] text-primary/90 tracking-widest mt-1 uppercase font-medium">
            ORESTES FERNANDES | TREINADOR
          </p>
          <p className="text-[9px] text-muted-foreground tracking-wider uppercase">
            CONSULTORIA ESPORTIVA
          </p>
          
          {/* Detalhe de divisor em Bronze */}
          <div className="h-px w-8 bg-primary/40 mt-4"></div>
        </div>
      </header>

      {/* Área do Conteúdo Principal */}
      <main className="flex-1 container py-6 pb-24">
        <Outlet />
      </main>
    </div>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Injeção dinâmica da paleta de cores "Heavy Training"
  useEffect(() => {
    const styleId = "heavy-training-theme";
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      styleTag.innerHTML = `
        :root {
          --background: 0 0% 8% !important; /* #141414 */
          --foreground: 0 0% 95% !important;
          --card: 0 0% 11% !important; /* #1C1C1C */
          --card-foreground: 0 0% 95% !important;
          --popover: 0 0% 11% !important;
          --popover-foreground: 0 0% 95% !important;
          --primary: 35 40% 55% !important; /* #B38F61 - Bronze */
          --primary-foreground: 0 0% 95% !important;
          --secondary: 0 0% 18% !important;
          --secondary-foreground: 35 40% 75% !important;
          --border: 0 0% 20% !important;
          --input: 0 0% 20% !important;
          --muted: 0 0% 15% !important;
          --muted-foreground: 0 0% 65% !important;
          --accent: 35 40% 15% !important;
          --accent-foreground: 35 40% 95% !important;
          --ring: 35 40% 55% !important;
        }
        body {
          background-color: #141414 !important;
          color: #f2f2f2 !important;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#141414]">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-[#B38F61] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/train" element={<Train />} />
        <Route path="/progression" element={<Progression />} />
        <Route path="/bioimpedance" element={<BioimpedancePage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;