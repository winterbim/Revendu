"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, tokenStorage } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await authApi.login(values.email, values.password);
      toast({
        variant: "success",
        title: "Connexion réussie",
        description: "Bienvenue sur Revendu !",
      });
      router.replace("/dashboard");
    } catch (err) {
      toast({
        variant: "error",
        title: "Identifiants incorrects",
        description:
          err instanceof Error
            ? err.message
            : "Vérifiez votre email et mot de passe.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-slide-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 group mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Revendu</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Content de vous revoir 👋
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.fr"
                icon={<Mail className="h-4 w-4" />}
                error={!!errors.email}
                {...register("email")}
                autoFocus
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="#"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
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
              Se connecter
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>

        {/* Register link */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Créer un compte gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}
