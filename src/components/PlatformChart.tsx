import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PlatformData {
  platform: string;
  active: number;
  inactive: number;
  error: number;
  total: number;
}

interface PlatformChartProps {
  data: PlatformData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
            <span className="font-medium text-foreground">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function PlatformChart({ data }: PlatformChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" vertical={false} />
          <XAxis
            dataKey="platform"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(222 30% 14% / 0.5)' }} />
          <Bar dataKey="active" stackId="a" fill="hsl(142 76% 45%)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="inactive" stackId="a" fill="hsl(38 92% 50%)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="error" stackId="a" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
