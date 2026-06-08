import { useState, useEffect, useRef, useCallback } from "react";
// Alterado para conectar ao Supabase
import { supabase } from "@/api/supabaseClient"; 
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pause, Play, SkipForward, Dumbbell, Save, ArrowLeft, Timer } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Train() {
  const { id: workoutId } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  // Controle de estados do cronômetro global do treino
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Lista linear de exercícios do treino atual
  const [exercises, setExercises] = useState([]);
  const [currentExIndex, setCurrentExIndex] = useState(0);

  // Estrutura para salvar o progresso das séries digitadas pelo usuário
  const [logs, setLogs] = useState({});
  
  // Estado para capturar anotações da sessão de treino exigida pelo robô
  const [sessionNotes, setSessionNotes] = useState("");

  // Controle do cronômetro de descanso entre séries
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  const restTimerRef = useRef(null);

  // Carrega os detalhes do treino direto do Supabase
  useEffect(() => {
    async function loadWorkout() {
      try {
        const { data, error } = await supabase
          .from("workouts")
          .select("*")
          .eq("id", workoutId)
          .single();

        if (error) throw error;
        
        setWorkout(data);

        if (data && data.exercises && data.exercises.length > 0) {
          setExercises(data.exercises);
          
          // Inicializa a estrutura de logs vazia para cada série configurada no treino
          const initialLogs = {};
          data.exercises.forEach((ex) => {
            initialLogs[ex.exercise_id] = Array.from({ length: ex.sets || 4 }, (_, i) => ({
              set_number: i + 1,
              weight: "",
              reps: ex.reps || "12",
              done: false,
            }));
          });
          setLogs(initialLogs);
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar os dados deste treino");
        navigate("/workouts");
      } finally {
        setLoading(false);
      }
    }

    loadWorkout();
  }, [workoutId, navigate]);

  // Efeito do Cronômetro Global do Treino
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Gerenciador do Timer de Descanso
  const startRestTimer = useCallback((seconds) => {
    if (seconds <= 0) return;
    clearInterval(restTimerRef.current);
    
    setRestTimeLeft(seconds);
    setIsRestActive(true);

    restTimerRef.current = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(restTimerRef.current);
          setIsRestActive(false);
          toast.info("Descanso concluído! Próxima série. 💪", { duration: 4000 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => clearInterval(restTimerRef.current);
  }, []);

  // Formata os segundos do cronômetro para MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Atualiza os valores digitados de peso ou repetição de uma série específica
  function updateSetLog(exerciseId, setIndex, field, value) {
    setLogs((prev) => {
      const copy = { ...prev };
      const currentSets = [...(copy[exerciseId] || [])];
      currentSets[setIndex] = { ...currentSets[setIndex], [field]: value };
      copy[exerciseId] = currentSets;
      return copy;
    });
  }

  // Alterna o status de concluído (check verde) da série e engaja o timer de descanso
  function toggleSetDone(exerciseId, setIndex, defaultRestSeconds) {
    setLogs((prev) => {
      const copy = { ...prev };
      const currentSets = [...(copy[exerciseId] || [])];
      const targetSet = currentSets[setIndex];
      
      const newDone = !targetSet.done;
      currentSets[setIndex] = { ...targetSet, done: newDone };
      copy[exerciseId] = currentSets;

      // Ativa o cronômetro de descanso se a série foi marcada como feita
      if (newDone) {
        startRestTimer(defaultRestSeconds || 60);
      }

      return copy;
    });
  }

  // Envia e salva os dados da sessão realizada no Supabase
  async function finishSession() {
    setIsTimerRunning(false);

    const exerciseLogsPayload = exercises.map((ex) => {
      const totalSets = logs[ex.exercise_id] || [];
      return {
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        sets: totalSets.map((s) => ({
          set_number: s.set_number,
          weight: s.weight ? Number(s.weight) : 0,
          reps: s.reps ? Number(s.reps) : 0,
          done: s.done,
        })),
      };
    });

    // Unifica o carimbo de tempo padrão do sistema com os comentários manuais digitados
    const noteMeta = `Duração: ${formatTime(elapsedTime)}. ${sessionNotes.trim() ? `Anotações: ${sessionNotes}` : "Sem observações estruturadas."}`;

    const sessionPayload = {
      workout_id: workoutId,
      workout_name: workout.name,
      date: format(new Date(), "yyyy-MM-dd"),
      duration_minutes: Math.round(elapsedTime / 60),
      exercise_logs: exerciseLogsPayload,
      notes: noteMeta,
    };

    try {
      const { error } = await supabase
        .from("training_sessions")
        .insert([sessionPayload]);

      if (error) throw error;

      toast.success("Treino concluído e salvo no Supabase! Parabéns! 🔥");
      navigate("/workouts");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar histórico do treino no banco.");
      setIsTimerRunning(true);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!workout || exercises.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Dumbbell className="h-12 w-12 text-muted-foreground/30 mx-auto" />
        <p className="text-muted-foreground text-sm">Esta ficha não possui exercícios configurados.</p>
        <Button onClick={() => navigate("/workouts")} variant="outline" className="rounded-xl">Voltar</Button>
      </div>
    );
  }

  const currentExercise = exercises[currentExIndex];
  const currentSets = logs[currentExercise.exercise_id] || [];

  return (
    <div className="space-y-4 pb-16">
      {/* Top Header Navigation - Renomeado para alinhar ao script automatizado */}
      <div className="flex items-center justify-between border-b border-border pb-3 bg-background sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/workouts")} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h2 className="font-heading font-bold text-base line-clamp-1">{workout.name}</h2>
          <p className="text-[11px] text-muted-foreground">Executando rotina ativa</p>
        </div>
        <Button variant="success" size="sm" onClick={finishSession} className="rounded-xl shadow-sm font-semibold text-xs gap-1">
          <Save className="h-3.5 w-3.5" /> Finalizar Sessão
        </Button>
      </div>

      {/* Painel de Cronômetro e Descanso */}
      <div className="grid grid-cols-2 gap-2 bg-card border border-border rounded-2xl p-3 shadow-sm">
        <div className="flex flex-col justify-center items-center border-r border-border py-1">
          <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider mb-0.5">Tempo Total</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-bold tabular-nums text-foreground">{formatTime(elapsedTime)}</span>
            <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="text-muted-foreground hover:text-foreground">
              {isTimerRunning ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            </button>
          </div>
        </div>

        <div className={`flex flex-col justify-center items-center py-1 transition-colors rounded-xl ${isRestActive ? "bg-primary/5 animate-pulse" : ""}`}>
          <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider mb-0.5 flex items-center gap-1">
            <Timer className="h-3 w-3" /> Descanso ({currentExercise.rest_time || 60}s)
          </span>
          <span className={`font-mono text-xl font-bold tabular-nums ${isRestActive ? "text-primary scale-105 transition-transform" : "text-muted-foreground/60"}`}>
            {isRestActive ? `${restTimeLeft}s` : "00s"}
          </span>
        </div>
      </div>

      {/* Navegação entre os exercícios */}
      <div className="flex items-center justify-between gap-2 bg-secondary/30 rounded-xl p-2 border border-border">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg h-8 text-xs"
          disabled={currentExIndex === 0}
          onClick={() => setCurrentExIndex((p) => p - 1)}
        >
          Anterior
        </Button>
        <span className="text-xs font-semibold text-muted-foreground">
          Exercício {currentExIndex + 1} de {exercises.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg h-8 text-xs"
          disabled={currentExIndex === exercises.length - 1}
          onClick={() => setCurrentExIndex((p) => p + 1)}
        >
          Próximo
        </Button>
      </div>

      {/* Card do Exercício Atual focado */}
      <div className="bg-card border border-border rounded-3xl p-4 shadow-sm space-y-4">
        <div>
          <span className="text-[10px] bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Alvo atual
          </span>
          <h3 className="font-heading font-bold text-lg mt-1 text-foreground">{currentExercise.exercise_name}</h3>
          {currentExercise.notes && (
            <p className="text-xs text-primary font-medium italic mt-0.5">Nota de execução: {currentExercise.notes}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1"> Meta: {currentExercise.sets} séries x {currentExercise.reps} repetições </p>
        </div>

        {/* Listagem Interativa de Séries */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-2 text-center">Série</div>
            <div className="col-span-4 text-center">Carga (kg)</div>
            <div className="col-span-4 text-center">Reps</div>
            <div className="col-span-2 text-center">Feito</div>
          </div>

          <div className="space-y-1.5">
            {currentSets.map((set, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl border transition-all duration-200 ${
                  set.done ? "bg-primary/5 border-primary/20 opacity-80" : "bg-secondary/20 border-transparent"
                }`}
              >
                <div className="col-span-2 text-center font-mono font-bold text-sm text-muted-foreground">
                  {set.set_number}
                </div>

                <div className="col-span-4">
                  <Input
                    type="number"
                    pattern="\d*"
                    className="h-9 text-center font-semibold text-xs rounded-lg bg-background"
                    placeholder="0"
                    value={set.weight}
                    onChange={(e) => updateSetLog(currentExercise.exercise_id, idx, "weight", e.target.value)}
                  />
                </div>

                <div className="col-span-4">
                  <Input
                    type="text"
                    className="h-9 text-center font-semibold text-xs rounded-lg bg-background"
                    placeholder={currentExercise.reps || "12"}
                    value={set.reps}
                    onChange={(e) => updateSetLog(currentExercise.exercise_id, idx, "reps", e.target.value)}
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <Button
                    size="icon"
                    className={`h-8 w-8 rounded-lg shadow-sm transition-colors ${
                      set.done ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-background text-muted-foreground hover:text-foreground border border-border"
                    }`}
                    onClick={() => toggleSetDone(currentExercise.exercise_id, idx, currentExercise.rest_time)}
                  >
                    <Check className={`h-4 w-4 $ {set.done ? "stroke-[3px]" : "stroke-[1.5px]"}`} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Caixa de Texto para Observações Gerais Finais do Treino */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Anotações Finais da Sessão</label>
        <textarea
          className="w-full min-h-[70px] text-xs p-3 rounded-xl bg-secondary/20 border border-border focus:outline-none focus:border-primary text-foreground placeholder-muted-foreground/60 resize-none"
          placeholder="Ex: Treino muito produtivo, progredi carga no supino esternal..."
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
        />
      </div>

      {/* Botões de Ação do Rodapé (Para navegação contínua ou encerramento imediato) */}
      <div className="space-y-2">
        {currentExIndex < exercises.length - 1 ? (
          <Button
            className="w-full rounded-2xl h-11 text-xs font-semibold gap-1.5 shadow-sm"
            onClick={() => setCurrentExIndex((p) => p + 1)}
          >
            Próximo Exercício da Ficha <SkipForward className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant="success"
            className="w-full rounded-2xl h-11 text-xs font-bold gap-1.5 shadow-md uppercase tracking-wider"
            onClick={finishSession}
          >
            <Save className="h-4 w-4" /> Finalizar Sessão
          </Button>
        )}
      </div>
    </div>
  );
}