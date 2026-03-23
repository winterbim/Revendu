import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Merge Tailwind classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Euros (French locale).
 * @example formatEuro(1234.5) → "1 234,50 €"
 */
export function formatEuro(
  amount: number | null | undefined,
  options: { decimals?: number; compact?: boolean } = {}
): string {
  if (amount === null || amount === undefined) return "—";
  const { decimals = 2, compact = false } = options;

  if (compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format a date string (ISO) to French locale.
 */
export function formatDate(
  dateStr: string | null | undefined,
  fmt: string = "dd MMM yyyy"
): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), fmt, { locale: fr });
  } catch {
    return "—";
  }
}

/**
 * Format a date as relative time in French.
 * @example formatRelative("2024-01-15T12:00:00Z") → "il y a 3 jours"
 */
export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(parseISO(dateStr), {
      addSuffix: true,
      locale: fr,
    });
  } catch {
    return "—";
  }
}

/**
 * Calculate profit percentage.
 */
export function calcProfitPercent(
  buyPrice: number,
  sellPrice: number
): number {
  if (buyPrice === 0) return 100;
  return ((sellPrice - buyPrice) / buyPrice) * 100;
}

/**
 * Compute DAC7 threshold percentage.
 */
export function thresholdPercent(current: number, max: number): number {
  return Math.min((current / max) * 100, 100);
}

/**
 * Return threshold status based on percentage.
 */
export function thresholdStatus(percent: number): "safe" | "warning" | "danger" | "exceeded" {
  if (percent >= 100) return "exceeded";
  if (percent >= 85) return "danger";
  if (percent >= 70) return "warning";
  return "safe";
}

/**
 * Threshold status labels in French.
 */
export const THRESHOLD_LABELS: Record<
  ReturnType<typeof thresholdStatus>,
  string
> = {
  safe: "Vous êtes dans les clous",
  warning: "Attention, vous approchez",
  danger: "Seuil bientôt atteint !",
  exceeded: "Seuil dépassé — déclaration obligatoire",
};

/**
 * Threshold status colors (Tailwind class fragments).
 */
export const THRESHOLD_COLORS: Record<
  ReturnType<typeof thresholdStatus>,
  { text: string; bg: string; border: string; hex: string }
> = {
  safe: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    hex: "#10b981",
  },
  warning: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    hex: "#f59e0b",
  },
  danger: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    hex: "#ef4444",
  },
  exceeded: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    hex: "#ef4444",
  },
};

/**
 * Platform display config.
 */
export const PLATFORMS = [
  { value: "vinted", label: "Vinted", color: "#09b1b8" },
  { value: "leboncoin", label: "Leboncoin", color: "#f56b2a" },
  { value: "ebay", label: "eBay", color: "#e43137" },
  { value: "vestiaire", label: "Vestiaire Collective", color: "#000000" },
  { value: "autres", label: "Autre", color: "#6366f1" },
] as const;

export type Platform = (typeof PLATFORMS)[number]["value"];

export function getPlatformConfig(platform: string) {
  return PLATFORMS.find((p) => p.value === platform) ?? PLATFORMS[4];
}

/**
 * Item status config — matches backend "unsold" | "sold".
 */
export const STATUSES = [
  { value: "unsold", label: "En stock", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  { value: "sold", label: "Vendu", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
] as const;

export type ItemStatus = (typeof STATUSES)[number]["value"];

export function getStatusConfig(status: string) {
  return STATUSES.find((s) => s.value === status) ?? STATUSES[0];
}

/**
 * Generate initials from a full name.
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Clamp a number between min and max.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
