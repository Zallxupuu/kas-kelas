"use client";

import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { currencyFormatter } from "@/utils/formatters";
import { ArrowDown, ArrowUp, Bell, Plus, Minus, FileText, Download, ChevronRight, TriangleAlert, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { reportService } from "@/lib/services/reportService";
import { supabase } from "@/lib/supabase";

import Link from "next/link";
import { ChartCard } from "@/components/ChartCard";

export default function DashboardPage() {
  const { currentBalance, transactions } = useStore();
  const { user } = useAuthStore();
  const [chartData, setChartData] = useState<any[]>([]);
  const [userKasTotal, setUserKasTotal] = useState<number>(0);

  useEffect(() => {
    if (user?.role === 'anggota') {
      const fetchUserKas = async () => {
        const { data } = await supabase
          .from('transactions')
          .select('amount')
          .eq('userId', user.id)
          .eq('type', 'income');
        
        if (data) {
          setUserKasTotal(data.reduce((sum, t) => sum + t.amount, 0));
        }
      };
      fetchUserKas();
    }
  }, [user]);

  useEffect(() => {
    const fetchTrend = async () => {
      const data = await reportService.getCashFlowByPeriod();
      setChartData(data);
    };
    fetchTrend();
  }, [transactions]);

  const now = new Date();
  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const thisMonthIncome = thisMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const thisMonthExpense = thisMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 pt-12 space-y-6 pb-28">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
            Halo, {user?.username || 'Pengguna'} 👋
          </p>
          <h1 className="text-2xl font-bold text-slate-100 tracking-wide">XII RPL 1</h1>
        </div>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full border border-slate-700/50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md relative cursor-pointer active:scale-95 transition-transform">
            <Bell size={18} className="text-slate-300" />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </div>
          <div 
            onClick={() => {
              useAuthStore.getState().logout();
              document.cookie = "auth_token=; path=/; max-age=0";
              window.location.href = "/login";
            }}
            className="w-10 h-10 rounded-full border border-red-500/30 flex items-center justify-center bg-red-500/10 backdrop-blur-md relative cursor-pointer active:scale-95 transition-transform"
          >
            <LogOut size={18} className="text-red-400" />
          </div>
        </div>
      </div>

      {/* Main Balance Card (Hero) */}
      <GlassCard className="p-6 relative overflow-hidden bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-slate-700/60 shadow-2xl shadow-black/50">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <div className="w-4 h-3 rounded-[2px] border-2 border-slate-500/50 flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-slate-500/50" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider">
            {user?.role === 'anggota' ? 'TOTAL KAS ANDA' : 'SALDO KAS SAAT INI'}
          </span>
        </div>
        
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-6 relative z-10 font-mono">
          {currencyFormatter(user?.role === 'anggota' ? userKasTotal : currentBalance)}
        </h2>

        <div className="w-full h-px bg-slate-700/50 mb-4" />

        <div className="space-y-2 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ArrowUp size={12} className="text-amber-400" />
              <span className="text-xs text-slate-300">Pemasukan bulan ini</span>
            </div>
            <span className="text-sm font-bold text-amber-400">+ {currencyFormatter(thisMonthIncome)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ArrowDown size={12} className="text-red-400" />
              <span className="text-xs text-slate-300">Pengeluaran bulan ini</span>
            </div>
            <span className="text-sm font-bold text-red-400">- {currencyFormatter(thisMonthExpense)}</span>
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions Grid */}
      {(user?.role === 'bendahara' || user?.role === 'ketua') && (
        <div className="grid grid-cols-4 gap-3 px-1">
          <Link href="/tambah?type=income" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-[1.25rem] bg-slate-800/80 border border-slate-700/50 shadow-lg shadow-black/20 flex items-center justify-center group-active:scale-95 transition-transform backdrop-blur-md">
              <Plus size={24} className="text-amber-400" />
            </div>
            <span className="text-[10px] text-center font-medium text-slate-300 leading-tight">Catat<br/>Masuk</span>
          </Link>
          <Link href="/tambah?type=expense" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-[1.25rem] bg-slate-800/80 border border-slate-700/50 shadow-lg shadow-black/20 flex items-center justify-center group-active:scale-95 transition-transform backdrop-blur-md">
              <Minus size={24} className="text-red-400" />
            </div>
            <span className="text-[10px] text-center font-medium text-slate-300 leading-tight">Catat<br/>Keluar</span>
          </Link>
          
          <Link href="/laporan" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-[1.25rem] bg-slate-800/80 border border-slate-700/50 shadow-lg shadow-black/20 flex items-center justify-center group-active:scale-95 transition-transform backdrop-blur-md">
              <FileText size={22} className="text-blue-400" />
            </div>
            <span className="text-[10px] text-center font-medium text-slate-300 leading-tight">Lihat<br/>Laporan</span>
          </Link>
          
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => alert("Gunakan halaman Laporan untuk Backup")}>
            <div className="w-14 h-14 rounded-[1.25rem] bg-slate-800/80 border border-slate-700/50 shadow-lg shadow-black/20 flex items-center justify-center group-active:scale-95 transition-transform backdrop-blur-md">
              <Download size={22} className="text-emerald-400" />
            </div>
            <span className="text-[10px] text-center font-medium text-slate-300 leading-tight">Backup<br/>Data</span>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {(user?.role === 'bendahara' || user?.role === 'ketua') && (
        <div className="pt-2">
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="font-bold text-slate-200 text-lg">Arus Kas 6 Bulan</h3>
            <Link href="/laporan" className="text-xs font-semibold text-amber-400 flex items-center">
              Detail <ChevronRight size={14} />
            </Link>
          </div>
          <ChartCard title="" data={chartData} />
        </div>
      )}
    </div>
  );
}
