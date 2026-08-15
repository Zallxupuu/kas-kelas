"use client";

import { useState, useCallback, useMemo } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { transactionService } from "@/lib/services/transactionService";
import { CategoryIcon } from "@/components/CategoryIcon";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, Users, ChevronDown, Search } from "lucide-react";


export default function TambahTransaksiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as "income" | "expense") || "income";
  const { categories, users } = useStore();

  const [type, setType] = useState<"income" | "expense">(initialType);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Siswa selection — modal multi-select
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // single user mode (optional, non-kas)
  const [singleMode, setSingleMode] = useState(false);

  const filteredCategories = useMemo(() => categories.filter(c => c.type === type), [categories, type]);
  const isIncome = type === "income";

  const activeStudents = useMemo(() => users.filter(u => u.role === "anggota" && u.isActive), [users]);
  const filteredStudents = useMemo(() =>
    searchQuery.trim()
      ? activeStudents.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : activeStudents,
    [activeStudents, searchQuery]
  );

  const formatAmount = useCallback((val: string) => {
    const number = parseInt(val.replace(/\D/g, ""), 10);
    if (isNaN(number)) return "";
    return new Intl.NumberFormat("id-ID").format(number);
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatAmount(e.target.value));
  };

  const getRawAmount = useCallback(() => {
    return parseInt(amount.replace(/\D/g, ""), 10) || 0;
  }, [amount]);

  const toggleStudent = (id: number) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedUserIds(filteredStudents.map(u => u.id!));
  const clearAll = () => setSelectedUserIds([]);

  const selectedStudentLabel = useMemo(() => {
    if (selectedUserIds.length === 0) return "-- Belum dipilih --";
    if (selectedUserIds.length === activeStudents.length) return `Semua murid (${selectedUserIds.length})`;
    if (selectedUserIds.length === 1) {
      return users.find(u => u.id === selectedUserIds[0])?.name ?? "1 murid";
    }
    return `${selectedUserIds.length} murid dipilih`;
  }, [selectedUserIds, activeStudents.length, users]);

  const handleSubmit = async () => {
    const rawAmount = getRawAmount();
    if (!rawAmount || !categoryId) return alert("Nominal dan kategori wajib diisi");
    if (isIncome && selectedUserIds.length === 0 && !confirm("Tidak ada murid yang dipilih. Simpan sebagai pemasukan umum?")) return;

    setIsSubmitting(true);
    try {
      const base = {
        type,
        amount: rawAmount,
        categoryId,
        date: new Date(date).toISOString(),
        description,
      };

      if (isIncome && selectedUserIds.length > 0) {
        await transactionService.bulkInsertForUsers(selectedUserIds, { ...base, periodId: null });
      } else {
        await transactionService.addTransaction({ ...base, userId: null, periodId: null });
      }

      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-4 pt-6 space-y-5 pb-28 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-slate-100">Tambah Transaksi</h1>

        {/* Segmented Control */}
        <GlassCard className="p-1 flex relative">
          <div className="absolute inset-1 grid grid-cols-2 pointer-events-none z-0">
            <div
              className={`bg-slate-700/50 rounded-2xl shadow-inner border border-white/5 transition-transform duration-300 ${isIncome ? "translate-x-0" : "translate-x-full"}`}
            />
          </div>
          <button
            onClick={() => { setType("income"); setCategoryId(null); setSelectedUserIds([]); }}
            className={`flex-1 py-3 text-center font-medium relative z-10 transition-colors ${isIncome ? "text-blue-400" : "text-slate-500"}`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => { setType("expense"); setCategoryId(null); setSelectedUserIds([]); }}
            className={`flex-1 py-3 text-center font-medium relative z-10 transition-colors ${!isIncome ? "text-emerald-400" : "text-slate-500"}`}
          >
            Pengeluaran
          </button>
        </GlassCard>

        {/* Nominal Input */}
        <div className="text-center py-3">
          <span className="text-slate-400 text-sm font-medium">Nominal (Rp)</span>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full text-5xl font-extrabold text-center bg-transparent outline-none text-slate-100 mt-1 placeholder:text-slate-700"
          />
        </div>

        {/* Category Selection */}
        <div>
          <h3 className="font-medium text-slate-300 mb-3 text-sm">Pilih Kategori</h3>
          <div className="grid grid-cols-3 gap-2">
            {filteredCategories.map(cat => (
              <GlassCard
                key={cat.id}
                variant={categoryId === cat.id ? "strong" : "light"}
                className={`p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${categoryId === cat.id
                  ? (isIncome ? "border-blue-500/70" : "border-emerald-500/70")
                  : "border-slate-700/40"}`}
                onClick={() => setCategoryId(cat.id!)}
              >
                <div className="w-9 h-9 rounded-full bg-slate-900/60 flex items-center justify-center text-slate-300">
                  <CategoryIcon iconKey={cat.iconKey} size={18} />
                </div>
                <span className="text-xs text-center font-medium text-slate-400 leading-tight">{cat.name}</span>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Siswa Section — hanya untuk pemasukan */}
        {isIncome && (
          <div>
            <h3 className="font-medium text-slate-300 mb-2 text-sm">Murid yang Membayar</h3>

            {/* Trigger button */}
            <button
              type="button"
              onClick={() => setShowStudentModal(true)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 py-3 flex items-center justify-between text-left transition-colors hover:border-blue-500/40 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <Users size={16} className="text-slate-400 shrink-0" />
                <span className={`text-sm ${selectedUserIds.length > 0 ? "text-slate-200 font-medium" : "text-slate-500"}`}>
                  {selectedStudentLabel}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-500 shrink-0" />
            </button>

            {/* Chip preview */}
            {selectedUserIds.length > 0 && selectedUserIds.length <= 6 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedUserIds.map(id => {
                  const u = users.find(x => x.id === id);
                  return u ? (
                    <span key={id} className="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs rounded-full px-2.5 py-1 font-medium">
                      {u.name}
                      <button onClick={() => toggleStudent(id)} className="text-blue-400 hover:text-blue-200 ml-0.5">
                        <X size={10} />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* Date & Note */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-slate-300 mb-1.5 text-sm">Tanggal</h3>
            <GlassInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <h3 className="font-medium text-slate-300 mb-1.5 text-sm">Catatan</h3>
            <GlassInput placeholder="Tambahkan keterangan..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <GlassButton
          className="w-full mt-4"
          variant={isIncome ? "primary" : "danger"}
          onClick={handleSubmit}
          disabled={!getRawAmount() || !categoryId || isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : isIncome && selectedUserIds.length > 1
            ? `Simpan untuk ${selectedUserIds.length} Murid`
            : "Simpan Transaksi"}
        </GlassButton>
      </div>

      {/* ===== STUDENT MODAL ===== */}
      <AnimatePresence>
        {showStudentModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[59]"
              onClick={() => setShowStudentModal(false)}
            />


            {/* Bottom Sheet — duduk di atas bottom nav */}
            <motion.div
              key="modal"
              initial={{ y: 800, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 800, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed left-0 right-0 z-[60] flex justify-center px-3"
              style={{ bottom: "88px" }}
            >
              <div
                className="w-full max-w-lg bg-[#0f172a] border border-slate-700/60 rounded-3xl shadow-2xl shadow-black/60 flex flex-col"
                style={{ height: "68vh", maxHeight: "calc(100svh - 140px)" }}
              >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                  <div className="w-10 h-1 bg-slate-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-4 pt-1 pb-2 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="font-bold text-slate-100 text-sm">Pilih Murid yang Bayar</h2>
                    <p className="text-xs text-slate-500">
                      {selectedUserIds.length > 0 ? `${selectedUserIds.length} dipilih dari ${activeStudents.length}` : `${activeStudents.length} murid tersedia`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStudentModal(false)}
                    className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Search */}
                <div className="px-4 pb-2 shrink-0">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari nama murid..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl pl-8 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Select All / Clear — compact row */}
                <div className="px-4 pb-2 flex gap-2 shrink-0">
                  <button
                    onClick={selectAll}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 border border-blue-500/25 text-blue-400 active:bg-blue-500/20"
                  >
                    Pilih Semua
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 border border-slate-700/40 text-slate-400 active:bg-slate-700/60"
                  >
                    Hapus Pilihan
                  </button>
                </div>

                {/* Student Grid — 3 kolom compact */}
                <div className="overflow-y-auto flex-1 px-3 pb-2">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">Tidak ada murid ditemukan</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {filteredStudents.map(u => {
                        const isSelected = selectedUserIds.includes(u.id!);
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => toggleStudent(u.id!)}
                            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl border transition-all active:scale-95 ${
                              isSelected
                                ? "bg-blue-500/15 border-blue-500/50"
                                : "bg-slate-800/50 border-slate-700/30"
                            }`}
                          >
                            {/* Avatar dengan checkmark */}
                            <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300"
                            }`}>
                              {u.absenNumber ?? u.name.charAt(0).toUpperCase()}
                              {isSelected && (
                                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-400 border border-slate-900 flex items-center justify-center">
                                  <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                                    <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Name */}
                            <span className={`text-[10px] font-medium leading-tight text-center line-clamp-2 w-full px-0.5 ${
                              isSelected ? "text-blue-200" : "text-slate-400"
                            }`}>
                              {u.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer confirm */}
                <div className="px-4 pt-2 pb-4 shrink-0">
                  <button
                    onClick={() => setShowStudentModal(false)}
                    className={`w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] ${
                      selectedUserIds.length > 0
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                        : "bg-slate-800 text-slate-500 border border-slate-700/50"
                    }`}
                  >
                    {selectedUserIds.length > 0 ? `Konfirmasi ${selectedUserIds.length} Murid ✓` : "Tutup"}
                  </button>
                </div>
              </div>
            </motion.div>

          </>
        )}
      </AnimatePresence>
    </>
  );
}
