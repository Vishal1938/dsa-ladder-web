export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="8" y="4" width="3" height="24" rx="1.5" fill="currentColor" />
      <rect x="21" y="4" width="3" height="24" rx="1.5" fill="currentColor" />
      <rect x="11" y="8" width="10" height="3" rx="1.5" fill="var(--rung)" />
      <rect x="11" y="14.5" width="10" height="3" rx="1.5" fill="var(--accent)" />
      <rect x="11" y="21" width="10" height="3" rx="1.5" fill="var(--line-strong)" />
    </svg>
  );
}
