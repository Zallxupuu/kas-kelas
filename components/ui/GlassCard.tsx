"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "medium" | "strong";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "medium", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variant === "strong" ? "glass-card-strong" : "glass-card",
          variant === "light" && "bg-slate-900/40 shadow-none border border-white/5",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";
