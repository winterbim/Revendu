"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider, hasToken } from "@/lib/auth";
import { SWRConfig } from "swr";
import { swrFetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SidebarContext } from "./sidebar-context";

function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!hasToken()) {
      router.replace("/login");
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — fixed on desktop, slide-in on mobile */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[240px] transition-transform duration-300 ease-in-out",
            "md:relative md:translate-x-0 md:z-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        onError: (err) => {
          if (err?.status !== 401) {
            console.error("[SWR Error]", err);
          }
        },
      }}
    >
      <AuthProvider>
        <AppShell>{children}</AppShell>
      </AuthProvider>
    </SWRConfig>
  );
}
