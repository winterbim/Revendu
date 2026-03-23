"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { useSidebar } from "../sidebar-context";
import { exportApi } from "@/lib/api";

// ─── Helper — download a binary response as a file ────────────────────────────

async function downloadBlob(res: Response, filename: string): Promise<void> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = (err as { detail?: string }).detail ?? `Erreur ${res.status}`;
    throw new Error(detail);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ─── Template Card ─────────────────────────────────────────────────────────────

interface TemplateCardProps {
  readonly icon: React.ElementType;
  readonly title: string;
  readonly description: string;
  readonly buttonLabel: string;
  readonly onDownload: () => Promise<void>;
}

function TemplateCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  onDownload,
}: TemplateCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      await onDownload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du téléchargement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/6 bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
          <Icon className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 border border-red-500/20">
          {error}
        </p>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:text-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/20"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {buttonLabel}
      </button>
    </div>
  );
}

// ─── Export Card ──────────────────────────────────────────────────────────────

interface ExportCardProps {
  readonly icon: React.ElementType;
  readonly title: string;
  readonly description: string;
  readonly buttonLabel: string;
  readonly year: number;
  readonly onExport: (year: number) => Promise<void>;
}

function ExportCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  year,
  onExport,
}: ExportCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      await onExport(year);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'export");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/6 bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
          <Icon className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 border border-red-500/20">
          {error}
        </p>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/20"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {buttonLabel}
      </button>
    </div>
  );
}

// ─── Module-scope export handlers ─────────────────────────────────────────────

async function handleExcelExport(year: number) {
  const res = await exportApi.excel(year);
  await downloadBlob(res, `revendu-export-${year}.xlsx`);
}

async function handlePdfExport(year: number) {
  const res = await exportApi.pdf(year);
  await downloadBlob(res, `revendu-rapport-${year}.pdf`);
}

async function handleTemplateExcel() {
  const res = await exportApi.templateExcel();
  await downloadBlob(res, "revendu-template.xlsx");
}

async function handleTemplateCsv() {
  const res = await exportApi.templateCsv();
  await downloadBlob(res, "revendu-template.csv");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const { openSidebar } = useSidebar();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = Array.from({ length: 5 }, (_, i) => 2022 + i);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Rapports & Export"
        subtitle="Téléchargez vos données et rapports fiscaux"
        onMenuClick={openSidebar}
      />

      <div className="flex-1 p-4 md:p-6 space-y-8 max-w-3xl mx-auto w-full">

        {/* ── Section 1 : Export de vos données ──────────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground">Export de vos données</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Exportez vos ventes et rapports fiscaux.
              </p>
            </div>

            {/* Year selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="export-year" className="text-sm text-muted-foreground whitespace-nowrap">
                Année :
              </label>
              <select
                id="export-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ExportCard
              icon={FileSpreadsheet}
              title="Export Excel (.xlsx)"
              description="Rapport complet avec 3 feuilles : résumé, ventes détaillées, déclaration fiscale"
              buttonLabel="Exporter en Excel"
              year={selectedYear}
              onExport={handleExcelExport}
            />
            <ExportCard
              icon={FileText}
              title="Export PDF"
              description="Rapport PDF professionnel prêt pour votre comptable ou votre déclaration d'impôts"
              buttonLabel="Exporter en PDF"
              year={selectedYear}
              onExport={handlePdfExport}
            />
          </div>
        </section>

        {/* ── Section 2 : Templates ───────────────────────────────────────── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Templates d&apos;import</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Utilisez ces templates pour préparer votre fichier d&apos;import.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TemplateCard
              icon={FileSpreadsheet}
              title="Template Excel (.xlsx)"
              description="Template Excel professionnel avec validation des données et guide intégré"
              buttonLabel="Télécharger le template Excel"
              onDownload={handleTemplateExcel}
            />
            <TemplateCard
              icon={FileText}
              title="Template CSV"
              description="Format CSV universel, compatible avec tous les tableurs"
              buttonLabel="Télécharger le template CSV"
              onDownload={handleTemplateCsv}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
