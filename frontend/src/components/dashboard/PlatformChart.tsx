"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEuro, getPlatformConfig } from "@/lib/utils";
import type { PlatformBreakdown } from "@/lib/api";

interface PlatformChartProps {
  readonly data: PlatformBreakdown[];
  readonly loading?: boolean;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  const platform = getPlatformConfig(label as string);

  return (
    <div className="rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs font-semibold text-foreground mb-2">
        {platform.label}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: entry.color }}
            />
            <span className="text-xs text-muted-foreground">
              {entry.dataKey === "net_profit" ? "Bénéfice net" : "Recettes brutes"}
            </span>
            <span className="text-xs font-medium text-foreground ml-auto pl-4">
              {formatEuro(entry.value as number)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomXAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const platform = getPlatformConfig(payload?.value ?? "");
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="hsl(240 5% 55%)"
        fontSize={11}
      >
        {platform.label}
      </text>
    </g>
  );
}

export function PlatformChart({ data, loading = false }: PlatformChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="skeleton h-5 w-40 rounded" />
        </CardHeader>
        <CardContent>
          <div className="skeleton h-64 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Profit par plateforme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
            Aucune vente enregistrée pour l'instant
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span>Profit par plateforme</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-indigo-500 inline-block" />
              <span className="text-xs font-normal text-muted-foreground">Bénéfice net</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-indigo-500/30 inline-block" />
              <span className="text-xs font-normal text-muted-foreground">Recettes brutes</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
            barCategoryGap="30%"
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(240 6% 17%)"
              vertical={false}
            />
            <XAxis
              dataKey="platform"
              tick={<CustomXAxisTick />}
              axisLine={false}
              tickLine={false}
              height={30}
            />
            <YAxis
              tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k€` : `${v}€`
              }
              width={52}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "hsl(240 6% 17% / 0.5)", radius: 6 }}
            />
            <Bar dataKey="gross" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry) => {
                const cfg = getPlatformConfig(entry.platform);
                return (
                  <Cell
                    key={entry.platform}
                    fill={`${cfg.color}33`}
                    stroke={cfg.color}
                    strokeWidth={1}
                  />
                );
              })}
            </Bar>
            <Bar dataKey="net_profit" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry) => {
                const cfg = getPlatformConfig(entry.platform);
                return (
                  <Cell
                    key={entry.platform}
                    fill={cfg.color}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
