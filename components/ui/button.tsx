import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-white rounded-full hover:bg-zinc-700 active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white rounded-full hover:bg-red-500 active:scale-[0.98]",
        outline:
          "border border-zinc-200 bg-white text-zinc-800 rounded-full hover:border-zinc-900 hover:text-zinc-900 active:scale-[0.98]",
        secondary:
          "bg-zinc-100 text-zinc-900 rounded-full hover:bg-zinc-200 active:scale-[0.98]",
        ghost:
          "text-zinc-600 rounded-lg hover:bg-zinc-100 hover:text-zinc-900",
        link:
          "text-zinc-900 underline-offset-4 hover:underline p-0 h-auto",
        premium:
          "bg-zinc-900 text-white rounded-full hover:bg-zinc-700 active:scale-[0.98]",
        free:
          "border border-zinc-200 bg-white text-zinc-700 rounded-full hover:border-zinc-900",
        admin:
          "bg-zinc-900 text-white text-xs rounded-full",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm",
        sm:      "h-8 px-4 text-xs",
        lg:      "h-12 px-7 text-sm",
        xl:      "h-13 px-9 text-base",
        icon:    "h-9 w-9 rounded-lg",
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
