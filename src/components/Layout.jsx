import { Outlet, Link, useLocation } from "react-router-dom";
import { Dumbbell, LayoutDashboard, ClipboardList, TrendingUp, Activity } from "lucide-react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Início" },
  { path: "/workouts", icon: ClipboardList, label: "Treinos" },
  { path: "/progression", icon: TrendingUp, label: "Evolução" },
  { path: "/bioimpedance", icon: Activity, label: "Bio" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="font-heading font-bold text-lg tracking-tight">IronTrack</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border">
        <div className="max-w-5xl mx-auto flex justify-around items-center h-16 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}