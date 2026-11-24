import { Link, Navigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../lib/auth";
import { useAsync } from "../lib/useAsync";
import { STATUS_LABEL, timeAgo } from "../lib/format";
import { ProgressBar } from "../components/Progress";

export default function ProfilePage() {
  const { user, ready } = useAuth();
  const stats = useAsync(() => (user ? api.stats() : Promise.resolve(null)), [user?.id]);
  const topics = useAsync(() => api.topics(), [user?.id]);
  if (ready && !user) return <Navigate to="/login" state={{ from: "/me" }} replace />;
  const s = stats.data;
  return (
    <main className="page">
      <h1>{user?.displayName}'s progress</h1>
      {s && (
        <div className="stat-row">
          <div className="stat"><b>{s.solved}</b><span>problems solved</span></div>
          <div className="stat"><b>{s.attempted}</b><span>attempted</span></div>
          <div className="stat"><b>{s.totalProblems}</b><span>in the books so far</span></div>
        </div>
      )}
      <section className="card">
        <h2 className="eyebrow">By ladder</h2>
        {topics.data?.filter(t => t.hasBook).map(t => (
          <div key={t.id} className="by-topic">
            <Link to={`/topics/${t.id}`}>{t.name}</Link>
            <ProgressBar value={t.solvedCount} total={t.problemCount} />
            <span className="meta">{t.solvedCount}/{t.problemCount}</span>
          </div>
        ))}
      </section>
      <section className="card">
        <h2 className="eyebrow">Recent submissions</h2>
        {s?.recent.length ? (
          <ul className="subs">
            {s.recent.map(r => (
              <li key={r.id}>
                <Link to={`/problems/${r.problemSlug}`}>{r.problemSlug.replace(/-/g, " ")}</Link>
                <span className={`st st-${r.status}`}>{STATUS_LABEL[r.status]}</span>
                <span className="meta">{r.passed}/{r.total} · {timeAgo(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : <p className="muted">No submissions yet.</p>}
      </section>
    </main>
  );
}
