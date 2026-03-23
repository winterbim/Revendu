"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { ItemTable } from "@/components/items/ItemTable";
import { useSidebar } from "../sidebar-context";

// ─── Empty state illustration ──────────────────────────────────────────────────

function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 180 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-32 w-auto opacity-60"
      aria-hidden="true"
    >
      {/* Box outline */}
      <rect x="50" y="50" width="80" height="68" rx="8" stroke="#6366f1" strokeWidth="2" strokeDasharray="5 3" />
      {/* Box flaps */}
      <path d="M50 66h80" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" />
      <path d="M90 50v16" stroke="#6366f1" strokeWidth="1.5" />
      <path d="M50 50l10-14h60l10 14" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Tag */}
      <rect x="70" y="78" width="40" height="22" rx="4" fill="#6366f1" fillOpacity="0.15" stroke="#6366f1" strokeWidth="1.5" />
      <line x1="82" y1="89" x2="98" y2="89" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="82" y1="94" x2="93" y2="94" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Sparkles */}
      <circle cx="38" cy="40" r="3" fill="#34d399" fillOpacity="0.5" />
      <circle cx="148" cy="72" r="2" fill="#818cf8" fillOpacity="0.6" />
      <circle cx="140" cy="38" r="4" fill="#6366f1" fillOpacity="0.3" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VentesPage() {
  const { openSidebar } = useSidebar();

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Mes ventes"
        subtitle="Gérez votre inventaire et vos ventes"
        onMenuClick={openSidebar}
        action={
          <Link
            href="/sync"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Connecter Gmail
          </Link>
        }
      />
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <ItemTable />
      </div>
    </div>
  );
}
