import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/format';
import type { CategorySlice } from './sampleData';

export function CategoryChart({ data }: { data: CategorySlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-fg">Total</span>
          <span className="text-sm font-semibold text-foreground">{formatCurrency(total)}</span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {data.map((slice) => (
          <li key={slice.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-fg">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} />
              {slice.name}
            </span>
            <span className="font-medium text-foreground">{formatCurrency(slice.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
