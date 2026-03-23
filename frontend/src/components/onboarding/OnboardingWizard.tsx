"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Zap,
  PackagePlus,
  Mail,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { itemsApi, type ItemCreate } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Formulaire simplifié pour ajouter un article
  const [formData, setFormData] = useState<Partial<ItemCreate>>({
    name: "",
    platform: "vinted",
    purchase_price: undefined,
  });

  // Check onboarding status on mount
  useEffect(() => {
    const completed = localStorage.getItem("onboarding_completed");
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  const handleCreateItem = async () => {
    if (!formData.name || !formData.purchase_price) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le nom et le prix d'achat.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await itemsApi.create({
        name: formData.name,
        platform: (formData.platform || "vinted") as any,
        purchase_price: formData.purchase_price,
        purchase_date: new Date().toISOString().split("T")[0],
      });

      toast({
        title: "Article ajouté!",
        description: "Votre premier article a été créé avec succès.",
      });

      setStep(3);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || "Une erreur est survenue.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipGmail = () => {
    setStep(4);
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    setIsOpen(false);
    onComplete?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
      <DialogContent className="max-w-lg border-white/10 bg-card/95 backdrop-blur-xl p-0 overflow-hidden">
        {/* Progress indicator */}
        <div className="flex gap-1 bg-muted/30 p-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                step >= s ? "bg-primary" : "bg-muted/40"
              )}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div className="space-y-3 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Bienvenue sur Revendu!
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vous êtes prêt à suivre vos ventes et maîtriser votre fiscalité.
                Nous allons vous guider en 3 étapes.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-3">
              {[
                {
                  icon: PackagePlus,
                  title: "Ajoutez vos articles",
                  desc: "Votre inventaire se met à jour en temps réel",
                },
                {
                  icon: Shield,
                  title: "Suivez les seuils DAC7",
                  desc: "Alertes avant 30 transactions ou 2 000 € de reventes",
                },
                {
                  icon: Clock,
                  title: "Exportez vos rapports",
                  desc: "PDF ou CSV prêts pour votre expert-comptable",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setStep(2)}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              Commençons!
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Add first item */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Ajoutez votre premier article
              </h2>
              <p className="text-sm text-muted-foreground">
                Cela ne prend que quelques secondes.
              </p>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Nom de l'article
                </label>
                <input
                  type="text"
                  placeholder="ex: Nike Air Max 90"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Platform */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Plateforme
                </label>
                <select
                  value={formData.platform || "vinted"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      platform: e.target.value as any,
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                >
                  <option value="vinted">Vinted</option>
                  <option value="leboncoin">Leboncoin</option>
                  <option value="ebay">eBay</option>
                  <option value="vestiaire">Vestiaire Collective</option>
                  <option value="autres">Autre</option>
                </select>
              </div>

              {/* Purchase price */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Prix d'achat (€)
                </label>
                <input
                  type="number"
                  placeholder="45.00"
                  value={formData.purchase_price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purchase_price: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={handleCreateItem}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? "Ajout..." : "Ajouter l'article"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Gmail optional */}
        {step === 3 && (
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Connecter Gmail? (optionnel)
              </h2>
              <p className="text-sm text-muted-foreground">
                Revendu peut importer vos confirmations de vente depuis Gmail
                pour gagner du temps.
              </p>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5">
                <ul className="space-y-2">
                  {[
                    "Import automatique des récapitulatifs Vinted & Leboncoin",
                    "Synchronisation quotidienne",
                    "Aucun accès à vos emails privés",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleSkipGmail}
                className="flex-1"
              >
                Sauter
              </Button>
              <Button
                onClick={() => {
                  // Redirect to Gmail sync page
                  window.location.href = "/sync";
                }}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Mail className="mr-2 h-4 w-4" />
                Connecter Gmail
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="p-8 space-y-6 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 mx-auto mb-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                C'est parti! 🎉
              </h2>
              <p className="text-sm text-muted-foreground">
                Vous êtes maintenant prêt à utiliser Revendu. Commencez à
                suivre vos ventes et vos profits.
              </p>
            </div>

            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground mb-3">
                  Prochaines étapes recommandées :
                </p>
                <ul className="space-y-2">
                  {[
                    "Allez à la page Alertes pour voir vos seuils DAC7",
                    "Ajoutez plus d'articles à votre inventaire",
                    "Consultez les Rapports quand vous êtes prêt",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button
              onClick={handleComplete}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              Aller au tableau de bord
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
