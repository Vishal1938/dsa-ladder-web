import type { AuthResponse, CheckResult, ProblemDetail, Stats, Submission, TopicDetail, TopicSummary, User, Verdict } from "./types";

const TOKEN_KEY = "dsaladder.token";

/** Where the API lives. Empty = same origin (dev proxy). In production set VITE_API_URL, e.g. https://api.example.com */
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(t: string | null) {
  try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API_BASE}/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch { /* not JSON */ }
    if (res.status === 401 && token && path !== "/auth/login") setToken(null);
    throw new ApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  topics: () => request<TopicSummary[]>("GET", "/topics"),
  topic: (id: string) => request<TopicDetail>("GET", `/topics/${id}`),
  problem: (slug: string) => request<ProblemDetail>("GET", `/problems/${slug}`),
  run: (slug: string, code: string, inputs?: string[][]) => request<Verdict>("POST", `/problems/${slug}/run`, { code, inputs }),
  submit: (slug: string, code: string) => request<Verdict>("POST", `/problems/${slug}/submit`, { code }),
  check: (slug: string, code: string) => request<CheckResult>("POST", `/problems/${slug}/check`, { code }),
  submissions: (slug: string) => request<Submission[]>("GET", `/problems/${slug}/submissions`),
  register: (email: string, password: string, displayName: string) => request<AuthResponse>("POST", "/auth/register", { email, password, displayName }),
  login: (email: string, password: string) => request<AuthResponse>("POST", "/auth/login", { email, password }),
  me: () => request<User>("GET", "/auth/me"),
  stats: () => request<Stats>("GET", "/me/stats"),
};
