import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/api/supabaseClient"; 
import { Dumbbell, TrendingUp, Activity, Calendar, ChevronRight, Flame } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  return (
    <Link to={to} className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-3">
        <p className="text-2xl font-heading font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-primary mt-1 font-medium">{sub}</p>}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Dispara as duas consultas ao mesmo tempo em paralelo, cortando o tempo pela metade
        const [workoutsResponse, sessionsResponse] = await Promise.all([
          supabase.from("workouts").select("id"),
          supabase.from("training_sessions").select("*").order("date", { ascending: false })
        ]);

        setWorkouts(workoutsResponse.data || []);
        setSessions(sessionsResponse.data || []);
      } catch (error) {
        console.error("Erro ao carregar dados do painel:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const streak = sessions.length; 
  const recentSessions = sessions.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-bold text-xl">Início</h2>
        <p className="text-sm text-muted-foreground">Monitore o seu desempenho e consistência</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Flame}
          label="Treinos Concluídos"
          value={streak ? `${streak} sessões` : "0"}
          sub={streak > 0 ? "Consistência ativa" : "Inicie sua jornada"}
          color="bg-orange-500/10 text-orange-500"
          to="/progression"
        />
        <StatCard
          icon={Dumbbell}
          label="Fichas de Treino"
          value={workouts.length}
          sub="Rotinas ativas"
          color="bg-primary/10 text-primary"
          to="/workouts"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm">Últimos Treinos</h3>
          <Link to="/progression" className="text-xs text-primary font-medium hover:underline">
            Ver tudo
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            Nenhuma sessão gravada no Supabase ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2 rounded-xl bg-secondary/30 border border-border/50">
                <div>
                  <p className="text-xs font-semibold">{s.workout_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(s.date + "T00:00:00"), "dd/MM/yy")}
                    {s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}
                  </p>
                </div>
                <div className="text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg">
                  {s.exercise_logs?.length || 0} ex.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/workouts"
          className="bg-primary text-primary-foreground rounded-2xl p-4 font-heading font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Dumbbell className="h-4 w-4" /> Novo Treino
        </Link>
        <Link
          to="/bioimpedance"
          className="bg-accent text-accent-foreground rounded-2xl p-4 font-heading font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Activity className="h-4 w-4" /> Nova Bio
        </Link>
      </div>
    </div>
  );
}