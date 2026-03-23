"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi, tokenStorage, type User } from "./api";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
}

// ─── Context ────────────────────────────────────────────────────────────────

import React from "react";

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
      return;
    }

    try {
      const user = await authApi.me();
      setState({ user, isLoading: false, isAuthenticated: true, error: null });
    } catch {
      tokenStorage.clear();
      setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await authApi.login(email, password);
      const user = await authApi.me();
      setState({ user, isLoading: false, isAuthenticated: true, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de connexion";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await authApi.register(data);
      await login(data.email, data.password);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'inscription";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, [login]);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
    authApi.logout();
  }, []);

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        ...state,
        login,
        register,
        logout,
        refreshUser,
      },
    },
    children
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

/**
 * Returns true if the user has a valid token (client-side check).
 * Use for redirects in layouts.
 */
export function hasToken(): boolean {
  return !!tokenStorage.getAccess();
}
