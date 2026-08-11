"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassChip } from "@/components/ui/GlassChip";
import { TransactionListItem } from "@/components/TransactionListItem";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { transactionService } from "@/lib/services/transactionService";

export default function RiwayatPage() {
  const { transactions, categories, users } = useStore();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== "all" && t.type !== filterType) return false;
    
    if (search) {
      const cat = categories.find(c => c.id === t.categoryId);
      const user = users.find(u => u.id === t.userId);
      const searchLower = search.toLowerCase();
      
      const matchCat = cat?.name.toLowerCase().includes(searchLower);
      const matchDesc = t.description?.toLowerCase().includes(searchLower);
      const matchUser = user?.name.toLowerCase().includes(searchLower);
      
      if (!matchCat && !matchDesc && !matchUser) return false;
    }
    
    return true;
  });

  const groupedTransactions = filteredTransactions.reduce((acc, t) => {
    const date = t.date.substring(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, typeof transactions>);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm("Hapus transaksi ini?")) {
      await transactionService.deleteTransaction(id);
    }
  };

  return (
    <div className="p-6 pt-12 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Riwayat Transaksi</h1>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <GlassInput 
          className="pl-12" 
          placeholder="Cari transaksi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
        <GlassChip 
          active={filterType === "all"} 
          onClick={() => setFilterType("all")}
        >
          Semua
        </GlassChip>
        <GlassChip 
          active={filterType === "income"} 
          onClick={() => setFilterType("income")}
          variant="income"
        >
          Pemasukan
        </GlassChip>
        <GlassChip 
          active={filterType === "expense"} 
          onClick={() => setFilterType("expense")}
          variant="expense"
        >
          Pengeluaran
        </GlassChip>
      </div>

      <div className="space-y-6 mt-4 pb-12">
        <AnimatePresence>
          {Object.keys(groupedTransactions).sort((a,b) => b.localeCompare(a)).map(date => (
            <motion.div key={date} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 ml-2">
                {format(parseISO(date), "dd MMMM yyyy", { locale: id })}
              </h3>
              <div className="space-y-3">
                {groupedTransactions[date].map((t) => {
                  const category = categories.find(c => c.id === t.categoryId);
                  const user = users.find(u => u.id === t.userId);
                  return (
                    <div key={t.id} className="relative rounded-3xl overflow-hidden">
                      {/* Delete Background (Static, behind) - Placed only on the right to prevent left edge bleed */}
                      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-red-500/20 flex items-center justify-end px-6 z-0 border border-red-500/30 rounded-r-3xl">
                        <span className="text-red-400 font-medium text-sm">Hapus</span>
                      </div>
                      
                      {/* Draggable Foreground Card */}
                      <motion.div 
                        layout
                        drag="x"
                        dragConstraints={{ left: -100, right: 0 }}
                        onDragEnd={(e, { offset }) => {
                          if (offset.x < -50) {
                            handleDelete(t.id);
                          }
                        }}
                        className="relative z-10 bg-[#0B1121] rounded-3xl"
                      >
                        <TransactionListItem
                          transaction={t}
                          category={category}
                          user={user}
                        />
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Tidak ada transaksi ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
