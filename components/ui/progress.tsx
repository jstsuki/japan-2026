import { cn } from "@/lib/utils";

export function Progress({ value, className, tone = "sakura", label }: { value: number; className?: string; tone?: "sakura" | "matcha" | "gold"; label?: string }) {
  const color = tone === "matcha" ? "bg-matcha" : tone === "gold" ? "bg-gold" : "bg-sakura";
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", color)} style={{ width: `${v}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 56, stroke = 5, className, children }: { value: number; size?: number; stroke?: number; className?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }} role="img" aria-label={`${v}% complete`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-current opacity-20" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          className="stroke-current transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold">{children ?? `${v}%`}</div>
    </div>
  );
}
