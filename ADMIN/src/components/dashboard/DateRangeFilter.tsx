import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  onChange: (from: string, to: string) => void;
  className?: string;
}

const PRESETS = [
  { label: "Today",    getDates: () => { const d = today(); return [d, d]; } },
  { label: "Yesterday",getDates: () => { const d = daysAgo(1); return [d, d]; } },
  { label: "Last 7d",  getDates: () => [daysAgo(6), today()] },
  { label: "Last 30d", getDates: () => [daysAgo(29), today()] },
  { label: "This month",getDates: () => [monthStart(), today()] },
  { label: "Last month",getDates: () => [lastMonthStart(), lastMonthEnd()] },
] as const;

function today() { return new Date().toISOString().slice(0, 10); }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
function monthStart() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); }
function lastMonthStart() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().slice(0, 10); }
function lastMonthEnd() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).toISOString().slice(0, 10); }

export function DateRangeFilter({ onChange, className }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyPreset = (preset: typeof PRESETS[number]) => {
    const [f, t] = preset.getDates();
    setFrom(f); setTo(t);
    setActivePreset(preset.label);
    onChange(f, t);
    setOpen(false);
  };

  const applyCustom = () => {
    if (!from || !to) return;
    setActivePreset(null);
    onChange(from, to);
    setOpen(false);
  };

  const clear = () => {
    setFrom(""); setTo(""); setActivePreset(null);
    onChange("", "");
    setOpen(false);
  };

  const label = activePreset ?? (from && to ? `${from} – ${to}` : "Date filter");

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "h-9 px-3 rounded-md border text-sm flex items-center gap-2 transition-colors",
          (activePreset || (from && to))
            ? "border-accent bg-accent/10 text-accent"
            : "border-border bg-background hover:bg-muted"
        )}
      >
        <Calendar className="h-3.5 w-3.5" />
        <span className="max-w-[140px] truncate">{label}</span>
        {(activePreset || (from && to)) && (
          <span
            onClick={(e) => { e.stopPropagation(); clear(); }}
            className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >×</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-72 bg-surface border border-border rounded-xl shadow-lg p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick select</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={cn(
                  "text-xs px-2 py-1.5 rounded-md border transition-colors text-left",
                  activePreset === p.label
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:bg-muted"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom range</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <input
                  type="date"
                  value={from}
                  max={to || today()}
                  onChange={e => { setFrom(e.target.value); setActivePreset(null); }}
                  className="h-8 w-full px-2 rounded-md border border-border bg-background text-xs"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <input
                  type="date"
                  value={to}
                  min={from}
                  max={today()}
                  onChange={e => { setTo(e.target.value); setActivePreset(null); }}
                  className="h-8 w-full px-2 rounded-md border border-border bg-background text-xs"
                />
              </div>
            </div>
            <Button size="sm" className="w-full" onClick={applyCustom} disabled={!from || !to}>
              Apply range
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}