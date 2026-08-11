"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isOffline ? 'h-12' : 'h-0 overflow-hidden'}`}>
      <div className="offline-banner w-full h-full flex items-center justify-center gap-2 px-4 shadow-md">
        <WifiOff size={16} />
        <span className="truncate">Anda sedang offline. Layanan tetap berjalan, data tersimpan lokal.</span>
      </div>
    </div>
  );
}
