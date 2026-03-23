"use client";

import React, { useEffect, useRef, useState } from "react";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "profit" | "danger" | "warning" | "indigo";
  loading?: boolean;
}

const VARIANT_STYLES = {
  default: {
    icon: "bg-muted text-muted-foreground",
    iconGlow: "",
    value: "text-foreground",
    trend_pos: "text-emerald-400",
    trend_neg: "text-red-400",
    accent: "bg-primary",
  },
  profit: {
    icon: "bg-emerald-500/15 text-emerald-400",
    iconGlow: "shadow-emerald-500/20",
    value: "text-emerald-400",
    trend_pos: "text-emerald-400",
    trend_neg: "text-red-400",
    accent: "bg-emerald-400",
  },
  danger: {
    icon: "bg-red-500/15 text-red-400",
    iconGlow: "shadow-red-500/20",
    value: "text-red-400",
    trend_pos: "text-emerald-400",
    trend_neg: "text-red-400",
    accent: "bg-red-400",
  },
  warning: {
    icon: "bg-amber-500/15 text-amber-400",
    iconGlow: "shadow-amber-500/20",
    value: "text-amber-400",
    trend_pos: "text-emerald-400",
    trend_neg: "text-red-400",
    accent: "bg-amber-400",
  },
  indigo: {
    icon: "bg-indigo-500/15 text-indigo-400",
    iconGlow: "shadow-indigo-500/20",
    value: "text-foreground",
    trend_pos: "text-emerald-400",
    trend_neg: "text-red-400",
    accent: "bg-indigo-400",
  },
};

// ─── useCountUp ───────────────────────────────────────────────────────────────

function extractNumber(value: string): number | null {
  // Strip non-numeric chars except decimal point and minus
  const match = value.replace(/\s/g, "").match(/-?[\d,]+(?:\.\d+)?/);
  if (!match) return null;
  const n = parseFloat(match[0].replace(",", "."));
  return isNaN(n) ? null : n;
}

function useCountUp(target: string, duration = 900): string {
  const targetNum = extractNumber(target);
  const [displayValue, setDisplayValue] = useState(target);
  const frameRef = useRef<number>(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Only animate after first mount and when we have a real number
    if (!mountedRef.current) {
      mountedRef.current = true;
    }
    if (targetNum === null || target === "—") {
      setDisplayValue(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / duration;
      const eased = elapsed >= 1 ? 1 : 1 - Math.pow(2, -10 * elapsed);
      const current = targetNum * eased;

      // Re-format using the same structure as the original value
      // Replace the number in the original string
      const formatted = target.replace(
        /(-?[\d\s,]+(?:\.\d+)?)/,
        () => {
          if (Math.abs(targetNum) >= 1000) {
            // Format with thousands separator
            return Math.round(current)
              .toLocaleString("fr-FR")
              .replace(",", " ");
          }
          if (target.includes(".")) {
            return current.toFixed(2);
          }
          return String(Math.round(current));
        }
      );
      setDisplayValue(formatted);

      if (elapsed < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayValue(target);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, targetNum, duration]);

  return displayValue;
}

// ─── StatsCard ────────────────────────────────────────────────────────────────

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  loading = false,
}: StatsCardProps) {
  const styles = VARIANT_STYLES[variant];
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const animatedValue = useCountUp(loading ? "—" : value);

  // Trigger entrance animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-8 w-32 rounded" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="skeleton h-11 w-11 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <Card
        className="relative overflow-hidden transition-all duration-200 hover:-translate-y-1 group"
        glow
      >
        {/* Top accent bar */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-px opacity-60",
            styles.accent
          )}
        />

        {/* Corner gradient */}
        <div
          className={cn(
            "absolute top-0 right-0 h-28 w-28 opacity-[0.04] rounded-bl-full transition-opacity group-hover:opacity-[0.08]",
            variant === "profit" && "bg-emerald-400",
            variant === "danger" && "bg-red-400",
            variant === "warning" && "bg-amber-400",
            variant === "indigo" && "bg-indigo-400",
            variant === "default" && "bg-primary"
          )}
        />

        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                {title}
              </p>
              <p
                className={cn(
                  "text-2xl font-bold tracking-tight truncate tabular-nums",
                  styles.value
                )}
              >
                {animatedValue}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
              {trend && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-bold rounded-full px-1.5 py-0.5",
                      trend.value >= 0
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {trend.value >= 0 ? "+" : ""}
                    {trend.value}%
                  </span>
                  <span className="text-xs text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>

            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-105",
                styles.icon,
                styles.iconGlow
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
