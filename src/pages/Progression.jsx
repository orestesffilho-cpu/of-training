import { useState, useEffect, useMemo } from "react";
// Conexão alterada para o Supabase
import { supabase } from "@/api/supabaseClient"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { TrendingUp, Calendar, Dumbbell, Award, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { format } from "date-fns";

export default function Progression() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("exercicios"); // "exercicios" | "volume" | "historico"
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        const { data, error } = await supabase
          .from("training_sessions")
          .select("*")
          .order("date", { ascending: true }); // Ordenado do mais antigo ao mais recente para gráficos corretos

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error("Erro ao carregar sessões de progressão:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  // Filtra nomes únicos de exercícios que contêm registros válidos de carga
  const exerciseNames = useMemo(() => {
    const names = new Set();
    sessions.forEach((s) =>
      (s.exercise_logs || []).forEach((l) => {
        const hasWeight = (l.sets || []).some((set) => (set.weight || 0) > 0);
        if (hasWeight && l.exercise_name) {
          names.add(l.exercise_name);
        }
      })
    );
    const list = Array.from(names).sort();
    if (list.length > 0 && !selectedExercise) {
      setSelectedExercise(list[0]);
    }
    return list;
  }, [sessions, selectedExercise]);

  // Estrutura os pontos históricos do gráfico para o exercício selecionado
  const exerciseChartData = useMemo(() => {
    if (!selectedExercise) return [];
    const points = [];
    sessions.forEach((s) => {
      const match = (s.exercise_logs || []).find(
        (l) => l.exercise_name === selectedExercise
      );
      if (match) {
        const weights = (match.sets || []).map((set) => set.weight || 0);
        const maxW = Math.max(...weights, 0);
        if (maxW > 0) {
          points.push({
            dateLabel: format(new Date(s.date + "T00:00:00"), "dd/MM"),
            rawDate: s.date,
            "Carga Máxima (kg)": maxW,
          });
        }
      }
    });
    return points;
  }, [sessions, selectedExercise]);

  // Calcula estatísticas comparativas de evolução de carga (atual vs inicial)
  const stats = useMemo(() => {
    if (exerciseChartData.length === 0) return null;
    const initial = exerciseChartData[0]["Carga Máxima (kg)"];
    const current = exerciseChartData[exerciseChartData.length - 1]["Carga Máxima (kg)"];
    const diff = current - initial;
    return { initial, current, diff };
  }, [exerciseChartData]);

  // Compila o volume de séries semanal acumulado por treino
  const volumeData = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const name = s.workout_name || "Outro";
      let totalSets = 0;
      (s.exercise_logs || []).forEach((l) => {
        totalSets += (l.sets || []).filter((st) => st.done).length || l.sets?.length || 0;
      });
      map[name] = (map[name] || 0) + totalSets;
    });
    return Object.keys(map).map((k) => ({ name: k, "Total de Séries": map[k] }));
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-bold text-xl">Progressão</h2>
        <p className="text-sm text-muted-foreground">Monitore sua evolução de carga e treinos</p>
      </div>

      {/* Abas Superiores */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1">
        {[
          { id: "exercicios", label: "Cargas" },
          { id: "volume", label: "Volume" },
          { id: "historico", label: "Histórico" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
              activeTab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Aba de Evolução de Cargas */}
      {activeTab === "exercicios" && (
        <div className="space-y-4">
          {exerciseNames.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-8">Nenhum log de carga registrado nas sessões.</p>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Selecione o Exercício</label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger className="w-full rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {exerciseNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {stats && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-card border rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Inicial</p>
                    <p className="text-base font-bold font-mono mt-0.5">{stats.initial} kg</p>
                  </div>
                  <div className="bg-card border rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Atual</p>
                    <p className="text-base font-bold font-mono mt-0.5">{stats.current} kg</p>
                  </div>
                  <div className="bg-card border rounded-xl p-2.5 text-center flex flex-col justify-center items-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Evolução</p>
                    <div className="flex items-center gap-0.5 mt-0.5 text-xs font-bold">
                      {stats.diff > 0 ? (
                        <span className="text-primary flex items-center"><ArrowUp className="h-3 w-3 mr-0.5" />+{stats.diff}kg</span>
                      ) : stats.diff < 0 ? (
                        <span className="text-destructive flex items-center"><ArrowDown className="h-3 w-3 mr-0.5" />{stats.diff}kg</span>
                      ) : (
                        <span className="text-muted-foreground flex items-center"><Minus className="h-3 w-3 mr-0.5" />Estável</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-card border rounded-2xl p-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={exerciseChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={["dataMin - 4", "dataMax + 4"]} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }} />
                      <Line type="monotone" dataKey="Carga Máxima (kg)" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--chart-1))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Aba de Volume de Séries Completadas */}
      {activeTab === "volume" && (
        <div className="space-y-4">
          <div className="bg-card border rounded-2xl p-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><Award className="h-4 w-4 text-primary" /> Séries Totais por Rotina</h3>
            {volumeData.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground py-6">Nenhum volume calculado.</p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "11px" }} />
                    <Bar dataKey="Total de Séries" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aba do Histórico Detalhado */}
      {activeTab === "historico" && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-card border border-dashed rounded-2xl">
              <Dumbbell className="h-10 w-10 text-muted-foreground/20 mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">Nenhum treino salvo no banco.</p>
            </div>
          ) : (
            // Lista invertida para apresentar os treinos mais recentes no topo do histórico
            [...sessions].reverse().map((s) => (
              <div key={s.id} className="bg-card border rounded-2xl p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{s.workout_name}</p>\n                    <p className="text-xs text-muted-foreground">
                      {format(new Date(s.date + "T00:00:00"), "dd/MM/yyyy")}
                      {s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg shrink-0">{s.exercise_logs?.length || 0} ex.</span>
                </div>

                {(s.exercise_logs || []).length > 0 && (
                  <div className="mt-1 space-y-1.5 border-t border-border/50 pt-2 pl-2">
                    {s.exercise_logs.map((log, i) => {
                      const maxW = Math.max(...(log.sets || []).map((set) => set.weight || 0), 0);
                      return (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground truncate max-w-[75%]">· {log.exercise_name}</span>
                          {maxW > 0 && <span className="font-mono font-bold text-foreground bg-secondary/50 px-1.5 py-0.5 rounded text-[10px]">{maxW} kg</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}