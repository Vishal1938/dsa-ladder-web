import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAsync } from "../lib/useAsync";
import { Difficulty } from "../components/Difficulty";
import { ProgressBar } from "../components/Progress";

export default function TopicPage() {
  const { id = "" } = useParams();
  const { data: t, error, loading } = useAsync(() => api.topic(id), [id]);
  if (loading) return <main className="page"><p className="muted">Loading…</p></main>;
  if (error || !t) return <main className="page"><p className="err">{error ?? "Not found"}</p></main>;
  const all = t.stages.flatMap(s => s.problems);
  const solved = all.filter(p => p.solved).length;
  const current = t.stages.findIndex(s => s.problems.some(p => !p.solved));
  return (
    <main className="page">
      <Link to="/" className="back">← All ladders</Link>
      <header className="topic-head">
        <h1>{t.name}</h1>
        <p className="lede">{t.idea}</p>
        {t.hasBook && <div className="topic-progress"><ProgressBar value={solved} total={all.length} /><span className="meta">{solved} of {all.length} problems solved</span></div>}
      </header>

      <section className="card triggers">
        <h2 className="eyebrow">Triggers: when you see this → reach for that</h2>
        <ul>
          {t.triggers.map(x => { const [a, b] = x.split("→").map(s => s.trim()); return <li key={x}><span>{a}</span><span className="arrow">→</span><b>{b}</b></li>; })}
        </ul>
      </section>

      {!t.hasBook && <p className="note">The problem book for this topic is still being written. The final-exam lists below already work: use them with any notes you have.</p>}

      <div className="stages">
        {t.stages.map(s => {
          const done = s.problems.filter(p => p.solved).length;
          const complete = s.problems.length > 0 && done === s.problems.length;
          const firstOpen = s.problems.find(p => !p.solved);
          return (
            <section key={s.index} className={`stage ${complete ? "complete" : ""} ${s.index === current ? "current" : ""}`}>
              <div className="stage-rail" aria-hidden="true"><span>{s.index + 1}</span></div>
              <div className="stage-body">
                <div className="stage-head">
                  <h2>{s.name}</h2>
                  {s.problems.length > 0 && <span className="meta">{done}/{s.problems.length} solved{s.index === current ? " · you are here" : ""}</span>}
                  {firstOpen && <Link className="btn sm primary" to={`/problems/${firstOpen.slug}`}>{done ? "Continue" : "Start"}</Link>}
                </div>
                {s.problems.length > 0 && (
                  <ol className="rungs">
                    {s.problems.map(p => (
                      <li key={p.slug} className={p.solved ? "solved" : p.attempted ? "tried" : ""}>
                        <Link to={`/problems/${p.slug}`}>
                          <span className="rung-n">{p.order}</span>
                          <span className="rung-main"><b>{p.title}</b><small>{p.whatsNew}</small></span>
                          <Difficulty level={p.difficulty} />
                          <span className="rung-state" aria-label={p.solved ? "solved" : p.attempted ? "attempted" : "not started"}>{p.solved ? "✓" : p.attempted ? "•" : ""}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
                <div className={`exam ${complete ? "ready" : ""}`}>
                  <div className="exam-head">
                    <h3>Final exam</h3>
                    <span className="meta">{complete ? "Ready: you've solved this stage's book." : s.problems.length ? "Best taken after the problems above." : "LeetCode problems for this stage."}</span>
                  </div>
                  <ul>
                    {s.exam.map(e => (
                      <li key={e.id}>
                        <a href={e.url} target="_blank" rel="noreferrer"><span className="mono">#{e.id}</span> {e.title} ↗</a>
                        <small>{e.note}</small>
                        {e.rating ? <span className="rating">{e.rating}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
