"use client";

import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { Search, UserPlus, X, Edit2 } from "lucide-react";
import { useState } from "react";
import { userService } from "@/lib/services/userService";
import { hashPassword } from "@/utils/hash";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/types";

export default function SiswaPage() {
  const { users } = useStore();
  const authUser = useAuthStore(state => state.user);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  // Form states
  const [formName, setFormName] = useState("");
  const [formAbsen, setFormAbsen] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formRole, setFormRole] = useState<"anggota" | "bendahara" | "ketua">("anggota");

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = authUser?.role === 'ketua';

  const openAddModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setFormName("");
    setFormAbsen("");
    setFormPassword("1234");
    setFormRole("anggota");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setIsEditing(true);
    setEditingUserId(user.id!);
    setFormName(user.name);
    setFormAbsen(user.absenNumber?.toString() || "");
    setFormPassword(user.password_pin);
    setFormRole((user.role as any) || "anggota");
    setFormIsActive(user.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName || !formAbsen) return;
    
    if (isEditing && editingUserId) {
      const updateData: any = {
        name: formName,
        absenNumber: parseInt(formAbsen),
        role: formRole,
        isActive: formIsActive
      };
      
      // Jika password diisi atau kita sedang reset, hash passwordnya
      if (formPassword) {
        updateData.password_pin = hashPassword(formPassword);
      }
      
      await userService.updateUser(editingUserId, updateData);
    } else {
      const generatedUsername = formName.toLowerCase().replace(/\s+/g, '');
      const hashedPin = hashPassword(formPassword || "1234");
      
      await userService.addUser({
        name: formName,
        username: generatedUsername,
        password_pin: hashedPin,
        role: formRole,
        absenNumber: parseInt(formAbsen),
        isActive: true
      });
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 pt-12 space-y-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Data Siswa / Akun</h1>
        <GlassButton variant="icon" onClick={openAddModal}>
          <UserPlus size={20} className="text-brand-cyan" />
        </GlassButton>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <GlassInput 
          className="pl-12" 
          placeholder="Cari nama siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4 mt-4">
        {filteredUsers.map((user) => (
          <GlassCard key={user.id} className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 flex items-center justify-center font-bold text-brand-cyan border border-brand-cyan/20 shadow-inner">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <p className="font-semibold text-slate-200">{user.name}</p>
              <p className="text-sm text-slate-400">Absen: {user.absenNumber} • Username: {user.username}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right flex flex-col gap-1 items-end">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${user.role === 'ketua' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : user.role === 'bendahara' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {user.role}
                </span>
                {user.isActive ? (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
                    Aktif
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-slate-900/50 text-slate-500 text-xs font-medium rounded-full border border-slate-700">
                    Nonaktif
                  </span>
                )}
              </div>
              
              {canEdit && (
                <button 
                  onClick={() => openEditModal(user)}
                  className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          </GlassCard>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Siswa tidak ditemukan
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Siswa */}
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
                  <h2 className="text-xl font-bold text-slate-100">{isEditing ? "Edit Siswa" : "Tambah Siswa"}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nama Lengkap</label>
                    <GlassInput 
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="Masukkan nama..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nomor Absen</label>
                    <GlassInput 
                      type="number"
                      value={formAbsen}
                      onChange={e => setFormAbsen(e.target.value)}
                      placeholder="Masukkan no absen..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Peran / Jabatan</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all text-slate-200 shadow-lg appearance-none cursor-pointer custom-select"
                      value={formRole}
                      onChange={e => setFormRole(e.target.value as any)}
                    >
                      <option value="anggota" className="bg-slate-900 text-slate-200">Anggota</option>
                      <option value="bendahara" className="bg-slate-900 text-slate-200">Bendahara</option>
                      <option value="ketua" className="bg-slate-900 text-slate-200">Ketua</option>
                    </select>
                  </div>
                  
                  {/* Selalu tampilkan field password supaya ketua/bendahara bisa buat password khusus saat add/edit */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Password (PIN)</label>
                    <GlassInput 
                      type="text"
                      value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      placeholder="Masukkan password..."
                    />
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-3 mt-2">
                      <label className="text-sm font-medium text-slate-400">Status Aktif:</label>
                      <button 
                        onClick={() => setFormIsActive(!formIsActive)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${formIsActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${formIsActive ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                      Siswa otomatis akan mendapatkan username (sesuai nama) dan password default "1234".
                    </div>
                  )}
                  
                  <GlassButton 
                    className="w-full mt-4" 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={!formName || !formAbsen}
                  >
                    Simpan
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
