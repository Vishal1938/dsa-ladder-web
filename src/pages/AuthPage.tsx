import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      if (mode === "login") await login(email, password); else await register(email, password, name);
      nav(from, { replace: true });
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <main className="page narrow">
      <form className="card auth" onSubmit={onSubmit}>
        <h1>{mode === "login" ? "Sign in" : "Create your account"}</h1>
        <p className="muted">Your solved problems and submissions are saved to your account.</p>
        {mode === "register" && (
          <label>Name<input value={name} onChange={e => setName(e.target.value)} required maxLength={60} autoComplete="name" /></label>
        )}
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></label>
        <label>Password{mode === "register" && <small> (at least 8 characters)</small>}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>
        {err && <p className="err">{err}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "…" : mode === "login" ? "Sign in" : "Create account"}</button>
        <p className="muted small">
          {mode === "login" ? <>No account? <Link to="/register" state={{ from }}>Create one</Link></> : <>Have an account? <Link to="/login" state={{ from }}>Sign in</Link></>}
        </p>
      </form>
    </main>
  );
}
