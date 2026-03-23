import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        secondary: "border-transparent bg-secondary/15 text-secondary",
        destructive: "border-transparent bg-destructive/15 text-destructive",
        outline: "border-border text-foreground",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        danger: "border-red-500/30 bg-red-500/10 text-red-400",
        info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
        indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
        muted: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "inline-block w-1.5 h-1.5 rounded-full",
            variant === "success" && "bg-emerald-400",
            variant === "warning" && "bg-amber-400",
            variant === "danger" && "bg-red-400",
            variant === "info" && "bg-blue-400",
            variant === "indigo" && "bg-indigo-400",
            !variant && "bg-primary"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
