"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { itemsApi, type Item } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { formatEuro } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

const markSoldSchema = z.object({
  sell_price: z
    .string()
    .min(1, "Le prix de vente est requis")
    .transform((v) => Number.parseFloat(v.replace(",", ".")))
    .pipe(z.number().min(0.01, "Le prix doit être supérieur à 0")),
  fees: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseFloat(v.replace(",", ".")) : 0))
    .pipe(z.number().min(0).optional()),
  sold_at: z.string().optional(),
});

type MarkSoldFormValues = z.input<typeof markSoldSchema>;

interface MarkSoldDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly item: Item;
  readonly onSuccess?: (item: Item) => void;
}

export function MarkSoldDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: MarkSoldDialogProps) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MarkSoldFormValues>({
    resolver: zodResolver(markSoldSchema),
    defaultValues: {
      sell_price: "",
      fees: "",
      sold_at: new Date().toISOString().split("T")[0],
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        sell_price: "",
        fees: "",
        sold_at: new Date().toISOString().split("T")[0],
      });
    }
  }, [open, reset]);

  const sellPriceRaw = watch("sell_price");
  const feesRaw = watch("fees");

  const sellPrice = Number.parseFloat(String(sellPriceRaw).replace(",", ".")) || 0;
  const fees = Number.parseFloat(String(feesRaw).replace(",", ".")) || 0;
  const estimatedProfit = sellPrice - item.purchase_price - fees;

  const onSubmit = async (raw: MarkSoldFormValues) => {
    try {
      const parsed = markSoldSchema.parse(raw);
      const result = await itemsApi.markSold(item.id, {
        sale_price: parsed.sell_price,
        sale_date: raw.sold_at || new Date().toISOString().split("T")[0],
        platform_fees: parsed.fees ?? 0,
      });

      toast({
        variant: "success",
        title: "Article marqué comme vendu !",
        description: `Bénéfice net : ${formatEuro(result.net_profit ?? 0)}`,
      });

      onSuccess?.(result);
      onOpenChange(false);
    } catch (err) {
      toast({
        variant: "error",
        title: "Erreur",
        description:
          err instanceof Error ? err.message : "Une erreur est survenue",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Marquer comme vendu</DialogTitle>
          <DialogDescription>
            {"Renseignez le prix de vente final pour "}
            <span className="font-medium text-foreground">{item.name}</span>
            {"."}
          </DialogDescription>
        </DialogHeader>

        {/* Item summary */}
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Prix d'achat</span>
            <span className="font-medium">{formatEuro(item.purchase_price)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Sell price */}
          <div className="space-y-1.5">
            <Label htmlFor="sell_price">
              {"Prix de vente (€) "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sell_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={!!errors.sell_price}
              {...register("sell_price")}
              autoFocus
            />
            {errors.sell_price && (
              <p className="text-xs text-destructive">
                {errors.sell_price.message}
              </p>
            )}
          </div>

          {/* Fees */}
          <div className="space-y-1.5">
            <Label htmlFor="fees">
              {"Frais (€) "}
              <span className="text-xs text-muted-foreground">
                (commissions, envoi...)
              </span>
            </Label>
            <Input
              id="fees"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("fees")}
            />
          </div>

          {/* Sold date */}
          <div className="space-y-1.5">
            <Label htmlFor="sold_at">Date de vente</Label>
            <Input
              id="sold_at"
              type="date"
              {...register("sold_at")}
            />
          </div>

          {/* Live profit preview */}
          {sellPrice > 0 && (
            <div
              className={`rounded-xl border px-4 py-3 transition-all ${
                estimatedProfit >= 0
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-red-500/30 bg-red-500/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={`h-4 w-4 ${
                    estimatedProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                />
                <span className="text-sm font-medium">Bénéfice estimé</span>
                <span
                  className={`ml-auto text-lg font-bold tabular-nums ${
                    estimatedProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {estimatedProfit >= 0 ? "+" : ""}
                  {formatEuro(estimatedProfit)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting} variant="emerald">
              Confirmer la vente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
