"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { transactionService } from "@/lib/services/transactionService";
import { CategoryIcon } from "@/components/CategoryIcon";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function TambahTransaksiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as "income" | "expense") || "income";
  const { categories, users } = useStore();
  
  const [type, setType] = useState<"income" | "expense">(initialType);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");

  const filteredCategories = categories.filter(c => c.type === type);
  const isIncome = type === "income";

  const formatAmount = (val: string) => {
    const number = parseInt(val.replace(/\D/g, ""), 10);
    if (isNaN(number)) return "";
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatAmount(e.target.value));
  };

  const getRawAmount = () => {
    return parseInt(amount.replace(/\D/g, ""), 10) || 0;
  };

  const handleSubmit = async () => {
    const rawAmount = getRawAmount();
    if (!rawAmount || !categoryId) return alert("Nominal dan kategori wajib diisi");
    
    await transactionService.addTransaction({
      type,
      amount: rawAmount,
      categoryId,
      userId: isIncome ? userId : null,
      date: new Date(date).toISOString(),
      description
    });

    router.push("/");
  };

  return (
    <div className="p-6 pt-12 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Tambah Transaksi</h1>

      {/* Segmented Control */}
      <GlassCard className="p-1 flex relative">
        <div className="absolute inset-1 grid grid-cols-2 pointer-events-none z-0">
          <motion.div 
            layoutId="segment" 
            className="bg-slate-700/50 rounded-2xl shadow-inner border border-white/5"
            initial={false}
            animate={{ x: isIncome ? 0 : "100%" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        </div>
        
        <button 
          onClick={() => { setType("income"); setCategoryId(null); }}
          className={`flex-1 py-3 text-center font-medium relative z-10 transition-colors ${isIncome ? "text-blue-500" : "text-slate-500"}`}
        >
          Pemasukan
        </button>
        <button 
          onClick={() => { setType("expense"); setCategoryId(null); }}
          className={`flex-1 py-3 text-center font-medium relative z-10 transition-colors ${!isIncome ? "text-emerald-500" : "text-slate-500"}`}
        >
          Pengeluaran
        </button>
      </GlassCard>

      {/* Nominal Input */}
      <div className="text-center py-4">
        <span className="text-slate-400 font-medium">Nominal (Rp)</span>
        <input 
          type="text" 
          inputMode="numeric"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0"
          className="w-full text-5xl font-extrabold text-center bg-transparent outline-none text-slate-100 mt-2 placeholder:text-slate-600"
        />
      </div>

      {/* Category Selection */}
      <div>
        <h3 className="font-medium text-slate-300 mb-3">Pilih Kategori</h3>
        <div className="grid grid-cols-3 gap-3">
          {filteredCategories.map(cat => (
            <GlassCard 
              key={cat.id} 
              variant={categoryId === cat.id ? "strong" : "light"}
              className={`p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${categoryId === cat.id ? (isIncome ? "border-blue-500 shadow-inner" : "border-emerald-500 shadow-inner") : "border-slate-700/50"}`}
              onClick={() => setCategoryId(cat.id!)}
            >
              <div className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-slate-300 shadow-inner">
                <CategoryIcon iconKey={cat.iconKey} size={20} />
              </div>
              <span className="text-xs text-center font-medium text-slate-400">{cat.name}</span>
            </GlassCard>
          ))}
        </div>
      </div>

      {isIncome && (
        <div className="space-y-4">
          <div className="relative z-20">
            <h3 className="font-medium text-slate-300 mb-3">Siswa (Opsional)</h3>
            <div 
              className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl px-4 py-3 cursor-pointer flex justify-between items-center text-slate-200 shadow-inner"
              onClick={(e) => {
                const dropdown = document.getElementById('user-dropdown');
                if (dropdown) dropdown.classList.toggle('hidden');
              }}
            >
              <span>{userId ? users.find(u => u.id === userId)?.name : "-- Bukan Siswa --"}</span>
              <span className="text-slate-500 text-xs">▼</span>
            </div>
            
            <div id="user-dropdown" className="hidden absolute left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 p-2 space-y-1">
              <div 
                className={`px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors ${!userId ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-700/50'}`}
                onClick={() => { setUserId(null); document.getElementById('user-dropdown')?.classList.add('hidden'); }}
              >
                -- Bukan Siswa --
              </div>
              {users.map(u => (
                <div 
                  key={u.id}
                  className={`px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors ${userId === u.id ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-700/50'}`}
                  onClick={() => { setUserId(u.id!); document.getElementById('user-dropdown')?.classList.add('hidden'); }}
                >
                  {u.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Date & Note */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-slate-300 mb-2">Tanggal</h3>
          <GlassInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <h3 className="font-medium text-slate-300 mb-2">Catatan</h3>
          <GlassInput placeholder="Tambahkan keterangan..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      <GlassButton 
        className="w-full mt-8" 
        variant={isIncome ? "primary" : "danger"} 
        onClick={handleSubmit}
        disabled={!getRawAmount() || !categoryId}
      >
        Simpan Transaksi
      </GlassButton>
    </div>
  );
}
