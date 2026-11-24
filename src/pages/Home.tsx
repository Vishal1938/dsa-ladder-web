import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAsync } from "../lib/useAsync";
import { ProgressBar } from "../components/Progress";

const CLIMB = [
  { n: "1", t: "Running total", d: "the base idea" },
  { n: "8", t: "Count zero-sum stretches", d: "+ a hashmap of counts" },
  { n: "9", t: "Count subarrays with sum k", d: "look up prefix − k" },
  { n: "12", t: "Subarrays divisible by k", d: "remainders instead of sums" },
  { n: "★", t: "LeetCode 560 · 974 · 525", d: "final exam" },
];

export default function Home() {
  const { data: topics, error, loading } = useAsync(() => api.topics(), []);
  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">A problem book for every DSA pattern</p>
          <h1>Solve the small ones until the big one is obvious.</h1>
          <p className="lede">
            Each topic is a ladder of short Java problems. Every rung changes one idea from the rung before, like an exercise set in a maths
            textbook. Write the code, run it against real tests, climb. When a stage is done, its LeetCode problems are your final exam.
          </p>
          <div className="row">
            <Link className="btn primary" to="/topics/prefix-sum">Start with Prefix Sums</Link>
            <a className="btn ghost" href="#ladders">See all ladders</a>
          </div>
        </div>
        <ol className="climb" aria-label="How one ladder climbs">
          {CLIMB.slice().reverse().map((c, i) => (
            <li key={c.t} className={i === 0 ? "exam" : ""} style={{ animationDelay: `${(CLIMB.length - i) * 70}ms` }}>
              <span className="climb-n">{c.n}</span>
              <span><b>{c.t}</b><small>{c.d}</small></span>
            </li>
          ))}
        </ol>
      </section>

      <section id="ladders">
        <div className="section-head"><h2>Ladders</h2><span className="muted">Pick one and climb it to the end before starting the next.</span></div>
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="err">Couldn't load topics: {error}</p>}
        <div className="topic-grid">
          {topics?.slice().sort((a, b) => Number(b.hasBook) - Number(a.hasBook)).map(t => (
            <Link key={t.id} to={`/topics/${t.id}`} className={t.hasBook ? "topic-card" : "topic-card soon"}>
              <div className="topic-card-head">
                <h3>{t.name}</h3>
                {t.hasBook ? <span className="tag live">{t.problemCount} problems</span> : <span className="tag">exam list only</span>}
              </div>
              <p>{t.idea}</p>
              {t.hasBook ? (
                <><ProgressBar value={t.solvedCount} total={t.problemCount} label={`${t.name} progress`} />
                  <span className="meta">{t.solvedCount}/{t.problemCount} solved · {t.stageCount} stages</span></>
              ) : <span className="meta">{t.stageCount} stages · problem book coming soon</span>}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
