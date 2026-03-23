"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatEuro, formatDate, getPlatformConfig } from "@/lib/utils";
import type { Item } from "@/lib/api";

interface RecentSalesProps {
  readonly items: Item[];
  readonly loading?: boolean;
}

function PlatformDot({ platform }: { readonly platform: string }) {
  const cfg = getPlatformConfig(platform);
  return (
    <span
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{ background: cfg.color }}
      title={cfg.label}
    />
  );
}

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5"];

function SalesTableSkeleton() {
  return (
    <div className="space-y-3">
      {SKELETON_IDS.map((id) => (
        <div key={id} className="flex items-center gap-4">
          <div className="skeleton h-4 flex-1 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

function profitColor(profit: number): string {
  if (profit > 0) return "text-emerald-400";
  if (profit < 0) return "text-red-400";
  return "text-muted-foreground";
}

function profitLabel(profit: number): string {
  const prefix = profit >= 0 ? "+" : "";
  return `${prefix}${formatEuro(profit)}`;
}

export function RecentSales({ items, loading = false }: RecentSalesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Ventes récentes</CardTitle>
        <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground hover:text-foreground -mr-2">
          <Link href="/ventes">
            Voir tout
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SalesTableSkeleton />
        ) : items.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Aucune vente récente
          </div>
        ) : (
          <div className="space-y-0">
            <div className="grid grid-cols-[1fr_100px_80px_80px] gap-4 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
              <span>Article</span>
              <span>Plateforme</span>
              <span className="text-right">Prix</span>
              <span className="text-right">Bénéfice</span>
            </div>

            {items.map((item) => {
              const profit = item.net_profit ?? 0;
              const platformCfg = getPlatformConfig(item.platform);

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_100px_80px_80px] gap-4 py-3 items-center border-b border-border/50 last:border-0 hover:bg-accent/30 rounded-lg -mx-2 px-2 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.sale_date ?? item.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <PlatformDot platform={item.platform} />
                    <span className="text-xs text-muted-foreground truncate">
                      {platformCfg.label}
                    </span>
                  </div>

                  <p className="text-sm text-right font-medium">
                    {item.sale_price != null ? formatEuro(item.sale_price) : "—"}
                  </p>

                  <p className={`text-sm text-right font-semibold ${profitColor(profit)}`}>
                    {profitLabel(profit)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
