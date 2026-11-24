import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Editor, { type OnMount } from "@monaco-editor/react";
import { monaco } from "../lib/monaco";
import { api } from "../api/client";
import type { ProblemDetail, Submission, Verdict } from "../api/types";
import { useAsync } from "../lib/useAsync";
import { useAuth } from "../lib/auth";
import { renderMarkdown } from "../lib/markdown";
import { STATUS_LABEL, shorten, splitArgs, timeAgo } from "../lib/format";
import { Difficulty } from "../components/Difficulty";

const codeKey = (slug: string) => `dsaladder.code.${slug}`;
function loadCode(p: ProblemDetail): string {
  try { return localStorage.getItem(codeKey(p.slug)) ?? p.starterCode; } catch { return p.starterCode; }
}
function saveCode(slug: string, code: string) {
  try { localStorage.setItem(codeKey(slug), code); } catch { /* storage unavailable */ }
}

export default function ProblemPage() {
  const { slug = "" } = useParams();
  const { data: p, error, loading } = useAsync(() => api.problem(slug), [slug]);
  if (loading) return <div className="loading">Loading problem…</div>;
  if (error || !p) return <main className="page"><p className="err">{error ?? "Not found"}</p></main>;
  return <Workspace key={p.slug} p={p} />;
}

type LeftTab = "description" | "submissions";
type ConsoleTab = "testcase" | "result";

function Workspace({ p }: { p: ProblemDetail }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [code, setCode] = useState(() => loadCode(p));
  const [left, setLeft] = useState<LeftTab>("description");
  const [hintsShown, setHintsShown] = useState(0);
  const [cases, setCases] = useState<string[][]>(() => p.sampleInputs.map(c => [...c]));
  const [activeCase, setActiveCase] = useState(0);
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("testcase");
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [verdict, setVerdict] = useState<{ v: Verdict; mode: "run" | "submit" } | null>(null);
  const [reqError, setReqError] = useState<string | null>(null);
  const [solved, setSolved] = useState(p.solved);
  const [subsKey, setSubsKey] = useState(0);
  const actions = useRef({ run: () => {}, submit: () => {} });

  useEffect(() => { const t = setTimeout(() => saveCode(p.slug, code), 400); return () => clearTimeout(t); }, [code, p.slug]);

  const customised = useMemo(() => JSON.stringify(cases) !== JSON.stringify(p.sampleInputs), [cases, p.sampleInputs]);

  const run = useCallback(async () => {
    if (busy) return;
    setBusy("run"); setReqError(null); setConsoleTab("result");
    try {
      const v = await api.run(p.slug, code, customised ? cases : undefined);
      setVerdict({ v, mode: "run" });
    } catch (e) { setReqError((e as Error).message); }
    finally { setBusy(null); }
  }, [busy, p.slug, code, customised, cases]);

  const submit = useCallback(async () => {
    if (busy) return;
    setBusy("submit"); setReqError(null); setConsoleTab("result");
    try {
      const v = await api.submit(p.slug, code);
      setVerdict({ v, mode: "submit" });
      if (v.status === "ACCEPTED") setSolved(true);
      if (v.saved) setSubsKey(k => k + 1);
    } catch (e) { setReqError((e as Error).message); }
    finally { setBusy(null); }
  }, [busy, p.slug, code]);

  actions.current = { run, submit };

  const onMount: OnMount = (editor) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => actions.current.run());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => actions.current.submit());
  };

  function resetCode() {
    if (window.confirm("Replace your code with the starter code?")) setCode(p.starterCode);
  }

  return (
    <div className="workspace">
      <div className="ws-bar">
        <Link to={`/topics/${p.topic}`} className="back">← {p.topicName}</Link>
        <span className="crumb">Stage {p.stage + 1}: {p.stageName}</span>
        <span className="spacer" />
        <button className="btn ghost sm" disabled={!p.prev} onClick={() => p.prev && nav(`/problems/${p.prev}`)} aria-label="Previous problem">‹ Prev</button>
        <button className="btn ghost sm" disabled={!p.next} onClick={() => p.next && nav(`/problems/${p.next}`)} aria-label="Next problem">Next ›</button>
      </div>

      <div className="ws-grid">
        <section className="ws-left" aria-label="Problem">
          <div className="tabs">
            <button className={left === "description" ? "on" : ""} onClick={() => setLeft("description")}>Description</button>
            <button className={left === "submissions" ? "on" : ""} onClick={() => setLeft("submissions")}>Submissions</button>
          </div>
          <div className="ws-left-body">
            {left === "description" ? (
              <article className="problem">
                <h1>{p.title}</h1>
                <div className="row">
                  <Difficulty level={p.difficulty} />
                  {solved && <span className="tag live">Solved ✓</span>}
                  <span className="meta">Time limit {p.timeLimitMs} ms for all tests</span>
                </div>
                <div className="whatsnew"><b>What's new on this rung</b>{p.whatsNew}</div>
                <div className="md" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.statement) }} />
                {p.examples.map((ex, i) => (
                  <div className="example" key={i}>
                    <h3>Example {i + 1}</h3>
                    <pre><b>Input:</b> {ex.input}{"\n"}<b>Output:</b> {ex.output}{ex.explanation ? <>{"\n"}<b>Why:</b> {ex.explanation}</> : null}</pre>
                  </div>
                ))}
                <div className="signature"><span className="meta">Implement</span> <code>{p.signature}</code></div>
                <section className="hints">
                  <h3>Hints</h3>
                  <p className="meta">Try for 10 minutes before opening one. Each hint is a question, not the answer.</p>
                  {p.hints.slice(0, hintsShown).map((h, i) => <div className="hint" key={i}><b>Hint {i + 1}</b> {h}</div>)}
                  {hintsShown < p.hints.length && (
                    <button className="btn sm ghost" onClick={() => setHintsShown(n => n + 1)}>Show hint {hintsShown + 1} of {p.hints.length}</button>
                  )}
                </section>
                {solved && p.trigger && (
                  <div className="trigger"><b>Trigger to remember</b>{p.trigger}</div>
                )}
              </article>
            ) : (
              <SubmissionList slug={p.slug} signedIn={!!user} refreshKey={subsKey} onLoad={c => { setCode(c); setLeft("description"); }} />
            )}
          </div>
        </section>

        <section className="ws-right" aria-label="Code">
          <div className="editor-bar">
            <span className="lang">Java 21</span>
            <span className="spacer" />
            <button className="btn ghost sm" onClick={resetCode}>Reset code</button>
          </div>
          <div className="editor-wrap">
            <Editor
              language="java"
              theme="ladder"
              value={code}
              onChange={v => setCode(v ?? "")}
              onMount={onMount}
              options={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 14,
                minimap: { enabled: false },
                tabSize: 4,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
                renderLineHighlight: "line",
              }}
            />
          </div>
          <div className="console">
            <div className="tabs">
              <button className={consoleTab === "testcase" ? "on" : ""} onClick={() => setConsoleTab("testcase")}>Testcase{customised ? " (edited)" : ""}</button>
              <button className={consoleTab === "result" ? "on" : ""} onClick={() => setConsoleTab("result")}>Result</button>
              <span className="spacer" />
              <span className="kbd-hint">Ctrl/⌘ + Enter to run</span>
              <button className="btn sm" onClick={run} disabled={!!busy}>{busy === "run" ? "Running…" : "Run"}</button>
              <button className="btn sm primary" onClick={submit} disabled={!!busy}>{busy === "submit" ? "Judging…" : "Submit"}</button>
            </div>
            <div className="console-body">
              {consoleTab === "testcase" ? (
                <TestcaseEditor p={p} cases={cases} setCases={setCases} active={activeCase} setActive={setActiveCase} customised={customised} />
              ) : (
                <ResultView p={p} verdict={verdict} busy={busy} error={reqError} signedIn={!!user} />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function TestcaseEditor({ p, cases, setCases, active, setActive, customised }: {
  p: ProblemDetail; cases: string[][]; setCases: (c: string[][]) => void; active: number; setActive: (i: number) => void; customised: boolean;
}) {
  const cur = cases[Math.min(active, cases.length - 1)] ?? [];
  const update = (pi: number, v: string) => setCases(cases.map((c, ci) => (ci === active ? c.map((x, j) => (j === pi ? v : x)) : c)));
  return (
    <div>
      <div className="case-tabs">
        {cases.map((_, i) => (
          <button key={i} className={i === active ? "on" : ""} onClick={() => setActive(i)}>Case {i + 1}</button>
        ))}
        {cases.length < 8 && <button onClick={() => { setCases([...cases, [...(cases[active] ?? p.sampleInputs[0])]]); setActive(cases.length); }} aria-label="Add a test case">+</button>}
        {cases.length > 1 && <button onClick={() => { setCases(cases.filter((_, i) => i !== active)); setActive(Math.max(0, active - 1)); }} aria-label="Remove this test case">−</button>}
        {customised && <button className="link" onClick={() => { setCases(p.sampleInputs.map(c => [...c])); setActive(0); }}>reset to examples</button>}
      </div>
      {p.params.map((prm, i) => (
        <label key={prm.name} className="param">
          <span>{prm.name} <small>{prm.type}</small></span>
          <input value={cur[i] ?? ""} onChange={e => update(i, e.target.value)} spellCheck={false} />
        </label>
      ))}
      <p className="meta">Values are JSON: arrays like <code>[1,2,3]</code>, strings in quotes. Edited cases are checked against our reference solution.</p>
    </div>
  );
}

function ResultView({ p, verdict, busy, error, signedIn }: { p: ProblemDetail; verdict: { v: Verdict; mode: "run" | "submit" } | null; busy: string | null; error: string | null; signedIn: boolean }) {
  const [sel, setSel] = useState(0);
  useEffect(() => setSel(0), [verdict]);
  if (busy) return <p className="muted pulse">{busy === "run" ? "Compiling and running your code…" : "Judging against all tests…"}</p>;
  if (error) return <p className="err">{error}</p>;
  if (!verdict) return <p className="muted">Run your code to see results here.</p>;
  const { v, mode } = verdict;
  const ok = v.status === "ACCEPTED";
  const failing = v.cases.find(c => !c.passed);
  const shown = mode === "run" ? v.cases : failing ? [failing] : [];
  const c = shown[Math.min(sel, shown.length - 1)];
  return (
    <div className="result">
      <div className="verdict-line">
        <span className={`st st-${v.status}`}>{STATUS_LABEL[v.status]}</span>
        {v.status !== "COMPILE_ERROR" && <span className="meta">{v.passed} / {v.total} {mode === "submit" ? "tests" : "cases"} passed{v.runtimeMs ? ` · ${v.runtimeMs} ms` : ""}</span>}
      </div>
      {ok && mode === "submit" && (
        <div className="accepted">
          <b>Nice. All {v.total} tests pass, including the big ones.</b>
          {p.trigger && <span>Trigger to remember: {p.trigger}</span>}
          {!signedIn && <span className="meta"><Link to="/login" state={{ from: `/problems/${p.slug}` }}>Sign in</Link> to save your progress.</span>}
          {p.next && <Link className="btn sm primary" to={`/problems/${p.next}`}>Next problem →</Link>}
        </div>
      )}
      {ok && mode === "run" && <p className="meta">The examples pass. Submit to run the hidden tests too.</p>}
      {v.compileOutput && <pre className="out bad">{v.compileOutput}</pre>}
      {v.error && <pre className="out bad">{v.error}</pre>}
      {shown.length > 0 && (
        <>
          {mode === "run" && (
            <div className="case-tabs">
              {shown.map((x, i) => <button key={x.index} className={i === sel ? "on" : ""} onClick={() => setSel(i)}><i className={x.passed ? "dot ok" : "dot bad"} />Case {x.index + 1}</button>)}
            </div>
          )}
          {mode === "submit" && c && <p className="meta">First failing test (#{c.index + 1}{c.hidden ? ", hidden" : ""}):</p>}
          {c && (
            <div className="io">
              <div><h4>Input</h4>{splitArgs(c.input, p.params).map(a => <pre key={a.name}><span className="meta">{a.name} =</span> {shorten(a.value)}</pre>)}</div>
              {c.actual !== undefined && c.actual !== null && <div><h4>Your output</h4><pre className={c.passed ? "" : "bad"}>{shorten(c.actual)}</pre></div>}
              {c.expected && <div><h4>Expected</h4><pre>{shorten(c.expected)}</pre></div>}
              {c.stdout ? <div><h4>Stdout</h4><pre>{shorten(c.stdout, 2000)}</pre></div> : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SubmissionList({ slug, signedIn, refreshKey, onLoad }: { slug: string; signedIn: boolean; refreshKey: number; onLoad: (code: string) => void }) {
  const { data, loading, error } = useAsync<Submission[]>(() => (signedIn ? api.submissions(slug) : Promise.resolve([])), [slug, signedIn, refreshKey]);
  if (!signedIn) return <p className="muted pad"><Link to="/login" state={{ from: `/problems/${slug}` }}>Sign in</Link> to keep a history of your submissions.</p>;
  if (loading) return <p className="muted pad">Loading…</p>;
  if (error) return <p className="err pad">{error}</p>;
  if (!data?.length) return <p className="muted pad">No submissions yet.</p>;
  return (
    <ul className="subs pad">
      {data.map(s => (
        <li key={s.id}>
          <span className={`st st-${s.status}`}>{STATUS_LABEL[s.status]}</span>
          <span className="meta">{s.passed}/{s.total} · {s.runtimeMs} ms · {timeAgo(s.createdAt)}</span>
          {s.code && <button className="btn ghost sm" onClick={() => onLoad(s.code!)}>Load code</button>}
        </li>
      ))}
    </ul>
  );
}
