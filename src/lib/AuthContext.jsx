import React, { createContext, useState, useContext, useEffect } from 'react';
// Importação limpa conectando ao conector padrão do projeto
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Simulamos um usuário ativo padrão para destravar as telas locais do app
  const [user, setUser] = useState({ id: "local-user", name: "Orestes" });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: "local-app", status: "ready" });

  useEffect(() => {
    // Mantemos a função viva apenas para compatibilidade de carregamento do app
    checkAppState();
  }, []);

  const checkAppState = async () => {
    setIsLoadingPublicSettings(true);
    setAuthError(null);
    setIsLoadingAuth(false);
    setIsAuthenticated(true);
    setIsLoadingPublicSettings(false);
  };

  const logout = () => {
    // Limpa os estados locais se você clicar em sair
    setUser(null);
    setIsAuthenticated(false);
    toast.info("Sessão local encerrada.");
  };

  const navigateToLogin = () => {
    console.log("Modo local: login automático ativo.");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};