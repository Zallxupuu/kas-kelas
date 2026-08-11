"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Download, FileText, ArrowLeft } from "lucide-react";
import { reportService } from "@/lib/services/reportService";
import { backupService } from "@/lib/services/backupService";
import { currencyFormatter } from "@/utils/formatters";
import Link from "next/link";

export default function LaporanPage() {
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [isExporting, setIsExporting] = useState(false);
  
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      const data = await reportService.getExpenseBreakdownByCategory(month, year);
      setBreakdown(data);
      
      const stats = await reportService.getMonthlyReport(month, year);
      setMonthlyStats(stats);
    };
    fetchData();
  }, [month, year]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await backupService.generateMonthlyReportPDF(month, year);
    } catch (e) {
      alert("Gagal export PDF");
    }
    setIsExporting(false);
  };

  const handleBackup = async () => {
    await backupService.exportDatabase();
  };

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="p-6 pt-12 space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="w-10 h-10 rounded-full bg-slate-800/50 text-slate-300 flex items-center justify-center shadow-inner">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">Laporan & Backup</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <select 
          className="flex-1 bg-slate-900/50 border-slate-700/50 rounded-2xl px-4 py-3 outline-none focus:border-brand-purple transition-all text-slate-200 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.4),inset_-4px_-4px_10px_rgba(255,255,255,0.03)]"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {months.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
        <select 
          className="w-32 bg-slate-900/50 border-slate-700/50 rounded-2xl px-4 py-3 outline-none focus:border-brand-purple transition-all text-slate-200 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.4),inset_-4px_-4px_10px_rgba(255,255,255,0.03)]"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[year - 1, year, year + 1].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Pemasukan Bulan Ini</p>
          <p className="font-bold text-income">{currencyFormatter(monthlyStats.income)}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Pengeluaran Bulan Ini</p>
          <p className="font-bold text-expense">{currencyFormatter(monthlyStats.expense)}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="font-semibold text-slate-300 mb-4">Rincian Pengeluaran</h3>
        
        {breakdown.length > 0 ? (
          <>
            <div className="h-48 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 30, 47, 0.8)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#f8fafc'
                    }} 
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category.name"
                  >
                    {breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.category.colorHex || '#3b82f6'} opacity={0.8} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3 mt-4">
              {breakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.category.colorHex || '#3b82f6' }} />
                    <span className="text-sm text-slate-400">{item.category.name}</span>
                  </div>
                  <span className="font-medium text-slate-200">{currencyFormatter(item.total)}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-slate-500">
            Belum ada pengeluaran bulan ini
          </div>
        )}
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard 
          className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors hover:bg-slate-700/50"
          onClick={handleExportPDF}
        >
          <div className="w-12 h-12 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(244,114,182,0.2)] border border-brand-pink/30">
            <FileText size={24} />
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-300">Export PDF</p>
            <p className="text-xs text-slate-500">Laporan Bulanan</p>
          </div>
        </GlassCard>

        <GlassCard 
          className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors hover:bg-slate-700/50"
          onClick={handleBackup}
        >
          <div className="w-12 h-12 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(34,211,238,0.2)] border border-brand-cyan/30">
            <Download size={24} />
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-300">Backup Data</p>
            <p className="text-xs text-slate-500">Export JSON</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
