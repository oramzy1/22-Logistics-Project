import { Link } from "@tanstack/react-router";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white">
        <span className="font-display text-sm font-bold leading-none">22</span>
        <span className="absolute -bottom-1 -right-1 h-2 w-2 rotate-45 bg-gold" />
      </span>
      <span className={`font-display text-lg font-semibold ${light ? "text-white" : "text-ink"}`}>
        22 Logistics
      </span>
    </Link>
  );
}