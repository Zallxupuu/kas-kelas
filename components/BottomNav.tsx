"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, List, Users, Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const tabs = [
    { name: "BERANDA", href: "/", icon: Home, roles: ["bendahara", "ketua", "anggota"] },
    { name: "RIWAYAT", href: "/riwayat", icon: List, roles: ["bendahara", "ketua", "anggota"] },
    { name: "ANGGOTA", href: "/siswa", icon: Users, roles: ["ketua"] },
    { name: "BACKUP", href: "/laporan", icon: Download, roles: ["bendahara", "ketua", "anggota"] },
  ];

  const visibleTabs = tabs.filter(tab => user?.role && tab.roles.includes(user.role));

  return (
    <div className="flex justify-center pb-safe">
      <nav className="w-full max-w-md glass-nav rounded-t-3xl pb-6 pt-4 px-6 flex justify-between relative">
        {visibleTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link key={tab.href} href={tab.href} className={cn("glass-nav-item", isActive && "active")}>
              <div className="flex flex-col items-center gap-1.5">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-bold tracking-wider">{tab.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  />
                )}
                {!isActive && <div className="w-1.5 h-1.5" />}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
