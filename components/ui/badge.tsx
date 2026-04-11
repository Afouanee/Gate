import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-zinc-200 bg-zinc-100 text-zinc-700",
        secondary:
          "border-zinc-100 bg-zinc-50 text-zinc-600",
        destructive:
          "border-red-200 bg-red-50 text-red-700",
        outline:
          "border-zinc-200 text-zinc-700 bg-transparent",
        premium:
          "border-zinc-200 bg-zinc-100 text-zinc-700",
        free:
          "border-zinc-200 bg-white text-zinc-500",
        admin:
          "border-zinc-900 bg-zinc-900 text-white",
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
