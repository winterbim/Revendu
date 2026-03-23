"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  RefreshCw,
  CheckCircle2,
  Loader2,
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  LogOut as Disconnect,
} from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { useSidebar } from "../sidebar-context";
import {
  syncApi,
  exportApi,
  importApi,
  type SyncStatus,
  type SyncResult,
  type ImportResult,
  ApiError,
} from "@/lib/api";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Google SVG Icon ──────────────────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Gmail Card ───────────────────────────────────────────────────────────────

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
        fill="#EA4335"
      />
    </svg>
  );
}

function OutlookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.5q0 .39-.28.66-.28.26-.67.26-.39 0-.66-.26-.26-.28-.26-.66V3.5H9V6h7.5q.39 0 .65.27.27.26.27.65v10.2l-7.5-4.7V17H22.5v-5h1.5v0zM8.23 7.75q-.01-.02 0 0zM7 14.5V9.3l-4.7 2.7 4.7 2.5z"
        fill="#0078D4"
      />
    </svg>
  );
}

// ─── Download helper ──────────────────────────────────────────────────────────

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

// ─── Gmail Card Component ─────────────────────────────────────────────────────

function GmailCard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const codeProcessed = useRef(false);

  const {
    data: status,
    isLoading,
    mutate,
  } = useSWR<SyncStatus>("/api/v1/sync/status", () => syncApi.status(), {
    refreshInterval: 30_000,
  });

  // Handle OAuth callback: ?code=XXX
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || codeProcessed.current) return;
    codeProcessed.current = true;

    setIsConnecting(true);
    syncApi
      .gmailConnect(code)
      .then(() => {
        mutate();
        // Remove ?code from URL
        router.replace("/sync");
      })
      .catch((err) => {
        setSyncError(
          err instanceof ApiError ? err.message : "Erreur de connexion Gmail"
        );
      })
      .finally(() => {
        setIsConnecting(false);
      });
  }, [searchParams, mutate, router]);

  async function handleConnect() {
    try {
      const { auth_url } = await syncApi.gmailAuthorize();
      window.location.href = auth_url;
    } catch (err) {
      setSyncError(
        err instanceof ApiError ? err.message : "Impossible d'obtenir l'URL d'autorisation"
      );
    }
  }

  async function handleSync() {
    setSyncError(null);
    setSyncResult(null);
    setIsSyncing(true);
    try {
      const result = await syncApi.gmailSync();
      setSyncResult(result);
      mutate();
    } catch (err) {
      setSyncError(
        err instanceof ApiError ? err.message : "Erreur lors de la synchronisation"
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      await syncApi.gmailDisconnect();
      setSyncResult(null);
      mutate();
    } catch (err) {
      setSyncError(
        err instanceof ApiError ? err.message : "Erreur lors de la déconnexion"
      );
    } finally {
      setIsDisconnecting(false);
    }
  }

  const isConnected = status?.gmail_connected ?? false;

  // State: loading / connecting from OAuth
  if (isLoading || isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/8 bg-card p-10 text-center min-h-[280px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {isConnecting ? "Connexion en cours…" : "Chargement…"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isConnecting
              ? "Finalisation de votre connexion Gmail"
              : "Vérification de votre compte Gmail"}
          </p>
        </div>
      </div>
    );
  }

  // State: syncing
  if (isSyncing) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-10 text-center min-h-[280px]">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/30">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-foreground">Lecture de vos emails…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            On cherche vos ventes Vinted, Leboncoin et eBay
          </p>
        </div>
      </div>
    );
  }

  // State: not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/8 bg-card p-8 text-center">
        {/* Gmail Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/8 shadow-lg">
          <GmailIcon className="h-9 w-9" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">Connecter Gmail</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Importez automatiquement vos ventes Vinted, Leboncoin et eBay
            depuis vos emails de confirmation
          </p>
        </div>

        {syncError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 w-full max-w-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {syncError}
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40"
          >
            <GoogleIcon className="h-4 w-4" />
            Connecter avec Google
          </button>
          <p className="text-xs text-muted-foreground/70">
            Lecture seule • Aucun email lu sans votre accord
          </p>
        </div>
      </div>
    );
  }

  // State: connected
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <GmailIcon className="h-8 w-8" />
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">Gmail connecté</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Actif
            </span>
          </div>
          {status?.last_sync ? (
            <p className="text-sm text-muted-foreground">
              Dernière sync : {formatRelative(status.last_sync)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Jamais synchronisé</p>
          )}
        </div>
      </div>

      {/* Sync result */}
      {syncResult && (
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/15 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-300">
            {syncResult.imported} vente{syncResult.imported !== 1 ? "s" : ""} importée
            {syncResult.imported !== 1 ? "s" : ""}
            {syncResult.skipped > 0 && (
              <span className="text-muted-foreground font-normal">
                {" "}· {syncResult.skipped} ignorée{syncResult.skipped !== 1 ? "s" : ""}
              </span>
            )}
          </p>
          {syncResult.errors.length > 0 && (
            <p className="mt-1 text-xs text-amber-400">
              {syncResult.errors.length} erreur{syncResult.errors.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {syncError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {syncError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSync}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
        >
          <RefreshCw className="h-4 w-4" />
          Synchroniser maintenant
        </button>
        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
        >
          {isDisconnecting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Disconnect className="h-3.5 w-3.5" />
          )}
          Déconnecter
        </button>
      </div>
    </div>
  );
}

// ─── Outlook Card (coming soon) ───────────────────────────────────────────────

function OutlookCard() {
  return (
    <div className="relative flex flex-col items-center gap-6 rounded-2xl border border-white/6 bg-card/50 p-8 text-center opacity-60 select-none overflow-hidden">
      {/* Coming soon badge */}
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center rounded-full bg-white/8 border border-white/12 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Bientôt disponible
        </span>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/8">
        <OutlookIcon className="h-9 w-9" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-foreground">Connecter Outlook</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Importez vos ventes depuis votre boîte Outlook ou Hotmail
        </p>
      </div>

      <button
        disabled
        className="inline-flex items-center gap-3 rounded-xl bg-[#0078D4]/20 px-6 py-3 text-sm font-semibold text-[#4aa3e8] cursor-not-allowed"
      >
        Connecter avec Microsoft
      </button>
    </div>
  );
}

// ─── Manual Import Section ────────────────────────────────────────────────────

function ManualImportSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportResult(null);
    setImporting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let result: ImportResult;
      if (ext === "csv") {
        result = await importApi.csv(file);
      } else {
        result = await importApi.excel(file);
      }
      setImportResult(result);
    } catch (err) {
      setImportError(
        err instanceof ApiError ? err.message : "Erreur lors de l'import"
      );
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDownloadExcel() {
    setDownloadingExcel(true);
    try {
      const res = await exportApi.templateExcel();
      await downloadBlob(res, "revendu-template.xlsx");
    } catch {
      // silent
    } finally {
      setDownloadingExcel(false);
    }
  }

  async function handleDownloadCsv() {
    setDownloadingCsv(true);
    try {
      const res = await exportApi.templateCsv();
      await downloadBlob(res, "revendu-template.csv");
    } catch {
      // silent
    } finally {
      setDownloadingCsv(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Ou importez manuellement
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Template Excel */}
        <button
          onClick={handleDownloadExcel}
          disabled={downloadingExcel}
          className={cn(
            "flex items-center gap-3 rounded-xl border border-white/8 bg-card p-4 text-left transition-all",
            "hover:bg-white/5 hover:border-white/12 disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            {downloadingExcel ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Template Excel</p>
            <p className="text-xs text-muted-foreground">Télécharger .xlsx</p>
          </div>
        </button>

        {/* Template CSV */}
        <button
          onClick={handleDownloadCsv}
          disabled={downloadingCsv}
          className={cn(
            "flex items-center gap-3 rounded-xl border border-white/8 bg-card p-4 text-left transition-all",
            "hover:bg-white/5 hover:border-white/12 disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
            {downloadingCsv ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            ) : (
              <FileText className="h-4 w-4 text-indigo-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Template CSV</p>
            <p className="text-xs text-muted-foreground">Télécharger .csv</p>
          </div>
        </button>

        {/* Upload file */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className={cn(
            "flex items-center gap-3 rounded-xl border border-dashed border-white/12 bg-card/50 p-4 text-left transition-all",
            "hover:bg-white/5 hover:border-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
            ) : (
              <Upload className="h-4 w-4 text-violet-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Importer un fichier</p>
            <p className="text-xs text-muted-foreground">CSV ou Excel</p>
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileImport}
      />

      {importResult && (
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
          {importResult.imported} article{importResult.imported !== 1 ? "s" : ""} importé
          {importResult.imported !== 1 ? "s" : ""}
          {importResult.errors.length > 0 && (
            <span className="text-amber-400">
              {" "}· {importResult.errors.length} erreur{importResult.errors.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {importError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {importError}
        </div>
      )}
    </section>
  );
}

// ─── Platforms Section ────────────────────────────────────────────────────────

function PlatformsSection() {
  const platforms = [
    { name: "Vinted", color: "#09b1b8" },
    { name: "Leboncoin", color: "#f56b2a" },
    { name: "eBay", color: "#e43137" },
    { name: "Vestiaire", color: "#8b5cf6" },
  ];

  return (
    <section className="rounded-2xl border border-white/6 bg-card/30 px-6 py-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Ventes détectées automatiquement depuis
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {platforms.map((p) => (
              <span
                key={p.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-medium text-foreground/80"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: p.color }}
                />
                {p.name}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60 max-w-[220px] leading-relaxed">
          Nous lisons uniquement les emails de confirmation de vente
        </p>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SyncPage() {
  const { openSidebar } = useSidebar();

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Connecter mes comptes"
        subtitle="Importez automatiquement vos ventes depuis vos emails"
        onMenuClick={openSidebar}
      />

      <div className="flex-1 p-4 md:p-6 space-y-8 max-w-3xl mx-auto w-full">

        {/* ── Section 1 — Connexion email ───────────────────────────────────── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Connexion email
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Synchronisez automatiquement vos ventes depuis votre boîte mail
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GmailCard />
            <OutlookCard />
          </div>
        </section>

        {/* ── Section 2 — Import manuel ─────────────────────────────────────── */}
        <ManualImportSection />

        {/* ── Section 3 — Plateformes détectées ────────────────────────────── */}
        <PlatformsSection />

        {/* Link to ventes */}
        <div className="text-center pb-2">
          <Link
            href="/ventes"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir mes ventes →
          </Link>
        </div>
      </div>
    </div>
  );
}
