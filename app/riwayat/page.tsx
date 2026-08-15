"use client";

import { useState, useMemo, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassChip } from "@/components/ui/GlassChip";
import { TransactionListItem } from "@/components/TransactionListItem";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Search } from "lucide-react";
import { transactionService } from "@/lib/services/transactionService";

export default function RiwayatPage() {
  const { transactions, categories, users } = useStore();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== "all" && t.type !== filterType) return false;

      if (search) {
        const cat = categories.find(c => c.id === t.categoryId);
        const user = users.find(u => u.id === t.userId);
        const sl = search.toLowerCase();
        if (
          !cat?.name.toLowerCase().includes(sl) &&
          !t.description?.toLowerCase().includes(sl) &&
          !user?.name.toLowerCase().includes(sl)
        ) return false;
      }

      return true;
    });
  }, [transactions, categories, users, search, filterType]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      const date = t.date.substring(0, 10);
      if (!acc[date]) acc[date] = [];
      acc[date].push(t);
      return acc;
    }, {} as Record<string, typeof transactions>);
  }, [filteredTransactions]);

  const sortedDates = useMemo(() =>
    Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)),
    [groupedTransactions]
  );

  const handleDelete = useCallback(async (id?: number) => {
    if (!id) return;
    if (confirm("Hapus transaksi ini?")) {
      await transactionService.deleteTransaction(id);
    }
  }, []);

  return (
    <div className="p-4 pt-6 space-y-4 pb-28">
      <h1 className="text-xl font-bold text-slate-100">Riwayat Transaksi</h1>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <GlassInput
          className="pl-11"
          placeholder="Cari transaksi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        <GlassChip active={filterType === "all"} onClick={() => setFilterType("all")}>Semua</GlassChip>
        <GlassChip active={filterType === "income"} onClick={() => setFilterType("income")} variant="income">Pemasukan</GlassChip>
        <GlassChip active={filterType === "expense"} onClick={() => setFilterType("expense")} variant="expense">Pengeluaran</GlassChip>
      </div>

      <div className="space-y-5 pt-1">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="text-xs font-semibold text-slate-500 mb-2 ml-1 uppercase tracking-wider">
              {format(parseISO(date), "dd MMMM yyyy", { locale: id })}
            </h3>
            <div className="space-y-2">
              {groupedTransactions[date].map((t) => {
                const category = categories.find(c => c.id === t.categoryId);
                const user = users.find(u => u.id === t.userId);
                return (
                  <div key={t.id} className="relative rounded-3xl overflow-hidden">
                    {/* Swipe-to-delete hint */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-red-500/20 flex items-center justify-end px-6 z-0 border border-red-500/30 rounded-r-3xl">
                      <span className="text-red-400 font-medium text-sm">Hapus</span>
                    </div>
                    {/* Foreground — tap to delete on mobile (long-press fallback) */}
                    <div
                      className="relative z-10 bg-[#0B1121] rounded-3xl cursor-pointer"
                      onContextMenu={(e) => { e.preventDefault(); handleDelete(t.id); }}
                    >
                      <TransactionListItem
                        transaction={t}
                        category={category}
                        user={user}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            Tidak ada transaksi ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
