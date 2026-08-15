"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { comparePassword } from "@/utils/hash";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !pin) {
      setError("Username dan Password wajib diisi!");
      return;
    }
    
    setLoading(true);
    
    try {
      // Query ke tabel app_users di Supabase berdasarkan username
      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .eq("username", username.toLowerCase())
        .single();
        
      if (error || !data) {
        setError("Username atau Password salah!");
        setLoading(false);
        return;
      }
      
      // Verifikasi password
      const isPasswordValid = comparePassword(pin, data.password_pin);
      if (!isPasswordValid) {
        setError("Username atau Password salah!");
        setLoading(false);
        return;
      }
      
      // Simpan sesi login ke Zustand
      login({
        id: data.id,
        username: data.username,
        role: data.role
      });
      
      // Set persistent cookie (30 hari) untuk middleware + auto-login
      document.cookie = `auth_token=${data.id}; path=/; max-age=2592000; SameSite=Lax`; // 30 days
      
      // Arahkan ke dashboard
      router.push("/");
    } catch (err) {
      setError("Gagal terhubung ke server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Wallet size={32} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kas Kelas</h1>
          <p className="text-slate-400 text-sm mt-1">Sistem Keuangan Transparan</p>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-slate-200 mb-6 text-center">Masuk ke Akun</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
              <GlassInput 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cth: bendahara" 
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
              <GlassInput 
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan password" 
                required
              />
            </div>
            
            {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}
            
            <GlassButton 
              type="submit" 
              variant="primary" 
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </GlassButton>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
