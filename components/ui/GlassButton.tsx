"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<"button">> {
  variant?: "default" | "primary" | "danger" | "icon";
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps & HTMLMotionProps<"button">>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "glass-button",
          variant === "default" && "px-4 py-3 text-slate-300",
          variant === "primary" && "bg-blue-600/80 text-white px-4 py-3 shadow-[0_4px_20px_rgba(37,99,235,0.4)] border-blue-500/50 hover:bg-blue-500/80",
          variant === "danger" && "bg-red-600/80 text-white px-4 py-3 shadow-[0_4px_20px_rgba(220,38,38,0.4)] border-red-500/50 hover:bg-red-500/80",
          variant === "icon" && "p-3 rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
GlassButton.displayName = "GlassButton";
