import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient"; 
import { Plus, Trash2, Dumbbell, Play, ChevronDown, ChevronUp, Timer, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// IMPORTAÇÃO DA BIBLIOTECA CENTRALIZADA EXCLUSIVA
import { getMuscleMapping } from "@/config/exerciseLibrary";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState(null);

  const [wName, setWName] = useState("");
  const [wExercises, setWExercises] = useState([]);

  const [editingExIdx, setEditingExIdx] = useState(null);
  const [exName, setExName] = useState("");
  const [exSets, setExSets] = useState(4);
  const [exReps, setExReps] = useState("12");
  const [exRestTime, setExRestTime] = useState(60);
  
  const [exGroup, setExGroup] = useState("");
  const [exSubgroup, setExSubgroup] = useState("");
  const [exNotes, setExNotes] = useState(""); 

  useEffect(() => {
    loadWorkouts();
  }, []);

  // DISPARADOR DA BIBLIOTECA ISOLADA ANATÔMICA
  useEffect(() => {
    const { group, subgroup } = getMuscleMapping(exName);
    setExGroup(group);
    setExSubgroup(subgroup);
  }, [exName]);

  async function loadWorkouts() {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar treinos");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveWorkout() {
    if (!wName.trim()) return toast.error("O nome do treino é obrigatório");
    if (wExercises.length === 0) return toast.error("Adicione pelo menos um exercício antes de salvar");
    
    const payload = {
      name: wName,
      muscle_group: wExercises[0]?.main_muscle || null,
      muscle_subgroup: wExercises[0]?.sub_muscle || null,
      description: null,
      exercises: wExercises
    };

    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      setWorkouts((prev) => [data, ...prev]);
      setOpenAdd(false);
      resetWorkoutForm();
      toast.success("Treino criado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar o treino");
    }
  }

  async function handleDeleteWorkout(id, e) {
    e.stopPropagation();
    if (!confirm("Deseja realmente excluir este treino?")) return;

    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      toast.success("Treino removido");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover treino");
    }
  }

  function resetWorkoutForm() {
    setWName("");
    setWExercises([]);
    resetExForm();
  }

  function resetExForm() {
    setEditingExIdx(null);
    setExName("");
    setExSets(4);
    setExReps("12");
    setExRestTime(60);
    setExGroup("");
    setExSubgroup("");
    setExNotes(""); 
  }

  function saveItem() {
    if (!exName.trim()) return toast.error("Nome do exercício é obrigatório");
    
    const item = {
      exercise_id: editingExIdx !== null ? wExercises[editingExIdx].exercise_id : Math.random().toString(36).substring(2, 9),
      exercise_name: exName,
      sets: Number(exSets),
      reps: exReps,
      exercise_time: 0,
      rest_time: Number(exRestTime),
      main_muscle: exGroup,
      sub_muscle: exSubgroup,
      notes: exNotes 
    };

    if (editingExIdx !== null) {
      const copy = [...wExercises];
      copy[editingExIdx] = item;
      setWExercises(copy);
    } else {
      setWExercises((p) => [...p, item]);
    }
    resetExForm();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Fichas de Treino</h2>
          <p className="text-sm text-muted-foreground">Monte suas rotinas de musculação</p>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl gap-1.5" onClick={resetWorkoutForm}>
              <Plus className="h-4 w-4" /> Criar Treino
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Nova Ficha de Treino</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nome do Treino</label>
                <Input placeholder="Ex: Treino A - Costas" value={wName} onChange={(e) => setWName(e.target.value)} />
              </div>

              {/* Lista de Exercícios Adicionados */}
              <div className="space-y-2 pt-2 border-t border-border">
                {wExercises.length > 0 && (
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Exercícios Adicionados ({wExercises.length})
                  </h4>
                )}
                
                {wExercises.map((ex, idx) => (
                  <div key={ex.exercise_id} className="flex items-center justify-between bg-secondary/50 rounded-xl p-2.5 text-xs border border-border">
                    <div className="space-y-0.5">
                      <p className="font-semibold">{ex.exercise_name}</p>
                      <div className="flex flex-wrap gap-1 my-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium">{ex.main_muscle}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">{ex.sub_muscle}</span>
                      </div>
                      {ex.notes && (
                        <p className="text-[11px] text-primary italic font-medium">Nota: {ex.notes}</p>
                      )}
                      <p className="text-muted-foreground text-[11px]">
                        {ex.sets}x {ex.reps} {ex.rest_time > 0 && `• ${ex.rest_time}s desc.`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setEditingExIdx(idx);
                        setExName(ex.exercise_name);
                        setExSets(ex.sets);
                        setExReps(ex.reps);
                        setExRestTime(ex.rest_time);
                        setExGroup(ex.main_muscle);
                        setExSubgroup(ex.sub_muscle);
                        setExNotes(ex.notes || "");
                      }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setWExercises(p => p.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Bloco de Formulário do Exercício Embutido Permanente */}
                <div className="bg-secondary/30 rounded-2xl p-3 border border-border space-y-3 mt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Nome do Exercício</label>
                    <Input className="h-9 text-xs rounded-xl" placeholder="Ex: Supino Inclinado com Halteres" value={exName} onChange={(e) => setExName(e.target.value)} />
                  </div>

                  {/* Feedback Visual Anatômico */}
                  <div className="grid grid-cols-2 gap-2 bg-secondary/60 p-2 rounded-xl border border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">Músculo Principal</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{exGroup || "Aguardando..."}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">Subgrupo Muscular</p>
                      <p className="text-xs font-semibold text-primary mt-0.5">{exSubgroup || "Aguardando..."}</p>
                    </div>
                  </div>

                  {/* Campo de Anotações Exclusivas para os Testes */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Anotações / Notas do Exercício</label>
                    <Input 
                      className="h-9 text-xs rounded-xl" 
                      placeholder="Ex: Foco na cadência excêntrica lenta" 
                      value={exNotes} 
                      onChange={(e) => setExNotes(e.target.value)} 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Séries</label>
                      <Input type="number" className="h-9 text-xs rounded-xl" value={exSets} onChange={(e) => setExSets(Number(e.target.value))} min={1} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Repetições</label>
                      <Input className="h-9 text-xs rounded-xl" value={exReps} onChange={(e) => setExReps(e.target.value)} placeholder="12" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Descanso (s)</label>
                      <Input type="number" className="h-9 text-xs rounded-xl" value={exRestTime} onChange={(e) => setExRestTime(Number(e.target.value))} min={0} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button className="flex-1 rounded-xl gap-1.5" onClick={saveItem} size="sm">
                      <Check className="h-4 w-4" /> {editingExIdx !== null ? "Salvar Alterações" : "Adicionar Exercício"}
                    </Button>
                    {editingExIdx !== null && (
                      <Button variant="outline" className="rounded-xl" onClick={resetExForm} size="sm">
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Button className="w-full rounded-xl mt-4" onClick={handleSaveWorkout}>
                Salvar Ficha de Treino
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
          <Dumbbell className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground mt-3 text-sm">Nenhuma ficha de treino cadastrada localmente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => {
            const isExpanded = expandedWorkout === w.id;
            return (
              <div key={w.id} className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200">
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/20" onClick={() => setExpandedWorkout(isExpanded ? null : w.id)}>
                  <div className="space-y-0.5">
                    <h3 className="font-heading font-bold text-base">{w.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{w.exercises?.length || 0} exercícios estruturados</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link to={`/train/${w.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 shadow-sm">
                        <Play className="h-4 w-4 fill-current text-primary-foreground" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={(e) => handleDeleteWorkout(w.id, e)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-border bg-secondary/10 space-y-2">
                    {w.exercises && w.exercises.length > 0 ? (
                      <div className="divide-y divide-border">
                        {w.exercises.map((ex, i) => (
                          <div key={ex.exercise_id || i} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">{ex.exercise_name}</p>
                                <span className="text-[9px] px-1.5 py-0.1 rounded bg-secondary text-muted-foreground">{ex.main_muscle}</span>
                                <span className="text-[9px] text-primary font-medium">({ex.sub_muscle})</span>
                              </div>
                              {ex.notes && (
                                <p className="text-[11px] text-primary italic font-medium mt-0.5">Instrução: {ex.notes}</p>
                              )}
                              <div className="flex items-center gap-3 text-muted-foreground mt-1">
                                <span className="font-medium text-primary">{ex.sets} séries x {ex.reps} repetições</span>
                                {ex.rest_time > 0 && (
                                  <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {ex.rest_time}s</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-2">Nenhum exercício adicionado a este treino.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}