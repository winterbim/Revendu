import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconRight, error, ...props }, ref) => {
    if (icon || iconRight) {
      return (
        <div className="relative flex items-center">
          {icon && (
            <div className="pointer-events-none absolute left-3 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:ring-destructive",
              icon && "pl-10",
              iconRight && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 text-muted-foreground">
              {iconRight}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors",
          "placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
