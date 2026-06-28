import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-[var(--radius)] border border-ink-line bg-card px-3.5 py-2 text-sm text-ink",
        "placeholder:text-ink-faint",
        "hover:border-ink-faint",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:border-seal focus-visible:bg-paper-warm/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-[border-color,box-shadow,background-color] duration-200",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
