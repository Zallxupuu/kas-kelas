"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { Plus, Calendar, X } from "lucide-react";
import { periodService } from "@/lib/services/periodService";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function PeriodePage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [defaultNominal, setDefaultNominal] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // In a real app we'd fetch periods via useEffect, 
  // but let's assume we can subscribe or fetch them on load
  useState(() => {
    periodService.getAllPeriods().then(setPeriods);
  });

  const handleAddPeriod = async () => {
    if (!label || !defaultNominal) return;
    
    // We assume 1 week by default
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const newPeriod = await periodService.addPeriod({
      label,
      defaultNominal: parseInt(defaultNominal),
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });
    
    // Refresh
    periodService.getAllPeriods().then(setPeriods);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 pt-12 space-y-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Jadwal Mingguan</h1>
        <GlassButton variant="icon" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="text-blue-400" />
        </GlassButton>
      </div>

      <div className="space-y-4 mt-4">
        {periods.map((p) => (
          <GlassCard key={p.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-slate-200">{p.label}</h3>
              <span className="text-emerald-400 font-medium text-sm border border-emerald-400/20 px-2 py-1 rounded-lg">
                Rp {new Intl.NumberFormat("id-ID").format(p.defaultNominal)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-3">
              <Calendar size={14} />
              <span>{format(new Date(p.startDate), "d MMM", { locale: id })} - {format(new Date(p.endDate), "d MMM yyyy", { locale: id })}</span>
            </div>
          </GlassCard>
        ))}

        {periods.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Belum ada periode kas mingguan
          </div>
        )}
      </div>

      {/* Modal Tambah Periode */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm"
            >
              <GlassCard variant="strong" className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-100">Tambah Minggu</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Label (Cth: Minggu 1 Agustus)</label>
                    <GlassInput 
                      value={label}
                      onChange={e => setLabel(e.target.value)}
                      placeholder="Masukkan label..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nominal Target (Rp)</label>
                    <GlassInput 
                      type="number"
                      value={defaultNominal}
                      onChange={e => setDefaultNominal(e.target.value)}
                      placeholder="Contoh: 10000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Tanggal Mulai</label>
                    <GlassInput 
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  <GlassButton 
                    className="w-full mt-4" 
                    variant="primary" 
                    onClick={handleAddPeriod}
                    disabled={!label || !defaultNominal}
                  >
                    Buat Periode
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
