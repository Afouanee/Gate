import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-ink-line bg-paper-warm text-ink-soft",
        secondary:
          "border-ink-line/60 bg-paper text-ink-faint",
        destructive:
          "border-destructive/30 bg-seal-tint text-destructive",
        outline:
          "border-ink-line text-ink-soft bg-transparent",
        premium:
          "border-seal/30 bg-seal-tint text-seal",
        free:
          "border-ink-line bg-transparent text-ink-faint",
        admin:
          "border-ink bg-ink text-paper",
        patina:
          "border-patina/30 bg-patina-tint text-patina",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
