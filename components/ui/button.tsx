import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        // Encre pleine — action primaire
        default:
          "bg-ink text-paper rounded-full hover:bg-ink-soft active:scale-[0.98]",
        // Sceau — action d'engagement (premium, valider une demande)
        seal:
          "bg-seal text-paper rounded-full hover:bg-seal-bright active:scale-[0.98] shadow-seal",
        destructive:
          "bg-destructive text-paper rounded-full hover:opacity-90 active:scale-[0.98]",
        outline:
          "border border-ink-line bg-transparent text-ink rounded-full hover:border-ink hover:bg-paper-warm active:scale-[0.98]",
        secondary:
          "bg-paper-warm text-ink rounded-full hover:bg-paper-deep active:scale-[0.98]",
        ghost:
          "text-ink-soft rounded-[var(--radius)] hover:bg-paper-warm hover:text-ink",
        link:
          "text-ink underline-offset-4 hover:underline p-0 h-auto",
        premium:
          "bg-seal text-paper rounded-full hover:bg-seal-bright active:scale-[0.98] shadow-seal",
        free:
          "border border-ink-line bg-transparent text-ink rounded-full hover:border-ink",
        admin:
          "bg-ink text-paper text-xs rounded-full",
      },
      size: {
        default: "h-11 px-5 py-2 text-sm",
        sm:      "h-9 px-4 text-xs",
        lg:      "h-12 px-7 text-sm",
        xl:      "h-14 px-9 text-base",
        icon:    "h-10 w-10 rounded-[var(--radius)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
