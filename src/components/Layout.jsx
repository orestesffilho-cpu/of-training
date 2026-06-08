import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, TrendingUp, Activity } from "lucide-react";

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
          
          {/* MONOGRAMA "OF" EM BRONZE RENDERIZADO DIRETAMENTE VIA VETOR PURE SVG (SEM FUNDO BRANCO) */}
          <div className="relative mb-5 w-28 h-28 flex items-center justify-center">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
              style={{ filter: 'drop-shadow(0px 0px 12px rgba(179,143,97,0.25))' }}
            >
              <defs>
                {/* Gradiente Bronze Metálico Premium idêntico ao modelo */}
                <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E5C494" />
                  <stop offset="50%" stopColor="#B38F61" />
                  <stop offset="100%" stopColor="#8C663E" />
                </linearGradient>
              </defs>
              
              {/* Letra O Chanfrada */}
              <path 
                d="M15 25 L45 25 L45 75 L15 75 Z" 
                fill="none" 
                stroke="url(#bronzeGradient)" 
                strokeWidth="7" 
                strokeLinejoin="miter"
              />
              <path 
                d="M22 32 L38 32 L38 68 L22 68 Z" 
                fill="none" 
                stroke="url(#bronzeGradient)" 
                strokeWidth="3" 
                strokeLinejoin="miter"
              />
              
              {/* Letra F Integrada */}
              <path 
                d="M52 75 L52 25 L85 25 M52 46 L78 46" 
                fill="none" 
                stroke="url(#bronzeGradient)" 
                strokeWidth="7" 
                strokeLinecap="square" 
                strokeLinejoin="miter"
              />
              <path 
                d="M59 32 L59 39 M59 53 L59 75" 
                fill="none" 
                stroke="url(#bronzeGradient)" 
                strokeWidth="2"
              />
            </svg>
          </div>
          
          {/* TITULAÇÃO OFICIAL */}
          <h1 className="font-black text-4xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#E5C494] to-[#B38F61] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            OF TRAINING
          </h1>
          
          <p className="text-[11px] font-bold text-[#A6A6A6] tracking-[0.25em] mt-2 uppercase">
            ORESTES FERNANDES <span className="text-[#B38F61]">|</span> TREINADOR
          </p>
          <p className="text-[9px] font-medium text-[#666] tracking-[0.15em] mt-0.5 uppercase">
            CONSULTORIA ESPORTIVA
          </p>
          
          {/* Detalhe de acabamento */}
          <div className="flex items-center justify-center gap-2 mt-4 w-full max-w-[140px]">
            <div className="h-[1px] flex-1 bg-[#222]" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#B38F61] opacity-60" />
            <div className="h-[1px] flex-1 bg-[#222]" />
          </div>
        </div>
      </header>

      {/* PAINEL DOS GRÁFICOS */}
      <main className="flex-1 container mx-auto max-w-md px-4 py-6 pb-32">
        <Outlet />
      </main>

      {/* MENU INFERIOR COMPACTO DE ALTA PERFORMANCE */}
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