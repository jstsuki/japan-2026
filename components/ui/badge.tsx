import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-5 tracking-wide [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-ink-muted",
        blush: "bg-blush text-ink",
        sakura: "bg-sakura/25 text-ink",
        matcha: "bg-matcha/18 text-matcha-ink",
        gold: "bg-gold/20 text-gold-ink",
        warn: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200",
        danger: "bg-rose-100 text-rose-900 dark:bg-rose-400/15 dark:text-rose-200",
        outline: "border border-line text-ink-muted",
        ink: "bg-ink text-background",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
