"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, User as UserIcon, ArrowLeft } from "lucide-react";
import { currencyFormatter } from "@/utils/formatters";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { userService } from "@/lib/services/userService";
import { User } from "@/types";

interface UserKasData {
  user: User;
  totalPaid: number;
}

export default function KasAkunPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<UserKasData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await userService.getAllUsers();
        
        // Fetch all income transactions
        const { data: txs } = await supabase
          .from("transactions")
          .select("userId, amount")
          .eq("type", "income");

        const transactions = txs || [];

        const mergedData = users.map(user => {
          const userTxs = transactions.filter(t => t.userId === user.id);
          const totalPaid = userTxs.reduce((sum, t) => sum + t.amount, 0);
          return { user, totalPaid };
        });

        // Sort by absen number or name
        mergedData.sort((a, b) => (a.user.absenNumber || 0) - (b.user.absenNumber || 0));
        
        setData(mergedData);
      } catch (error) {
        console.error("Failed to load kas akun", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalAllKas = data.reduce((sum, item) => sum + item.totalPaid, 0);

  return (
    <div className="p-6 pt-12 space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="w-10 h-10 rounded-full bg-slate-800/50 text-slate-300 flex items-center justify-center shadow-inner">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">Total Kas Per Akun</h1>
      </div>

      <GlassCard className="p-4 text-center bg-gradient-to-br from-brand-gold/10 to-transparent border-brand-gold/20">
        <p className="text-sm text-slate-400 mb-1">Total Pemasukan Keseluruhan</p>
        <p className="text-2xl font-bold text-brand-gold">{currencyFormatter(totalAllKas)}</p>
      </GlassCard>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text"
          className="w-full bg-slate-950/40 backdrop-blur-md border border-slate-700/40 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-amber-400/50 focus:bg-slate-900/60 transition-all text-slate-200 placeholder:text-slate-400/60" 
          placeholder="Cari nama akun..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3 mt-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat data...</div>
        ) : filteredData.length > 0 ? (
          filteredData.map(({ user, totalPaid }) => (
            <GlassCard key={user.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                  {user.absenNumber || "-"}
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role || 'Anggota'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Total Kas</p>
                <p className="font-bold text-emerald-400">{currencyFormatter(totalPaid)}</p>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            Data tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
