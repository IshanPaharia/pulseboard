type StatsCardProps = {
  title: string;
  value: number | string;
  delta?: number;
};

export function StatsCard({ title, value, delta }: StatsCardProps) {
  const hasDelta = delta !== undefined;
  const isPositive = (delta ?? 0) >= 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-bg-border bg-bg-surface p-6 shadow-sm">
      <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-brand-glow blur-2xl" />
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-secondary">
        {title}
      </p>
      <p className="relative truncate text-3xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>
      {hasDelta && (
        <span
          className={`mt-1 inline-flex text-xs ${
            isPositive ? "text-success" : "text-danger"
          }`}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(delta)}%
        </span>
      )}
    </div>
  );
}
