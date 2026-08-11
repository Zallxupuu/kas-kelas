import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "glass-input",
          error && "border-expense bg-expense/10 focus:border-expense",
          className
        )}
        {...props}
      />
    );
  }
);
GlassInput.displayName = "GlassInput";
