import { lazy, Suspense } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth";
import Home from "./pages/Home";
import TopicPage from "./pages/TopicPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import { Logo } from "./components/Logo";

// The problem page pulls in Monaco, so load it only when needed.
const ProblemPage = lazy(() => import("./pages/ProblemPage"));

export default function App() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const onProblem = loc.pathname.startsWith("/problems/");
  return (
    <div className={onProblem ? "shell shell-full" : "shell"}>
      <header className="topbar">
        <Link to="/" className="brand"><Logo /> <span>DSA Ladder</span></Link>
        <nav className="topnav">
          <NavLink to="/" end>Ladders</NavLink>
          {user ? <NavLink to="/me">Progress</NavLink> : null}
        </nav>
        <div className="topright">
          {user ? (
            <><span className="who">{user.displayName}</span><button className="btn ghost sm" onClick={logout}>Sign out</button></>
          ) : (
            <Link className="btn sm" to="/login" state={{ from: loc.pathname }}>Sign in</Link>
          )}
        </div>
      </header>
      <Suspense fallback={<div className="loading">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topics/:id" element={<TopicPage />} />
          <Route path="/problems/:slug" element={<ProblemPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/me" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}
