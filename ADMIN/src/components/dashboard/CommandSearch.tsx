import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LayoutDashboard, Calendar, Truck, Users, CreditCard, Settings, X, ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "n1", label: "Dashboard",         description: "Overview & analytics",                     path: "/",         icon: LayoutDashboard, category: "Pages" },
  { id: "n2", label: "Bookings",          description: "Manage all ride bookings",                  path: "/bookings", icon: Calendar,        category: "Pages" },
  { id: "n3", label: "Drivers",           description: "Driver management & license verification",  path: "/drivers",  icon: Truck,           category: "Pages" },
  { id: "n4", label: "Users",             description: "Individual & business user accounts",       path: "/users",    icon: Users,           category: "Pages" },
  { id: "n5", label: "Payments",          description: "Transactions, revenue & invoices",          path: "/payment",  icon: CreditCard,      category: "Pages" },
  { id: "n6", label: "Settings",          description: "Platform config & pricing",                 path: "/settings", icon: Settings,        category: "Pages" },
];

interface Result { id: string; label: string; description: string; path: string; icon: any; category: string; entityId?: string; }

function useDebounce<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export function CommandSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const dq = useDebounce(query, 280);
  const enabled = dq.length >= 2;

  const { data: bookingData, isFetching: bf } = useQuery({
    queryKey: ["cmd-b", dq], enabled,
    queryFn: () => api.get<any>(`/admin/bookings?search=${dq}&limit=4`),
  });
  const { data: userData, isFetching: uf } = useQuery({
    queryKey: ["cmd-u", dq], enabled,
    queryFn: () => api.get<any>(`/admin/users?search=${dq}&limit=4`),
  });
  const { data: driverData, isFetching: df } = useQuery({
    queryKey: ["cmd-d", dq], enabled,
    queryFn: () => api.get<any>(`/admin/drivers?search=${dq}&limit=4`),
  });

  const isFetching = bf || uf || df;

  const navResults: Result[] = query
    ? NAV_ITEMS.filter((n) => `${n.label} ${n.description}`.toLowerCase().includes(query.toLowerCase()))
    : NAV_ITEMS;

  const bookingResults: Result[] = (bookingData?.bookings ?? []).map((b: any) => ({
    id: `b-${b.id}`, label: b.trackingId ?? b.id.slice(0, 8),
    description: `${b.customer?.name ?? "—"} · ₦${b.totalAmount?.toLocaleString()} · ${b.status}`,
    path: "/bookings", icon: Calendar, category: "Bookings", entityId: b.id,
  }));

  const userResults: Result[] = (userData?.users ?? []).map((u: any) => ({
    id: `u-${u.id}`, label: u.name ?? u.email,
    description: `${u.role} · ${u.email}`,
    path: "/users", icon: Users, category: "Users", entityId: u.id,
  }));

  const driverResults: Result[] = (driverData?.drivers ?? []).map((d: any) => ({
    id: `d-${d.id}`, label: d.user?.name ?? "—",
    description: `Driver · ${d.licenseStatus} · ${d.user?.phone ?? ""}`,
    path: "/drivers", icon: Truck, category: "Drivers", entityId: d.id,
  }));

  const all: Result[] = [...navResults, ...bookingResults, ...userResults, ...driverResults];

  useEffect(() => setActiveIdx(0), [query]);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
    else setQuery("");
  }, [open]);

  const select = useCallback((r: Result) => {
    onClose();
    navigate(r.path, r.entityId ? { state: { highlightId: r.entityId } } : undefined);
  }, [navigate, onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, all.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      else if (e.key === "Enter" && all[activeIdx]) select(all[activeIdx]);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, all, activeIdx, select, onClose]);

  if (!open) return null;

  const groups: Record<string, Result[]> = {};
  for (const r of all) (groups[r.category] ??= []).push(r);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "fadeIn 120ms ease" }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, bookings, users, drivers…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {isFetching
            ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            : query && <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          }
          <kbd className="hidden sm:inline-flex border border-border rounded px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">ESC</kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto py-2">
          {all.length === 0 && enabled && !isFetching && (
            <p className="text-center text-sm text-muted-foreground py-10">No results for "<span className="font-medium">{query}</span>"</p>
          )}
          {Object.entries(groups).map(([cat, results]) => (
            <div key={cat}>
              <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{cat}</p>
              {results.map((r) => {
                const idx = all.indexOf(r);
                const Icon = r.icon;
                const active = activeIdx === idx;
                return (
                  <button
                    key={r.id}
                    onClick={() => select(r)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      active ? "bg-accent/10" : "hover:bg-muted/50",
                    )}
                  >
                    <div className={cn("h-8 w-8 rounded-md flex items-center justify-center shrink-0", active ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", active && "text-accent")}>{r.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                    </div>
                    <ArrowRight className={cn("h-3.5 w-3.5 shrink-0 text-accent transition-opacity", active ? "opacity-50" : "opacity-0")} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
          {[["↑↓", "navigate"], ["↵", "select"], ["ESC", "close"]].map(([k, l]) => (
            <span key={k} className="flex items-center gap-1">
              <kbd className="border border-border rounded px-1 font-mono">{k}</kbd>{l}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}