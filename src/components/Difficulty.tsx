export function Difficulty({ level }: { level: string }) {
  return <span className={`diff diff-${level.toLowerCase()}`}>{level}</span>;
}
