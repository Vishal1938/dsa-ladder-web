export function ProgressBar({ value, total, label }: { value: number; total: number; label?: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="pbar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} aria-label={label ?? "progress"}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}
