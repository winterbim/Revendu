"use client";

import React, { useState, useCallback } from "react";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Download,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemForm } from "./ItemForm";
import { MarkSoldDialog } from "./MarkSoldDialog";
import {
  formatEuro,
  formatDate,
  getPlatformConfig,
  getStatusConfig,
  PLATFORMS,
  STATUSES,
  cn,
} from "@/lib/utils";
import { itemsApi, type Item, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import useSWR from "swr";

interface FiltersState {
  platform: string;
  status: string;
  search: string;
  date_from: string;
  date_to: string;
}

function DeleteConfirmDialog({
  item,
  open,
  onConfirm,
  onCancel,
  loading,
}: {
  readonly item: Item;
  readonly open: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="button"
        tabIndex={0}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onCancel(); }}
        aria-label="Fermer"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-slide-in">
        <h2 className="text-lg font-semibold">Supprimer l'article ?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{item.name}</span> sera
          définitivement supprimé. Cette action est irréversible.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={loading}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}

const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];

function SkeletonRow() {
  return (
    <tr>
      {SKELETON_COLS.map((id) => (
        <td key={id} className="px-4 py-3">
          <div className="skeleton h-4 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function ItemTable() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [filters, setFilters] = useState<FiltersState>({
    platform: "",
    status: "",
    search: "",
    date_from: "",
    date_to: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [soldItem, setSoldItem] = useState<Item | null>(null);
  const [deleteItem, setDeleteItem] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const swrKey = `/api/v1/items?platform=${filters.platform}&status=${filters.status}&search=${filters.search}&date_from=${filters.date_from}&date_to=${filters.date_to}&page=${page}`;

  const { data: allItems = [], isLoading, mutate } = useSWR<Item[]>(
    swrKey,
    () =>
      itemsApi.list({
        platform: filters.platform || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
      }),
    { keepPreviousData: true }
  );

  // Client-side pagination
  const total = allItems.length;
  const totalPages = Math.ceil(total / pageSize);
  const items = allItems.slice((page - 1) * pageSize, page * pageSize);

  const handleFilterChange = useCallback(
    (key: keyof FiltersState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await itemsApi.delete(deleteItem.id);
      toast({
        variant: "success",
        title: "Article supprimé",
        description: `"${deleteItem.name}" a été supprimé.`,
      });
      mutate();
      setDeleteItem(null);
    } catch (err) {
      toast({
        variant: "error",
        title: "Erreur",
        description:
          err instanceof Error ? err.message : "Impossible de supprimer l'article",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccess = () => {
    mutate();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Rechercher un article..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {(filters.platform || filters.status) && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {[filters.platform, filters.status].filter(Boolean).length}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={async () => {
              try {
                const blobUrl = await itemsApi.downloadCsv();
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = `revendu_ventes_${new Date().getFullYear()}.csv`;
                a.click();
                URL.revokeObjectURL(blobUrl);
              } catch (err) {
                toast({
                  variant: "error",
                  title: "Export échoué",
                  description: err instanceof ApiError ? err.message : "Impossible de télécharger le CSV",
                });
              }
            }}
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="indigo"
            size="sm"
            className="gap-2"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card/50 p-4 animate-slide-in">
          <div className="w-40">
            <Select
              value={filters.platform || "__all"}
              onValueChange={(v) =>
                handleFilterChange("platform", v === "__all" ? "" : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Plateforme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Toutes les plateformes</SelectItem>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select
              value={filters.status || "__all"}
              onValueChange={(v) =>
                handleFilterChange("status", v === "__all" ? "" : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Tous les statuts</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-36 text-xs"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              placeholder="Du"
            />
            <span className="text-muted-foreground text-sm">→</span>
            <Input
              type="date"
              className="w-36 text-xs"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              placeholder="Au"
            />
          </div>
          {(filters.platform || filters.status || filters.date_from || filters.date_to) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                setFilters({ platform: "", status: "", search: filters.search, date_from: "", date_to: "" });
                setPage(1);
              }}
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Article
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Plateforme
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Prix achat
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Prix vente
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Bénéfice
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }, (_, i) => <SkeletonRow key={`sk-${i}`} />)
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Aucun article trouvé</p>
                        <p className="text-sm">
                          {filters.search || filters.platform || filters.status
                            ? "Essayez d'ajuster vos filtres"
                            : "Commencez par ajouter un article"}
                        </p>
                      </div>
                      {!filters.search && !filters.platform && !filters.status && (
                        <Button
                          variant="indigo"
                          size="sm"
                          onClick={() => setAddOpen(true)}
                          className="gap-2 mt-1"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter mon premier article
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const platformCfg = getPlatformConfig(item.platform);
                  const statusCfg = getStatusConfig(item.status);
                  const profit = item.net_profit;
                  const profitColor = profit === null ? "text-muted-foreground"
                    : profit > 0 ? "text-emerald-400"
                    : profit < 0 ? "text-red-400"
                    : "text-muted-foreground";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-accent/20 transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[200px]">
                          {item.name}
                        </p>
                      </td>

                      {/* Platform */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full shrink-0"
                            style={{ background: platformCfg.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {platformCfg.label}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            "text-xs border",
                            statusCfg.color
                          )}
                          dot
                        >
                          {statusCfg.label}
                        </Badge>
                      </td>

                      {/* Buy price */}
                      <td className="px-4 py-3 text-right font-medium">
                        {formatEuro(item.purchase_price)}
                      </td>

                      {/* Sell price */}
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {item.sale_price != null ? formatEuro(item.sale_price) : "—"}
                      </td>

                      {/* Net profit */}
                      <td className="px-4 py-3 text-right">
                        <span className={cn("font-semibold tabular-nums", profitColor)}>
                          {profit != null ? `${profit >= 0 ? "+" : ""}${formatEuro(profit)}` : "—"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDate(item.sale_date ?? item.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => setEditItem(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            {item.status === "unsold" && (
                              <DropdownMenuItem
                                className="gap-2 text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10"
                                onClick={() => setSoldItem(item)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Marquer comme vendu
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2"
                              destructive
                              onClick={() => setDeleteItem(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {total} article{total > 1 ? "s" : ""} au total
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Précédent
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Suivant →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ItemForm
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={handleSuccess}
      />
      {editItem && (
        <ItemForm
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          item={editItem}
          onSuccess={handleSuccess}
        />
      )}
      {soldItem && (
        <MarkSoldDialog
          open={!!soldItem}
          onOpenChange={(open) => !open && setSoldItem(null)}
          item={soldItem}
          onSuccess={handleSuccess}
        />
      )}
      {deleteItem && (
        <DeleteConfirmDialog
          item={deleteItem}
          open={!!deleteItem}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
