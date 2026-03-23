"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORMS } from "@/lib/utils";
import { itemsApi, type Item } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const itemSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(500, "Nom trop long"),
  description: z.string().max(2000).optional(),
  platform: z.enum(["vinted", "leboncoin", "ebay", "vestiaire", "autres"], {
    errorMap: () => ({ message: "Sélectionnez une plateforme" }),
  }),
  purchase_price: z.string().min(1, "Le prix d'achat est requis"),
  purchase_date: z.string().min(1, "La date d'achat est requise"),
  sale_price: z.string().optional(),
  sale_date: z.string().optional(),
  platform_fees: z.string().optional(),
  shipping_cost: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly item?: Item;
  readonly onSuccess?: () => void;
}

function parseDecimal(val: string | undefined): number | undefined {
  if (!val || val.trim() === "") return undefined;
  const n = Number.parseFloat(val.replace(",", "."));
  return Number.isNaN(n) ? undefined : n;
}

function parseDecimalOrZero(val: string | undefined): number {
  return parseDecimal(val) ?? 0;
}

export function ItemForm({ open, onOpenChange, item, onSuccess }: ItemFormProps) {
  const { toast } = useToast();
  const isEditing = !!item;
  const today = new Date().toISOString().split("T")[0];

  const defaultValues: ItemFormValues = {
    name: item?.name ?? "",
    description: item?.description ?? "",
    platform: item?.platform ?? "vinted",
    purchase_price: item?.purchase_price != null ? String(item.purchase_price) : "",
    purchase_date: item?.purchase_date ?? today,
    sale_price: item?.sale_price != null ? String(item.sale_price) : "",
    sale_date: item?.sale_date ?? "",
    platform_fees: item?.platform_fees != null ? String(item.platform_fees) : "",
    shipping_cost: item?.shipping_cost != null ? String(item.shipping_cost) : "",
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues,
  });

  const watchedSalePrice = watch("sale_price");
  const hasSalePrice = !!watchedSalePrice && watchedSalePrice.trim() !== "";

  React.useEffect(() => {
    if (open) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const onSubmit = async (values: ItemFormValues) => {
    try {
      const purchasePrice = parseDecimal(values.purchase_price);
      if (purchasePrice === undefined || purchasePrice < 0) {
        toast({ variant: "error", title: "Prix invalide", description: "Le prix d'achat doit être un nombre positif." });
        return;
      }

      const salePrice = parseDecimal(values.sale_price);
      if (salePrice !== undefined && !values.sale_date) {
        toast({ variant: "error", title: "Date manquante", description: "La date de vente est requise quand un prix de vente est renseigné." });
        return;
      }

      const payload = {
        name: values.name,
        description: values.description || undefined,
        platform: values.platform,
        purchase_price: purchasePrice,
        purchase_date: values.purchase_date,
        ...(salePrice !== undefined && values.sale_date
          ? { sale_price: salePrice, sale_date: values.sale_date }
          : {}),
        platform_fees: parseDecimalOrZero(values.platform_fees),
        shipping_cost: parseDecimalOrZero(values.shipping_cost),
      };

      let result: Item;
      if (isEditing && item) {
        result = await itemsApi.update(item.id, payload);
        toast({ variant: "success", title: "Article modifié", description: `"${result.name}" a été mis à jour.` });
      } else {
        result = await itemsApi.create(payload);
        toast({ variant: "success", title: "Article ajouté", description: `"${result.name}" a été ajouté à votre inventaire.` });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast({
        variant: "error",
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'article" : "Ajouter un article"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de votre article."
              : "Ajoutez un article à votre inventaire."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              {"Nom de l'article "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Nike Air Force 1 Taille 42"
              error={!!errors.name}
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Platform + Purchase date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                {"Plateforme "}
                <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="platform"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger error={!!errors.platform}>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.platform && <p className="text-xs text-destructive">{errors.platform.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="purchase_date">
                {"Date d'achat "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="purchase_date"
                type="date"
                error={!!errors.purchase_date}
                {...register("purchase_date")}
              />
              {errors.purchase_date && <p className="text-xs text-destructive">{errors.purchase_date.message}</p>}
            </div>
          </div>

          {/* Purchase price + fees */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="purchase_price">
                {"Prix d'achat (€) "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                error={!!errors.purchase_price}
                {...register("purchase_price")}
              />
              {errors.purchase_price && <p className="text-xs text-destructive">{errors.purchase_price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="platform_fees">
                {"Frais plateforme (€) "}
                <span className="text-xs text-muted-foreground">(commissions)</span>
              </Label>
              <Input
                id="platform_fees"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("platform_fees")}
              />
            </div>
          </div>

          {/* Sale price + sale date (optional — only for already-sold items) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sale_price">
                Prix de vente (€)
                <span className="text-xs text-muted-foreground ml-1">(si déjà vendu)</span>
              </Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("sale_price")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sale_date">
                Date de vente
                {hasSalePrice && <span className="text-destructive"> *</span>}
              </Label>
              <Input
                id="sale_date"
                type="date"
                {...register("sale_date")}
              />
            </div>
          </div>

          {/* Shipping cost */}
          <div className="space-y-1.5">
            <Label htmlFor="shipping_cost">
              {"Frais d'envoi (€) "}
              <span className="text-xs text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="shipping_cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("shipping_cost")}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optionnel)</Label>
            <textarea
              id="description"
              className="flex min-h-[72px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary/50 disabled:opacity-50 resize-none"
              placeholder="Notes sur l'article..."
              {...register("description")}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting} variant="indigo">
              {isEditing ? "Enregistrer" : "Ajouter l'article"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
