"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassChipProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  variant?: "default" | "income" | "expense";
}

export const GlassChip = forwardRef<HTMLDivElement, GlassChipProps>(
  ({ className, active, variant = "default", children, ...props }, ref) => {
    
    let activeStyle = "bg-blue-600/80 text-white border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]";
    if (variant === "income") {
      activeStyle = "bg-emerald-500/80 text-emerald-950 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]";
    } else if (variant === "expense") {
      activeStyle = "bg-red-500/80 text-white border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]";
    }

    return (
      <div
        ref={ref}
        className={cn(
          "px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium text-sm backdrop-blur-md border",
          active 
            ? activeStyle
            : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 border-slate-700/50 hover:text-slate-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassChip.displayName = "GlassChip";
