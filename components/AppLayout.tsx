"use client";

import { useEffect, useState } from "react";
import { BackgroundBlobs } from "./ui/BackgroundBlobs";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { OfflineBanner } from "./OfflineBanner";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchInitialData } from "@/store/useStore";
import { supabase } from "@/lib/supabase";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const pathname = usePathname();
  const router = useRouter();

  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Restore session dari cookie jika Zustand kosong (mis. setelah hard reload)
  useEffect(() => {
    if (!mounted) return;

    const restoreSession = async () => {
      // Jika sudah ada user di Zustand (persist sudah hydrate), skip
      if (user) {
        setRestoring(false);
        return;
      }

      // Ambil userId dari cookie
      const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      const userId = match ? parseInt(match[1]) : null;

      if (userId && !isNaN(userId)) {
        try {
          const { data } = await supabase
            .from("app_users")
            .select("id, username, role")
            .eq("id", userId)
            .single();

          if (data) {
            login({ id: data.id, username: data.username, role: data.role });
          }
        } catch {
          // cookie invalid / expired — biarkan redirect ke login
        }
      }

      setRestoring(false);
    };

    restoreSession();
  }, [mounted, user, login]);

  // Fetch data setelah user tersedia
  useEffect(() => {
    if (mounted && user && !restoring) {
      fetchInitialData();
    }
  }, [mounted, user, restoring]);

  // Auth redirect
  useEffect(() => {
    if (!mounted || restoring) return;

    if (!user && pathname !== "/login") {
      document.cookie = "auth_token=; path=/; max-age=0";
      router.push("/login");
    }
  }, [mounted, restoring, user, pathname, router]);

  if (!mounted || restoring) return null;

  if (pathname === "/login") {
    return <div className="min-h-screen bg-slate-950 font-sans">{children}</div>;
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-x-hidden selection:bg-blue-500/30 font-sans md:flex">
      <BackgroundBlobs />
      <OfflineBanner />

      <Sidebar />

      <div className="flex-1 min-h-screen relative md:ml-0 flex flex-col items-center">
        <main className="w-full max-w-4xl px-4 md:px-8 pb-28 pt-8 md:pb-12 md:pt-12 flex-1 mt-6">
          {mounted ? children : null}
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 pointer-events-none z-50 flex justify-center">
        <div className="w-full max-w-md pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
