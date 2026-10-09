import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-5xl">迷子</p>
      <p className="mt-3 text-ink-muted">This page wandered off.</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm text-background">
        Back to the trip
      </Link>
    </div>
  );
}
