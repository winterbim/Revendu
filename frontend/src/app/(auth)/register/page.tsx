"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Le nom doit faire au moins 2 caractères")
      .max(100),
    email: z.string().email("Adresse email invalide"),
    password: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    password_confirm: z.string(),
    terms: z.boolean().refine((v) => v, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ["password_confirm"],
    message: "Les mots de passe ne correspondent pas",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Une majuscule", ok: /[A-Z]/.test(password) },
    { label: "Un chiffre", ok: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="flex gap-2 mt-1.5">
      {checks.map((check) => (
        <div
          key={check.label}
          className={cn(
            "flex items-center gap-1 text-[10px] transition-colors",
            check.ok ? "text-emerald-400" : "text-muted-foreground"
          )}
        >
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              check.ok ? "bg-emerald-400" : "bg-muted-foreground/40"
            )}
          />
          {check.label}
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  });

  const password = watch("password") ?? "";

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await authApi.register({
        email: values.email,
        full_name: values.full_name,
        password: values.password,
      });
      // Auto-login after register
      await authApi.login(values.email, values.password);
      toast({
        variant: "success",
        title: "Compte créé avec succès !",
        description: "Bienvenue sur Revendu. Commencez à suivre vos ventes.",
      });
      router.replace("/dashboard");
    } catch (err) {
      toast({
        variant: "error",
        title: "Erreur lors de l'inscription",
        description:
          err instanceof Error
            ? err.message
            : "Veuillez réessayer plus tard.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-slide-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 group mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Revendu</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Créer un compte
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Gratuit pour commencer, sans CB requise
          </p>
        </div>

        {/* Social proof mini */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex -space-x-2">
            {["indigo", "emerald", "amber", "blue"].map((color, i) => (
              <div
                key={i}
                className={cn(
                  "h-7 w-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white",
                  color === "indigo" && "bg-indigo-500",
                  color === "emerald" && "bg-emerald-500",
                  color === "amber" && "bg-amber-500",
                  color === "blue" && "bg-blue-500"
                )}
              >
                {["M", "S", "A", "T"][i]}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            +4 200 revendeurs nous font confiance
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Prénom et nom</Label>
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="Marie Dupont"
                icon={<User className="h-4 w-4" />}
                error={!!errors.full_name}
                {...register("full_name")}
                autoFocus
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="marie@exemple.fr"
                icon={<Mail className="h-4 w-4" />}
                error={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                error={!!errors.password}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                {...register("password")}
              />
              <PasswordStrength password={password} />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="password_confirm">Confirmer le mot de passe</Label>
              <Input
                id="password_confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                error={!!errors.password_confirm}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                {...register("password_confirm")}
              />
              {errors.password_confirm && (
                <p className="text-xs text-destructive">
                  {errors.password_confirm.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="space-y-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border bg-background accent-primary"
                  {...register("terms")}
                />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  J'accepte les{" "}
                  <Link
                    href="/cgu"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link
                    href="/confidentialite"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Politique de confidentialité
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-destructive pl-7">
                  {errors.terms.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="indigo"
              size="lg"
              className="w-full gap-2"
              loading={isSubmitting}
            >
              Créer mon compte gratuitement
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>

        {/* Login link */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
