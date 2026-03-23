"use client";

import React from "react";
import { cn, thresholdStatus, THRESHOLD_LABELS, THRESHOLD_COLORS, formatEuro } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GaugeArcProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

function GaugeArc({ percent, size = 140, strokeWidth = 12 }: GaugeArcProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // half circle arc
  const clampedPercent = Math.min(percent, 100);
  const offset = circumference - (clampedPercent / 100) * circumference;

  const status = thresholdStatus(percent);
  const color = THRESHOLD_COLORS[status].hex;

  // The arc starts at 180° (left) and ends at 0° (right)
  // We use a semicircle: startAngle = 180, endAngle = 0
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size / 2 + strokeWidth / 2}
      viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}
      className="overflow-visible"
    >
      {/* Background arc */}
      <path
        d={describeArc(cx, cy, radius, 180, 0)}
        fill="none"
        stroke="hsl(240 6% 17%)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Foreground arc */}
      {clampedPercent > 0 && (
        <path
          d={describeArc(cx, cy, radius, 180, 180 - (clampedPercent / 100) * 180)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            filter:
              status === "exceeded"
                ? `drop-shadow(0 0 6px ${color}88)`
                : status === "danger"
                ? `drop-shadow(0 0 4px ${color}66)`
                : undefined,
            transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      )}

      {/* Pulsing ring when exceeded */}
      {status === "exceeded" && (
        <path
          d={describeArc(cx, cy, radius, 180, 0)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity="0.3"
          className="animate-pulse-ring"
        />
      )}
    </svg>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

interface ThresholdItemProps {
  label: string;
  current: number;
  max: number;
  unit: "transactions" | "euros";
  percent: number;
}

function ThresholdItem({ label, current, max, unit, percent }: ThresholdItemProps) {
  const status = thresholdStatus(percent);
  const colors = THRESHOLD_COLORS[status];
  const statusLabel = THRESHOLD_LABELS[status];

  const formattedCurrent =
    unit === "euros" ? formatEuro(current, { decimals: 0 }) : `${current}`;
  const formattedMax =
    unit === "euros" ? formatEuro(max, { decimals: 0 }) : `${max}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex flex-col items-center">
        <GaugeArc percent={percent} size={144} strokeWidth={13} />
        {/* Center text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-1">
          <p className={cn("text-xl font-bold tabular-nums", colors.text)}>
            {Math.round(percent)}%
          </p>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {formattedCurrent} / {formattedMax}
        </p>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            colors.bg,
            colors.border,
            colors.text
          )}
        >
          {status === "exceeded" && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          )}
          {statusLabel}
        </div>
      </div>
    </div>
  );
}

interface ThresholdGaugeProps {
  readonly transactionsCount: number;
  readonly transactionsMax: number;
  readonly grossRevenue: number;
  readonly revenueMax: number;
  readonly alertLevel?: "safe" | "warning" | "danger" | "exceeded";
  readonly loading?: boolean;
}

export function ThresholdGauge({
  transactionsCount,
  transactionsMax,
  grossRevenue,
  revenueMax,
  loading = false,
}: ThresholdGaugeProps) {
  const txPercent = Math.min((transactionsCount / transactionsMax) * 100, 100);
  const revPercent = Math.min((grossRevenue / revenueMax) * 100, 100);

  const txStatus = thresholdStatus(txPercent);
  const revStatus = thresholdStatus(revPercent);
  const isExceeded = txStatus === "exceeded" || revStatus === "exceeded";
  const isWarning =
    (txStatus === "warning" || txStatus === "danger") ||
    (revStatus === "warning" || revStatus === "danger");

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-48 rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="skeleton h-40 rounded-xl" />
            <div className="skeleton h-40 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        isExceeded && "border-red-500/40 shadow-red-500/10 shadow-lg",
        isWarning && !isExceeded && "border-amber-500/30"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Seuils fiscaux DAC7
          <span className="text-xs font-normal text-muted-foreground">
            (année {new Date().getFullYear()})
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Au-delà de 30 transactions <em>ou</em> 2 000 € de recettes, vos
          plateformes signalent vos ventes au DGFIP.
        </p>
      </CardHeader>
      <CardContent>
        {isExceeded && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <span className="text-base">🚨</span>
            <div>
              <p className="text-sm font-semibold text-red-300">
                Seuil dépassé — déclaration obligatoire
              </p>
              <p className="text-xs text-red-400/80 mt-0.5">
                Vos données ont été transmises au DGFIP. Consultez votre
                espace personnel impots.gouv.fr.
              </p>
            </div>
          </div>
        )}

        {isWarning && !isExceeded && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <span className="text-base">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Vous approchez du seuil fiscal DAC7
              </p>
              <p className="text-xs text-amber-400/80 mt-0.5">
                Ralentissez ou préparez votre déclaration. Consultez la page
                Alertes pour plus d'informations.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 pt-2">
          <ThresholdItem
            label="Transactions"
            current={transactionsCount}
            max={transactionsMax}
            unit="transactions"
            percent={txPercent}
          />
          <ThresholdItem
            label="Recettes brutes"
            current={grossRevenue}
            max={revenueMax}
            unit="euros"
            percent={revPercent}
          />
        </div>
      </CardContent>
    </Card>
  );
}
