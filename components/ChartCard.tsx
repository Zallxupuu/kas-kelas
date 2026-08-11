"use client";

import { GlassCard } from "./ui/GlassCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { currencyFormatter } from "@/utils/formatters";

interface ChartCardProps {
  data: { date: string; balance: number; income: number; expense: number }[];
  title?: string;
}

export function ChartCard({ data, title }: ChartCardProps) {
  return (
    <GlassCard className="p-5 h-64 flex flex-col bg-slate-900/40">
      {title && <h3 className="font-semibold text-slate-300 mb-4">{title}</h3>}
      
      <div className="flex-1 w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickMargin={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(val) => `${(val / 1000)}k`}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              formatter={(value: any, name: any) => [currencyFormatter(value as number), name === 'income' ? 'Pemasukan' : name === 'expense' ? 'Pengeluaran' : 'Saldo']}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '12px' }}
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#f8fafc',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="income" fill="#FBBF24" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="expense" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
