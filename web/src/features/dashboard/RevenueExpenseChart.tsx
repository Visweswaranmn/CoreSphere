import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { MonthlyPoint } from '@coresphere/shared';
import { formatCompactCurrency, formatCurrency } from '@/lib/format';

const REVENUE_COLOR = '#78a4cb';
const EXPENSE_COLOR = '#e0a02e';

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-xs shadow-lg">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 text-muted-fg">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-medium text-foreground">{formatCurrency(Number(entry.value))}</span>
        </p>
      ))}
    </div>
  );
}

export function RevenueExpenseChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={REVENUE_COLOR} stopOpacity={0.28} />
            <stop offset="100%" stopColor={REVENUE_COLOR} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.24} />
            <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--app-muted-fg)', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tick={{ fill: 'var(--app-muted-fg)', fontSize: 12 }}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--app-border)' }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={REVENUE_COLOR}
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke={EXPENSE_COLOR}
          strokeWidth={2}
          fill="url(#expenseFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
