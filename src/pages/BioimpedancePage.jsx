import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/api/supabaseClient"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Activity, TrendingDown, TrendingUp, Scale, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ALL_FIELDS = [
  { key: "weight", label: "Peso (kg)", color: "hsl(var(--chart-1))" },
  { key: "body_fat_percent", label: "Gordura Corporal (%)", color: "hsl(var(--chart-5))" },
  { key: "muscle_mass", label: "Músculo Esquelético (kg)", color: "hsl(var(--chart-2))" },
  { key: "body_water", label: "Água Corporal (%)", color: "hsl(var(--chart-4))" },
  { key: "bmi", label: "IMC", color: "hsl(var(--chart-3))" },
  { key: "visceral_fat", label: "Gordura Visceral", color: "hsl(var(--destructive))" },
  { key: "bone_mass", label: "Sal Inorgânico / Ósseo (kg)", color: "hsl(var(--muted-foreground))" },
  { key: "basal_metabolism", label: "Met. Basal (kcal)", color: "hsl(var(--accent))" },
];

const INITIAL_FORM = {
  date: format(new Date(), "yyyy-MM-dd"),
  weight: "",
  body_fat_percent: "",
  muscle_mass: "",
  body_water: "",
  bmi: "",
  visceral_fat: "",
  bone_mass: "",
  basal_metabolism: "",
  notes: "",
};

export default function BioimpedancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("evolucao");
  const [selectedMetrics, setSelectedMetrics] = useState(["weight", "body_fat_percent", "muscle_mass"]);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data, error } = await supabase
        .from("bioimpedance")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      // @ts-ignore
      setRecords(data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  // @ts-ignore
  async function handleSave(e) {
    e.preventDefault();
    
    if (!form.weight || String(form.weight).trim() === "") {
      return toast.error("Por favor, insira o peso.");
    }

    // @ts-ignore
    const parseNumberValue = (val) => {
      if (val === undefined || val === null || String(val).trim() === "") return null;
      const cleaned = String(val).replace(",", "."); 
      const parsed = Number(cleaned);
      return isNaN(parsed) ? null : parsed;
    };

    const payload = { 
      date: form.date, 
      notes: form.notes && form.notes.trim() !== "" ? form.notes.trim() : null,
      weight: Number(String(form.weight).replace(",", ".")),
      body_fat_percent: parseNumberValue(form.body_fat_percent),
      muscle_mass: parseNumberValue(form.muscle_mass),
      body_water: parseNumberValue(form.body_water),
      bmi: parseNumberValue(form.bmi),
      visceral_fat: parseNumberValue(form.visceral_fat),
      bone_mass: parseNumberValue(form.bone_mass),
      basal_metabolism: parseNumberValue(form.basal_metabolism),
    };

    try {
      toast.loading("Enviando dados para o Supabase...", { id: "save-bio" });
      
      const { data: insertedData, error } = await supabase
        .from("bioimpedance")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // @ts-ignore
      setRecords((prev) => [...prev, insertedData].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowAdd(false);
      setForm(INITIAL_FORM);
      toast.success("Registro de bioimpedância salvo com sucesso!", { id: "save-bio" });
    } catch (error) {
      console.error("Erro completo ao salvar:", error);
      // @ts-ignore
      toast.error(`Falha ao salvar: ${error.message || "Verifique a conexão"}`, { id: "save-bio" });
    }
  }

  // @ts-ignore
  async function deleteRecord(id) {
    if (!confirm("Deseja realmente remover este registro?")) return;
    try {
      const { error } = await supabase.from("bioimpedance").delete().eq("id", id);
      if (error) throw error;
      // @ts-ignore
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success("Registro removido");
    } catch (error) {
      console.error(error);
    }
  }

  const chartData = useMemo(() => {
    return records.map((r) => ({
      // @ts-ignore
      ...r,
      // @ts-ignore
      dateLabel: format(new Date(r.date + "T00:00:00"), "dd/MM"),
    }));
  }, [records]);

  const stats = useMemo(() => {
    if (records.length === 0) return { currentWeight: 0, currentFat: 0, currentMuscle: 0 };
    // @ts-ignore
    const latest = records[records.length - 1];
    return {
      currentWeight: latest.weight || 0,
      currentFat: latest.body_fat_percent || 0,
      currentMuscle: latest.muscle_mass || 0,
    };
  }, [records]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Bioimpedância</h2>
          <p className="text-sm text-muted-foreground">Acompanhe sua composição corporal</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <
// @ts-ignore
            Button size="sm" className="rounded-xl gap-1.5" onClick={() => setForm(INITIAL_FORM)}>
              <Plus className="h-4 w-4" /> Nova
            </Button>
          </DialogTrigger>
          <
// @ts-ignore
          DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <
// @ts-ignore
            DialogHeader>
              <
// @ts-ignore
              DialogTitle className="font-heading">Registrar Bioimpedância</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSave} className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Data</label>
                <Input 
// @ts-ignore
                type="date" className="mt-1" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Peso (kg) *</label>
                  <Input 
// @ts-ignore
                  type="text" className="mt-1" value={form.weight} onChange={(e) => setForm(p => ({ ...p, weight: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Gordura Corporal (%)</label>
                  <Input 
// @ts-ignore
                  type="text" className="mt-1" value={form.body_fat_percent} onChange={(e) => setForm(p => ({ ...p, body_fat_percent: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Músculo Esquelético (kg)</label>
                  <Input 
// @ts-ignore
                  type="text" className="mt-1" value={form.muscle_mass} onChange={(e) => setForm(p => ({ ...p, muscle_mass: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Água Corporal (%)</label>
                  <Input 
// @ts-ignore
                  type="text" className="mt-1" value={form.body_water} onChange={(e) => setForm(p => ({ ...p, body_water: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">IMC</label>
                  <Input 
// @ts-ignore
                  type="text" className="mt-1" value={form.bmi} onChange={(e) => setForm(p => ({ ...p, bmi: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Gordura Visceral</label>
                  <Input 
// @ts-ignore
                  type="text" className="mt-1" value={form.visceral_fat} onChange={(e) => setForm(p => ({ ...p, visceral_fat: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Sal Inorgânico / Ósseo (kg)</label>
                  <Input 
// @ts-ignore
                  type="text" className="mt-1" value={form.bone_mass} onChange={(e) => setForm(p => ({ ...p, bone_mass: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Metabolismo Basal (kcal)</label>
                  <Input 
// @ts-ignore
                  type="text" className="mt-1" value={form.basal_metabolism} onChange={(e) => setForm(p => ({ ...p, basal_metabolism: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Observações</label>
                <Input 
// @ts-ignore
                className="mt-1" value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Ex: em jejum, pós-treino..." />
              </div>
              <
// @ts-ignore
              Button type="submit" className="w-full rounded-xl mt-2">
                Salvar Registro
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
          <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground mt-3 text-sm">Nenhum registro localizado</p>
          <
// @ts-ignore
          Button size="sm" className="mt-4 rounded-xl" onClick={() => { setForm(INITIAL_FORM); setShowAdd(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Primeiro registro
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Peso" value={`${stats.currentWeight} kg`} icon={Scale} />
            <MetricCard label="Gordura" value={stats.currentFat ? `${stats.currentFat}%` : "—"} icon={TrendingDown} />
            <MetricCard label="Músculo" value={stats.currentMuscle ? `${stats.currentMuscle} kg` : "—"} icon={TrendingUp} />
          </div>

          <div className="flex gap-1 bg-secondary rounded-xl p-1">
            {[{ id: "evolucao", label: "Evolução" }, { id: "historico", label: "Histórico" }].map((t) => (
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

          {activeTab === "evolucao" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {ALL_FIELDS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() =>
                      setSelectedMetrics((prev) =>
                        prev.includes(m.key) ? prev.filter((k) => k !== m.key) : [...prev, m.key]
                      )
                    }
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      selectedMetrics.includes(m.key) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {m.label.split(" ")[0]}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {selectedMetrics.map((key) => {
                  const metric = ALL_FIELDS.find((m) => m.key === key);
                  const metricData = chartData.filter((d) => d[key] != null);
                  if (metricData.length === 0) return null;
                  return (
                    <div key={key} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                      <p className="text-xs font-semibold mb-2" style={{ color: 
// @ts-ignore
                      metric.color }}>{metric.label}</p>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={metricData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="dateLabel" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} domain={["dataMin - 1", "dataMax + 1"]} />
                            <Tooltip />
                            <Line type="monotone" dataKey={key} stroke={
// @ts-ignore
                            metric.color} strokeWidth={2.5} connectNulls />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "historico" && (
            <div className="space-y-2">
              {[...records].reverse().map((r) => (
                <div key={r.
// @ts-ignore
                id} className="bg-card rounded-xl border border-border p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{format(new Date(r.
// @ts-ignore
                    date + "T00:00:00"), "dd/MM/yyyy")}</p>
                    <
// @ts-ignore
                    Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRecord(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {ALL_FIELDS.map((f) => {
                      // @ts-ignore
                      const val = r[f.key];
                      if (val == null) return null;
                      return (
                        <div key={f.key} className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{f.label}</span>
                          <span className="font-semibold">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// @ts-ignore
function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-card rounded-xl border border-border p-3 text-center shadow-sm">
      <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
      <p className="text-base font-heading font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}