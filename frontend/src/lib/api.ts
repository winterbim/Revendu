/**
 * Revendu API Client
 * Typed fetch wrapper with JWT auth, auto-refresh on 401, and SWR integration.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ─────────────────────────────────────────────────────────────────

// Bug 2 fix: AuthTokens matches backend response exactly (no refresh_token — it's an httpOnly cookie)
export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Bug 5 fix: User matches backend UserOut schema (fiscal_year added, is_active removed, plan added)
export interface User {
  id: string;
  email: string;
  full_name: string;
  fiscal_year: number;
  plan: "free" | "pro";
  created_at: string;
  updated_at: string;
  gmail_connected: boolean;
  last_email_sync: string | null;
}

// Matches backend ThresholdStatus schema
export interface ThresholdStatus {
  current: number;
  max: number;
  pct: number;
}

// Matches backend PlatformBreakdown schema
export interface PlatformBreakdown {
  platform: string;
  count: number;
  gross: number;
  profit: number;
}

export type AlertLevel = "safe" | "warning" | "danger" | "exceeded";

// Matches backend StatsResponse schema exactly
export interface StatsResponse {
  year: number;
  total_sold_items: number;
  gross_receipts: number;
  total_profit: number;
  avg_profit_per_item: number;
  best_platform: string | null;
  platform_breakdown: PlatformBreakdown[];
  threshold_transactions: ThresholdStatus;
  threshold_receipts: ThresholdStatus;
  alert_level: AlertLevel;
  is_pro: boolean;
}

// Matches backend ThresholdAlert schema
export interface ThresholdAlert {
  alert_level: AlertLevel;
  threshold_type: "transactions" | "receipts";
  current_value: number;
  max_value: number;
  pct: number;
  message: string;
}

// Matches backend ItemOut schema exactly
export interface Item {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  platform: "vinted" | "leboncoin" | "ebay" | "vestiaire" | "autres";
  status: "unsold" | "sold";
  purchase_price: number;
  purchase_date: string;
  sale_price: number | null;
  sale_date: string | null;
  platform_fees: number;
  shipping_cost: number;
  gross_receipt: number | null;
  net_profit: number | null;
  created_at: string;
  updated_at: string;
}

// Matches backend ItemCreate schema
export interface ItemCreate {
  name: string;
  description?: string;
  platform: "vinted" | "leboncoin" | "ebay" | "vestiaire" | "autres";
  purchase_price: number;
  purchase_date: string;
  sale_price?: number;
  sale_date?: string;
  platform_fees?: number;
  shipping_cost?: number;
}

export type ItemUpdate = Partial<ItemCreate>;

// Matches backend MarkSoldRequest schema
export interface MarkSoldPayload {
  sale_price: number;
  sale_date: string;
  platform_fees?: number;
  shipping_cost?: number;
}

export interface ItemsQuery {
  platform?: string;
  status?: string;
  year?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

// ─── Token Storage ──────────────────────────────────────────────────────────

// Bug 3 fix: tokenStorage only manages the access token — refresh token is an httpOnly cookie
const TOKEN_KEY = "revendu_access_token";

export const tokenStorage = {
  getAccess(): string | null {
    if (globalThis.window === undefined) return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(accessToken: string): void {
    if (globalThis.window === undefined) return;
    localStorage.setItem(TOKEN_KEY, accessToken);
  },
  clear(): void {
    if (globalThis.window === undefined) return;
    localStorage.removeItem(TOKEN_KEY);
  },
};

// ─── Core Fetch ─────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

// Bug 4 fix: refresh token is sent automatically via httpOnly cookie — no body needed
async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      tokenStorage.clear();
      return null;
    }

    const tokens: AuthTokens = await res.json();
    tokenStorage.set(tokens.access_token);
    return tokens.access_token;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function redirectToLogin(): never {
  if (globalThis.window !== undefined) {
    globalThis.window.location.href = "/login";
  }
  throw new ApiError(401, "Session expirée. Veuillez vous reconnecter.");
}

async function retryWithNewToken(
  url: string,
  init: RequestInit,
  headers: Record<string, string>
): Promise<Response> {
  let newToken: string | null;

  if (isRefreshing) {
    newToken = await new Promise<string | null>((resolve) => {
      refreshQueue.push(resolve);
    });
  } else {
    isRefreshing = true;
    newToken = await refreshAccessToken();
    isRefreshing = false;
    refreshQueue.forEach((cb) => cb(newToken));
    refreshQueue = [];
  }

  if (!newToken) {
    return redirectToLogin();
  }

  headers["Authorization"] = `Bearer ${newToken}`;
  return fetch(url, { ...init, headers, credentials: "include" });
}

async function throwIfNotOk(res: Response): Promise<void> {
  if (res.ok) return;

  let errorBody: unknown;
  try {
    errorBody = await res.json();
  } catch {
    errorBody = await res.text();
  }

  const message =
    typeof errorBody === "object" &&
    errorBody !== null &&
    "detail" in errorBody
      ? String((errorBody as { detail: unknown }).detail)
      : `Erreur ${res.status}`;

  throw new ApiError(res.status, message, errorBody);
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...init } = options;
  const token = tokenStorage.getAccess();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (!skipAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  let res = await fetch(url, { ...init, headers, credentials: "include" });

  // Auto-refresh on 401
  if (res.status === 401 && !skipAuth) {
    res = await retryWithNewToken(url, init, headers);
  }

  await throwIfNotOk(res);

  // Handle empty responses
  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// ─── Auth API ───────────────────────────────────────────────────────────────

export const authApi = {
  // Bug 1 fix: POST JSON to /api/v1/auth/login instead of OAuth2 form to /api/v1/auth/token
  async login(email: string, password: string): Promise<AuthTokens> {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(
        res.status,
        (err as { detail?: string }).detail ?? "Identifiants incorrects"
      );
    }

    const tokens: AuthTokens = await res.json();
    tokenStorage.set(tokens.access_token);
    return tokens;
  },

  async register(data: {
    email: string;
    full_name: string;
    password: string;
  }): Promise<User> {
    return request<User>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  async me(): Promise<User> {
    return request<User>("/api/v1/auth/me");
  },

  async logout(): Promise<void> {
    tokenStorage.clear();
    // Clear httpOnly refresh cookie server-side (fire-and-forget)
    fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    if (globalThis.window !== undefined) {
      globalThis.window.location.href = "/login";
    }
  },
};

// ─── Dashboard API ───────────────────────────────────────────────────────────

export const dashboardApi = {
  stats(year?: number): Promise<StatsResponse> {
    const qs = year ? `?year=${year}` : "";
    return request<StatsResponse>(`/api/v1/dashboard/stats${qs}`);
  },

  alerts(year?: number): Promise<ThresholdAlert[]> {
    const qs = year ? `?year=${year}` : "";
    return request<ThresholdAlert[]>(`/api/v1/dashboard/alerts${qs}`);
  },

  recentSales(year?: number): Promise<Item[]> {
    const qs = year ? `?year=${year}` : "";
    return request<Item[]>(`/api/v1/dashboard/recent-sales${qs}`);
  },

  exportCsv(year?: number): string {
    const qs = year ? `?year=${year}` : "";
    return `${API_BASE}/api/v1/dashboard/export/csv${qs}`;
  },
};

// ─── Items API ───────────────────────────────────────────────────────────────

export const itemsApi = {
  list(query: ItemsQuery = {}): Promise<Item[]> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.append(k, String(v));
    });
    const qs = params.toString();
    const itemsPath = qs ? `/api/v1/items?${qs}` : "/api/v1/items";
    return request<Item[]>(itemsPath);
  },

  get(id: string): Promise<Item> {
    return request<Item>(`/api/v1/items/${id}`);
  },

  create(data: ItemCreate): Promise<Item> {
    return request<Item>("/api/v1/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Bug 6 fix: backend uses PUT, not PATCH
  update(id: string, data: Partial<ItemCreate>): Promise<Item> {
    return request<Item>(`/api/v1/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  markSold(id: string, payload: MarkSoldPayload): Promise<Item> {
    return request<Item>(`/api/v1/items/${id}/mark-sold`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  delete(id: string): Promise<void> {
    return request<void>(`/api/v1/items/${id}`, { method: "DELETE" });
  },

  /** Authenticated CSV download — returns a blob URL the caller must revoke after use. */
  async downloadCsv(year?: number): Promise<string> {
    const qs = year ? `?year=${year}` : "";
    const res = await fetch(`${API_BASE}/api/v1/dashboard/export/csv${qs}`, {
      headers: authHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new ApiError(res.status, `Erreur ${res.status}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};

// ─── Notification Alerts (TopBar) ─────────────────────────────────────────────

export interface Alert {
  id: string;
  type: "threshold_warning" | "threshold_exceeded" | "info";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Alerts API ──────────────────────────────────────────────────────────────

// Bug 7 fix: /api/v1/alerts does not exist — use /api/v1/dashboard/alerts and map ThresholdAlert → Alert
// markRead and markAllRead are removed (backend does not support them)
export const alertsApi = {
  async list(): Promise<Alert[]> {
    const thresholdAlerts = await request<ThresholdAlert[]>(
      "/api/v1/dashboard/alerts"
    );
    return thresholdAlerts.map((alert) => ({
      id: alert.threshold_type,
      type:
        alert.alert_level === "exceeded"
          ? "threshold_exceeded"
          : "threshold_warning",
      title:
        alert.threshold_type === "transactions"
          ? `Transactions : ${Math.round(alert.pct)}% du seuil DAC7`
          : `Recettes : ${Math.round(alert.pct)}% du seuil DAC7`,
      message: alert.message,
      is_read: false,
      created_at: new Date().toISOString(),
    }));
  },
};

// ─── Export API ───────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = tokenStorage.getAccess();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const exportApi = {
  templateExcel: () =>
    fetch(`${API_BASE}/api/v1/export/template/excel`, {
      headers: authHeaders(),
      credentials: "include",
    }),
  templateCsv: () =>
    fetch(`${API_BASE}/api/v1/export/template/csv`, {
      headers: authHeaders(),
      credentials: "include",
    }),
  excel: (year: number) =>
    fetch(`${API_BASE}/api/v1/export/excel?year=${year}`, {
      headers: authHeaders(),
      credentials: "include",
    }),
  pdf: (year: number) =>
    fetch(`${API_BASE}/api/v1/export/pdf?year=${year}`, {
      headers: authHeaders(),
      credentials: "include",
    }),
};

// ─── Import API ───────────────────────────────────────────────────────────────

export interface ImportResult {
  imported: number;
  errors: Array<{ line: number; message: string }>;
}

export const importApi = {
  csv(file: File): Promise<ImportResult> {
    const form = new FormData();
    form.append("file", file);
    const token = tokenStorage.getAccess();
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};
    return fetch(`${API_BASE}/api/v1/import/csv`, {
      method: "POST",
      headers,
      body: form,
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new ApiError(
          res.status,
          (err as { detail?: string }).detail ?? `Erreur ${res.status}`,
          err
        );
      }
      return res.json() as Promise<ImportResult>;
    });
  },
  excel(file: File): Promise<ImportResult> {
    const form = new FormData();
    form.append("file", file);
    const token = tokenStorage.getAccess();
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};
    return fetch(`${API_BASE}/api/v1/import/excel`, {
      method: "POST",
      headers,
      body: form,
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new ApiError(
          res.status,
          (err as { detail?: string }).detail ?? `Erreur ${res.status}`,
          err
        );
      }
      return res.json() as Promise<ImportResult>;
    });
  },
};

// ─── Sync API ─────────────────────────────────────────────────────────────────

export interface SyncStatus {
  gmail_connected: boolean;
  last_sync: string | null;
}

export interface SyncResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export const syncApi = {
  status: () => request<SyncStatus>('/api/v1/sync/status'),
  gmailAuthorize: () => request<{ auth_url: string }>('/api/v1/sync/gmail/authorize'),
  gmailConnect: (code: string) => request<{ connected: boolean }>(`/api/v1/sync/gmail/connect?code=${encodeURIComponent(code)}`, { method: 'POST' }),
  gmailSync: () => request<SyncResult>('/api/v1/sync/gmail/sync', { method: 'POST' }),
  gmailDisconnect: () => request<{ disconnected: boolean }>('/api/v1/sync/gmail/disconnect', { method: 'DELETE' }),
};

// ─── Payments API ─────────────────────────────────────────────────────────────

export const paymentsApi = {
  createCheckout: () =>
    request<{ checkout_url: string }>("/api/v1/payments/create-checkout", {
      method: "POST",
    }),
  portal: () =>
    request<{ portal_url: string }>("/api/v1/payments/portal"),
};

// ─── SWR Fetcher ─────────────────────────────────────────────────────────────

export function swrFetcher<T>(url: string): Promise<T> {
  return request<T>(url);
}
