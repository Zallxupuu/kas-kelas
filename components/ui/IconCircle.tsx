import { HTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface IconCircleProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  variant?: "default" | "income" | "expense" | "brand";
  size?: "sm" | "md" | "lg";
}

export const IconCircle = forwardRef<HTMLDivElement, IconCircleProps>(
  ({ className, icon, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-full shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.03),inset_2px_2px_4px_rgba(255,255,255,0.05)]",
          
          size === "sm" && "w-10 h-10",
          size === "md" && "w-12 h-12",
          size === "lg" && "w-16 h-16",
          
          variant === "default" && "bg-[#3d1a1a] text-slate-400",
          variant === "income" && "bg-[#3d1a1a] text-income",
          variant === "expense" && "bg-[#3d1a1a] text-expense",
          variant === "brand" && "bg-[#3d1a1a] text-brand-cyan",
          
          className
        )}
        {...props}
      >
        {icon || children}
      </div>
    );
  }
);
IconCircle.displayName = "IconCircle";
