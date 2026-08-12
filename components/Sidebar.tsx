"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, List, Users, Plus, Download, Wallet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    document.cookie = "auth_token=; path=/; max-age=0";
    router.push("/login");
  };

  const tabs = [
    { name: "Dashboard", href: "/", icon: Home, roles: ["bendahara", "ketua", "anggota"] },
    { name: "Riwayat", href: "/riwayat", icon: List, roles: ["bendahara", "ketua", "anggota"] },
    { name: "Tambah Kas", href: "/tambah", icon: Plus, roles: ["bendahara"] },
    { name: "Siswa", href: "/siswa", icon: Users, roles: ["ketua"] },
    { name: "Kas Akun", href: "/kas-akun", icon: Wallet, roles: ["bendahara", "ketua", "anggota"] },
    { name: "Laporan", href: "/laporan", icon: Download, roles: ["bendahara", "ketua"] },
  ];

  const visibleTabs = tabs.filter(tab => user?.role && tab.roles.includes(user.role));

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen pt-16 px-6 glass-card border-l-0 rounded-l-none border-y-0 shadow-[8px_0_30px_rgba(0,0,0,0.3)] sticky top-0 z-40">
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-12 h-12 bg-blue-600/80 rounded-xl flex items-center justify-center text-white shadow-lg border border-white/20">
          <Wallet size={24} />
        </div>
        <div>
          <h2 className="font-bold text-xl text-slate-100 tracking-tight">Kas Kelas</h2>
          <p className="text-xs text-emerald-400 font-medium capitalize">
            {user?.role || "Buku Kas"}
          </p>
        </div>
      </div>
      
      <nav className="flex flex-col gap-2 flex-1">
        {visibleTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              className={cn(
                "flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-sm font-medium",
                isActive 
                  ? "bg-blue-600/90 text-white shadow-lg shadow-blue-900/50 border border-white/10" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {tab.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pb-8">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-4 w-full rounded-xl transition-all text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} strokeWidth={2} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
