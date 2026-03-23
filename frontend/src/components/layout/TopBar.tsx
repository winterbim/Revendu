"use client";

import React from "react";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn, formatRelative } from "@/lib/utils";
import useSWR from "swr";
import { alertsApi, type Alert } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  readonly title?: string;
  readonly subtitle?: React.ReactNode;
  readonly onMenuClick?: () => void;
  readonly action?: React.ReactNode;
}

function AlertsBell() {
  const { data: alerts } = useSWR<Alert[]>(
    "/api/v1/dashboard/alerts",
    () => alertsApi.list(),
    { refreshInterval: 60_000 }
  );

  const unread = alerts?.filter((a) => !a.is_read) ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {unread.length} non lue{unread.length > 1 ? "s" : ""}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!alerts || alerts.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <DropdownMenuItem
              key={alert.id}
              className={cn(
                "flex-col items-start gap-1 py-3 cursor-pointer",
                !alert.is_read && "bg-primary/5"
              )}
            >
              <div className="flex items-start gap-2 w-full">
                {!alert.is_read && (
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                )}
                <div className={cn("min-w-0 flex-1", alert.is_read && "pl-3.5")}>
                  <p className="text-sm font-medium leading-tight">
                    {alert.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatRelative(alert.created_at)}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        {alerts && alerts.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary text-sm">
              Voir toutes les alertes →
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopBar({ title, subtitle, onMenuClick, action }: TopBarProps) {
  const auth = useAuth();
  const fullName = auth.user?.full_name ?? null;

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-white/5 bg-background/85 backdrop-blur-md px-4 md:px-6 gap-4">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-muted-foreground"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menu</span>
      </Button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        {title && (
          <div>
            <h1 className="text-base font-bold text-gradient-indigo truncate">
              {title}
            </h1>
            {subtitle && (
              <div className="text-xs text-muted-foreground/70">{subtitle}</div>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {action}
        <AlertsBell />
        {/* User avatar */}
        {fullName && (
          <div
            title={fullName}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              "bg-gradient-to-br from-indigo-500/40 to-violet-500/40",
              "border border-indigo-500/30 text-[11px] font-bold text-indigo-200",
              "shadow-sm shadow-indigo-500/10 select-none"
            )}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
