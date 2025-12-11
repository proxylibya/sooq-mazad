import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Props {
  data: Array<{
    date: string;
    amount: number;
    orders: number;
    profit: number;
  }>;
}

export default function RevenuePerformanceChart({ data }: Props) {
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
            labelStyle={{ color: '#cbd5e1' }}
            formatter={(value: number, name) => {
              if (name === 'amount' || name === 'profit')
                return [`$${value.toLocaleString()}`, name === 'amount' ? 'الإيراد' : 'الربح'];
              return [value, name === 'orders' ? 'الطلبات' : name];
            }}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="amount"
            name="الإيراد"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#revArea)"
            fillOpacity={1}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="profit"
            name="الربح"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
          <Bar
            yAxisId="right"
            dataKey="orders"
            name="الطلبات"
            barSize={28}
            fill="#38bdf8"
            radius={[6, 6, 4, 4]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
