import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface AuctionDistributionChartProps {
  data?: any[];
}

export default function AuctionDistributionChart({ data }: AuctionDistributionChartProps) {
  // Mock data if none provided
  const chartData = data || [
    { name: 'Active', value: 400 },
    { name: 'Pending', value: 300 },
    { name: 'Completed', value: 300 },
    { name: 'Cancelled', value: 200 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
