import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, TrendingUp, Activity } from "lucide-react";

// Importação da imagem original com fundo preto que você utilizou
import logo from "/logo-of.jpeg"; 

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "DASHBOARD" },
  { path: "/workouts", icon: ClipboardList, label: "TREINOS" },
  { path: "/progression", icon: TrendingUp, label: "PROGRESSO" },
  { path: "/bioimpedance", icon: Activity, label: "BIOIMPEDÂNCIA" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#f2f2f2] font-sans">
      
      {/* HEADER CENTRALIZADO PREMIUM */}
      <header className="relative pt-12 pb-8 bg-gradient-to-b from-[#121212] to-[#080808] border-b border-[#1A1A1A] shadow-2xl">
        <div className="container mx-auto flex flex-col items-center justify-center text-center px-4">
          
          {/* Imagem do Monograma Bronze Original */}
          <div className="relative mb-4">
            <img 
              src={logo} 
              alt="OF Monogram" 
              className="h-28 w-auto object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
            />
          </div>
          
          {/* Ajustado: Apenas TRAINING Centralizado e Imponente */}
          <h1 className="font-black text-4xl tracking-[0.08em] text-transparent bg-clip-text bg-gradient-to-b from-[#E5C494] to-[#B38F61] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
            TRAINING
          </h1>
          
          {/* Assinatura de Consultoria */}
          <p className="text-[11px] font-bold text-[#A6A6A6] tracking-[0.25em] mt-2.5 uppercase">
            ORESTES FERNANDES
          </p>
          <p className="text-[9px] font-medium text-[#666] tracking-[0.15em] mt-0.5 uppercase">
            TREINADOR <span className="text-[#B38F61]">|</span> CONSULTORIA ESPORTIVA
          </p>
          
          {/* Divisor de Acabamento */}
          <div className="flex items-center justify-center gap-2 mt-4 w-full max-w-[140px]">
            <div className="h-[1px] flex-1 bg-[#222]" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#B38F61] opacity-60" />
            <div className="h-[1px] flex-1 bg-[#222]" />
          </div>
        </div>
      </header>

      {/* PAINEL DO CONTEÚDO (GRÁFICOS SIMÉTRICOS) */}
      <main className="flex-1 container mx-auto max-w-md px-4 py-6 pb-32">
        <Outlet />
      </main>

      {/* MENU INFERIOR COMPACTO */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-md border-t border-[#1A1A1A] px-2">
        <div className="max-w-md mx-auto h-16 flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center justify-center flex-1 h-full relative"
              >
                {isActive && (
                  <div className="absolute top-0 w-8 h-[2px] bg-[#B38F61] shadow-[0_0_10px_#B38F61]" />
                )}
                <Icon className={`h-5 w-5 ${isActive ? "text-[#B38F61]" : "text-[#333]"}`} />
                <span className={`text-[8px] font-bold tracking-wider mt-1 ${isActive ? "text-[#B38F61]" : "text-[#333]"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}