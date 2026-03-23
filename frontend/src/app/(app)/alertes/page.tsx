"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  Shield,
  FileText,
  ShoppingCart,
  DollarSign,
  HelpCircle,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  formatEuro,
  thresholdStatus,
  THRESHOLD_LABELS,
  THRESHOLD_COLORS,
  cn,
} from "@/lib/utils";
import { dashboardApi, type StatsResponse } from "@/lib/api";
import { useSidebar } from "../sidebar-context";

function useStats(year: number) {
  return useSWR<StatsResponse>(`/api/v1/dashboard/stats?year=${year}`, () =>
    dashboardApi.stats(year)
  );
}

function ThresholdBar({
  label,
  current,
  max,
  unit,
  percent,
}: {
  label: string;
  current: number;
  max: number;
  unit: "transactions" | "euros";
  percent: number;
}) {
  const status = thresholdStatus(percent);
  const colors = THRESHOLD_COLORS[status];
  const statusLabel = THRESHOLD_LABELS[status];

  const formattedCurrent =
    unit === "euros"
      ? formatEuro(current, { decimals: 0 })
      : `${current} transaction${current > 1 ? "s" : ""}`;
  const formattedMax =
    unit === "euros"
      ? formatEuro(max, { decimals: 0 })
      : `${max} transactions`;

  const progressColor =
    status === "safe"
      ? "bg-emerald-500"
      : status === "warning"
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            {formattedCurrent} sur {formattedMax}
          </p>
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-bold tabular-nums", colors.text)}>
            {Math.round(percent)}%
          </p>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
              colors.bg,
              colors.border,
              colors.text
            )}
          >
            {status === "exceeded" && (
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            )}
            {statusLabel}
          </div>
        </div>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            progressColor
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
        {/* Marker at 70% */}
        <div
          className="absolute top-0 h-full w-0.5 bg-amber-400/50"
          style={{ left: "70%" }}
          title="Seuil d'alerte (70%)"
        />
        {/* Marker at 85% */}
        <div
          className="absolute top-0 h-full w-0.5 bg-red-400/50"
          style={{ left: "85%" }}
          title="Zone danger (85%)"
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground/60">
        <span>0</span>
        <span className="text-amber-400/60">⚠ 70%</span>
        <span className="text-red-400/60">🚨 85%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default function AlertesPage() {
  const { openSidebar } = useSidebar();
  const year = new Date().getFullYear();
  const { data: stats, isLoading } = useStats(year);

  const txThreshold = stats?.threshold_transactions;
  const revThreshold = stats?.threshold_receipts;

  const txPercent = txThreshold ? Math.min(txThreshold.pct, 100) : 0;
  const revPercent = revThreshold ? Math.min(revThreshold.pct, 100) : 0;

  const alertLevel = stats?.alert_level ?? "safe";
  const isExceeded = alertLevel === "exceeded";
  const isWarning = alertLevel === "warning" && !isExceeded;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Alertes fiscales"
        subtitle="Seuils DAC7 et obligations déclaratives"
        onMenuClick={openSidebar}
      />

      <div className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Status alert banners */}
        {isExceeded && (
          <div className="flex items-start gap-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4">
            <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">
                Seuil DAC7 dépassé — déclaration obligatoire
              </p>
              <p className="text-sm text-red-400/80 mt-1">
                Vos données de vente ont été automatiquement transmises au DGFIP
                par votre plateforme. Vous devez les déclarer dans votre
                déclaration de revenus {year}.
              </p>
              <Button
                variant="soft-red"
                size="sm"
                className="mt-3 gap-2"
                asChild
              >
                <a
                  href="https://www.impots.gouv.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Accéder à impots.gouv.fr
                </a>
              </Button>
            </div>
          </div>
        )}

        {isWarning && (
          <div className="flex items-start gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-300">
                Vous approchez du seuil fiscal DAC7
              </p>
              <p className="text-sm text-amber-400/80 mt-1">
                Continuez à vendre et vous atteindrez bientôt le seuil de
                signalement obligatoire. Préparez votre déclaration à l'avance.
              </p>
            </div>
          </div>
        )}

        {!isExceeded && !isWarning && stats && (
          <div className="flex items-start gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-300">
                Vous êtes dans les clous
              </p>
              <p className="text-sm text-emerald-400/70 mt-1">
                Votre activité de revente reste en dessous des seuils de
                signalement DAC7. Continuez à suivre vos ventes avec Revendu.
              </p>
            </div>
          </div>
        )}

        {/* Current status card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Statut {year} — Seuils DAC7
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="skeleton h-20 rounded-xl" />
                <div className="skeleton h-20 rounded-xl" />
              </div>
            ) : (
              <>
                <ThresholdBar
                  label="Transactions"
                  current={txThreshold?.current ?? 0}
                  max={txThreshold?.max ?? 30}
                  unit="transactions"
                  percent={txPercent}
                />
                <Separator />
                <ThresholdBar
                  label="Recettes brutes"
                  current={revThreshold?.current ?? 0}
                  max={revThreshold?.max ?? 2000}
                  unit="euros"
                  percent={revPercent}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* What is DAC7 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              C'est quoi le seuil DAC7 ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Depuis le{" "}
              <strong className="text-foreground">1er janvier 2024</strong>,
              les plateformes comme Vinted, Leboncoin et eBay sont obligées de
              signaler automatiquement vos ventes au DGFIP si vous dépassez
              l'un des deux seuils :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-indigo-400" />
                  <span className="font-semibold text-foreground">
                    30 transactions
                  </span>
                </div>
                <p className="text-xs">
                  Si vous vendez plus de 30 articles dans l'année sur une même
                  plateforme, vos données sont transmises au fisc.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-foreground">
                    2 000 € de recettes
                  </span>
                </div>
                <p className="text-xs">
                  Si vous encaissez plus de 2 000 € bruts dans l'année, même
                  sur des articles achetés plus chers (à perte), les données
                  sont transmises.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Important :</strong> ces
                  seuils déclenchent uniquement la{" "}
                  <em>transmission automatique</em> des données. Le fait d'être
                  déclaré ne signifie pas forcément que vous devez payer des
                  impôts — cela dépend de votre situation et du caractère
                  habituel ou occasionnel de vos ventes.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What happens if exceeded */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Que se passe-t-il si je dépasse le seuil ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <ol className="space-y-4 list-none">
              {[
                {
                  step: "1",
                  title: "Transmission automatique",
                  desc: "La plateforme (Vinted, Leboncoin…) envoie vos données de vente directement au DGFIP. Vous recevez un récapitulatif annuel de la plateforme.",
                  color: "text-indigo-400 bg-indigo-500/10",
                },
                {
                  step: "2",
                  title: "Pré-remplissage de votre déclaration",
                  desc: "Ces données apparaissent pré-remplies dans votre déclaration de revenus. Vous devez les vérifier et les valider (ou corriger si erronées).",
                  color: "text-blue-400 bg-blue-500/10",
                },
                {
                  step: "3",
                  title: "Imposition éventuelle",
                  desc: "Seul le bénéfice net (prix de vente - prix d'achat - frais) est imposable. Si vous vendez à perte ou à prix équivalent, vous ne payez rien.",
                  color: "text-emerald-400 bg-emerald-500/10",
                },
              ].map(({ step, title, desc, color }) => (
                <li key={step} className="flex items-start gap-4">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      color
                    )}
                  >
                    {step}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Conseils pour rester dans les clous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "Conservez vos justificatifs d'achat (tickets de caisse, factures) pour prouver que vous vendez à perte ou sans bénéfice.",
                "Utilisez Revendu pour suivre votre profit net en temps réel et anticiper le dépassement du seuil.",
                "Si vous vendez régulièrement et dégagez un bénéfice, envisagez le statut de micro-entrepreneur pour simplifier votre fiscalité.",
                "En cas de doute, consultez un comptable spécialisé en e-commerce ou utilisez les guides officiels du DGFIP.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                    ✓
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* External links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Ressources officielles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                {
                  label: "DGFIP — Vente entre particuliers et impôts",
                  url: "https://www.impots.gouv.fr/particulier/les-revenus-tirer-dactivites-sur-les-plateformes-numeriques",
                  desc: "Guide officiel sur la fiscalité des plateformes numériques",
                },
                {
                  label: "Service public — DAC7 et plateformes numériques",
                  url: "https://www.service-public.fr/particuliers/vosdroits/F35310",
                  desc: "Présentation de la directive DAC7 en langage simple",
                },
                {
                  label: "Vinted — Centre d'aide fiscal",
                  url: "https://www.vinted.fr/help/1137",
                  desc: "Comprendre les récapitulatifs fiscaux Vinted",
                },
              ].map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {link.desc}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
