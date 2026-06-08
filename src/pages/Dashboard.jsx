import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// Amostragem de dados calibrada para a escala dos mini-gráficos do smartphone
const barData = [
  { name: '16', value: 30 },
  { name: '17', value: 45 },
  { name: '18', value: 55 },
  { name: '20', value: 70 },
  { name: '21', value: 85 },
  { name: '22', value: 95 },
  { name: '23', value: 65 },
];

const loadData = [
  { name: '16', value: 180 },
  { name: '17', value: 200 },
  { name: '21', value: 190 },
  { name: '25', value: 220 },
  { name: '28', value: 240 },
  { name: '30', value: 290 },
];

const compositionData = [
  { name: '20', value: 22 },
  { name: '55', value: 20 },
  { name: '65', value: 18 },
  { name: '75', value: 16 },
  { name: '95', value: 15 },
  { name: '90', value: 14 },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto md:max-w-4xl px-1">
      
      {/* CARD 1: DASHBOARD (BARRAS EM BRONZE) */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4 shadow-2xl">
        <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#666] uppercase mb-3">DASHBOARD</h2>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#333" fontSize={9} tickLine={false} />
              <YAxis stroke="#333" fontSize={9} tickLine={false} axisLine={false} />
              <Bar dataKey="value" fill="#B38F61" radius={[2, 2, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD 2: ÚLTIMOS TREINOS */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4 shadow-2xl flex flex-col justify-between min-h-[162px]">
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#666] uppercase mb-4">ÚLTIMOS TREINOS</h2>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-[#161616] pb-1.5">
              <span className="text-[#dcdcdc]">Treino 1</span>
              <span className="text-[#B38F61] font-bold">10/20</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#161616] pb-1.5">
              <span className="text-[#dcdcdc]">Treino 2</span>
              <span className="text-[#B38F61] font-bold">12/25</span>
            </div>
            <div className="flex justify-between items-center pb-0.5">
              <span className="text-[#dcdcdc]">Treino 3</span>
              <span className="text-[#B38F61] font-bold">10/29</span>
            </div>
          </div>
        </div>
        
        {/* Marcadores de paginação do layout mobile */}
        <div className="flex justify-center items-center gap-1.5 mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B38F61]" />
          <span className="w-1 h-1 rounded-full bg-[#262626]" />
          <span className="w-1 h-1 rounded-full bg-[#262626]" />
        </div>
      </div>

      {/* CARD 3: PROGRESSO DE CARGAS */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4 shadow-2xl">
        <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#666] uppercase mb-3">PROGRESSO DE CARGAS</h2>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={loadData} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#333" fontSize={9} tickLine={false} />
              <YAxis stroke="#333" fontSize={9} tickLine={false} axisLine={false} />
              <Line type="monotone" dataKey="value" stroke="#B38F61" strokeWidth={2} dot={{ r: 2, fill: '#B38F61', strokeWidth: 0 }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD 4: COMPOSIÇÃO CORPORAL */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4 shadow-2xl">
        <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#666] uppercase mb-3">COMPOSIÇÃO CORPORAL</h2>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={compositionData} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#333" fontSize={9} tickLine={false} />
              <YAxis stroke="#333" fontSize={9} tickLine={false} axisLine={false} />
              <Line type="monotone" dataKey="value" stroke="#B38F61" strokeWidth={1.5} dot={{ r: 2, fill: '#B38F61', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}