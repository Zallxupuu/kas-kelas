"use client";

import { useEffect, useState } from "react";
import { BackgroundBlobs } from "./ui/BackgroundBlobs";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { OfflineBanner } from "./OfflineBanner";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchInitialData } from "@/store/useStore";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      fetchInitialData();
    }
  }, [mounted, user]);

  useEffect(() => {
    if (mounted && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [mounted, user, pathname, router]);

  if (!mounted) return null;
  
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
        {/* Main Content Area */}
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
