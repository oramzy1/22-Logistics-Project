import { useState } from "react";
import {
  Gift, Plus, UserPlus, ToggleLeft, ToggleRight,
  Trash2, Edit2, ChevronDown, Search, Check, X,
  Loader2, Download, Info,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  usePromos,
  useTogglePromo,
  useDeletePromo,
  useCreatePromo,
  useAssignPromo,
  useSettings,
  useUpdateSettings,
  useUsers,
  useUserMilestones,
} from "@/hooks/useAdminData";

// ── Types ──────────────────────────────────────────────────────
type DiscountType = "PERCENTAGE" | "FIXED";
type TargetType = "ALL" | "INDIVIDUAL" | "BUSINESS" | "USER_SPECIFIC";

const MILESTONE_KEYS = [
  { count: 1,  codePrefix: "WELCOME10", defaultDisc: 10, label: "1st booking",  days: 14 },
  { count: 5,  codePrefix: "LOYAL15",   defaultDisc: 15, label: "5 bookings",   days: 30 },
  { count: 10, codePrefix: "VIP20",     defaultDisc: 20, label: "10 bookings",  days: 30 },
  { count: 20, codePrefix: "ELITE25",   defaultDisc: 25, label: "20 bookings",  days: 30 },
];

// ── Helpers ────────────────────────────────────────────────────
const Badge = ({
  children, color = "gray",
}: { children: React.ReactNode; color?: "green" | "red" | "amber" | "blue" | "purple" | "gray" }) => {
  const cls = {
    green:  "bg-emerald-50  text-emerald-700  border-emerald-200",
    red:    "bg-red-50      text-red-700      border-red-200",
    amber:  "bg-amber-50   text-amber-700    border-amber-200",
    blue:   "bg-blue-50    text-blue-700     border-blue-200",
    purple: "bg-violet-50  text-violet-700   border-violet-200",
    gray:   "bg-muted      text-muted-foreground border-border",
  }[color];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border", cls)}>
      {children}
    </span>
  );
};

const Progress = ({ value }: { value: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
    <span className="text-[11px] text-muted-foreground w-7 text-right">{Math.min(value, 100)}%</span>
  </div>
);

// ── Tabs ───────────────────────────────────────────────────────
const TABS = [
  { id: "codes",      label: "Promo codes" },
  { id: "policies",   label: "Milestone policies" },
  { id: "tracker",    label: "User milestone tracker" },
];

// ══════════════════════════════════════════════════════════════
export default function Promotions() {
  const [tab, setTab] = useState("codes");

  return (
    <div>
      <PageHeader
        title="Promotions"
        subtitle="Create, monitor, and assign promo codes to users"
        actions={
          <div className="flex gap-2">
            <AssignPromoButton />
            <CreatePromoButton />
          </div>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 text-sm border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-foreground text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "codes"    && <PromoCodesTab />}
      {tab === "policies" && <MilestonePoliciesTab />}
      {tab === "tracker"  && <UserTrackerTab />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 1 — PROMO CODES
// ══════════════════════════════════════════════════════════════
function PromoCodesTab() {
  const { data: promos = [], isLoading } = usePromos();
  const togglePromo = useTogglePromo();
  const deletePromo = useDeletePromo();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = promos.filter((p: any) => {
    const matchSearch = !search ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || p.discountType === typeFilter;
    return matchSearch && matchType;
  });

  const totalRedemptions = promos.reduce((s: number, p: any) => s + (p.usedCount ?? 0), 0);
  const active           = promos.filter((p: any) => p.isActive).length;

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total promos",     value: promos.length, sub: `${active} active` },
          { label: "Total redemptions",value: totalRedemptions, sub: "all time" },
          { label: "Active codes",     value: active, sub: "currently live" },
          { label: "Inactive codes",   value: promos.length - active, sub: "disabled or expired" },
        ].map((m) => (
          <div key={m.label} className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
            <p className="text-2xl font-medium">{m.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              className="h-9 w-full pl-8 pr-3 rounded-md border border-border bg-background text-sm"
              placeholder="Search code or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed</option>
          </select>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-accent/10">
                {["Code","Description","Discount","Target","Usage","Expires","Status",""].map((h) => (
                  <th key={h} className="py-3 px-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-12 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">
                  No promos found
                </td></tr>
              ) : filtered.map((p: any) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 px-2">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{p.code}</code>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground max-w-[180px] truncate">{p.description ?? "—"}</td>
                  <td className="py-3 px-2">
                    <Badge color={p.discountType === "PERCENTAGE" ? "purple" : "blue"}>
                      {p.discountType === "PERCENTAGE" ? `${p.discountValue}%` : `₦${p.discountValue.toLocaleString()}`}
                    </Badge>
                  </td>
                  <td className="py-3 px-2"><Badge>{p.targetType}</Badge></td>
                  <td className="py-3 px-2 text-xs">
                    {p.usedCount ?? 0}{p.usageLimit ? `/${p.usageLimit}` : ""}
                  </td>
                  <td className="py-3 px-2 text-xs text-muted-foreground">
                    {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : "No expiry"}
                  </td>
                  <td className="py-3 px-2">
                    <Switch
                      checked={p.isActive}
                      onCheckedChange={() => togglePromo.mutate(p.id, {
                        onSuccess: () => toast.success(`Promo ${p.isActive ? "disabled" : "enabled"}`),
                      })}
                    />
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1.5">
                      <button
                        className="h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
                        title="Delete"
                        onClick={() => deletePromo.mutate(p.id, { onSuccess: () => toast.success("Promo deleted") })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 2 — MILESTONE POLICIES
// ══════════════════════════════════════════════════════════════
function MilestonePoliciesTab() {
  const { data: settings = [], isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  // Build a live map from settings array
  const settingsMap: Record<string, string> = {};
  settings.forEach((s: any) => { settingsMap[s.key] = s.value; });

  const [vals, setVals] = useState<Record<string, string>>({});
  const merged = { ...settingsMap, ...vals };
  const set = (k: string, v: string) => setVals((prev) => ({ ...prev, [k]: v }));

  const handleSave = (keys: string[]) => {
    const payload = keys.map((k) => ({ key: k, value: merged[k] ?? "" }));
    updateSettings.mutate(payload, {
      onSuccess: () => toast.success("Policy saved"),
      onError: () => toast.error("Failed to save"),
    });
  };

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>
          Milestone promos are auto-generated per user when they complete a booking. Each fires once per user.
          Changes here take effect for future triggers only — existing issued codes are unaffected.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Welcome promo card */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">New user welcome promo</h3>
            <Switch
              checked={merged["policy_welcome_enabled"] !== "false"}
              onCheckedChange={(v) => set("policy_welcome_enabled", String(v))}
            />
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Fires immediately after a new individual user registers
          </p>

          <div className="space-y-3 border-t border-border pt-3">
            <PolicyField label="Discount (%)">
              <input
                type="number" min={1} max={100}
                className="h-8 w-24 px-2 rounded border border-border bg-background text-sm"
                value={merged["policy_welcome_discount"] ?? "10"}
                onChange={(e) => set("policy_welcome_discount", e.target.value)}
              />
            </PolicyField>
            <PolicyField label="Valid for (days)">
              <select
                className="h-8 px-2 rounded border border-border bg-background text-sm"
                value={merged["policy_welcome_days"] ?? "14"}
                onChange={(e) => set("policy_welcome_days", e.target.value)}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </PolicyField>
            <PolicyField label="Applies to">
              <Badge color="gray">INDIVIDUAL only</Badge>
            </PolicyField>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => handleSave(["policy_welcome_enabled","policy_welcome_discount","policy_welcome_days"])}>
              {updateSettings.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Save
            </Button>
          </div>
        </div>

        {/* Milestone list card */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="font-medium text-sm mb-1">Booking-count milestones</h3>
          <p className="text-xs text-muted-foreground mb-4">Each fires once per user when they hit that booking count</p>

          <div className="space-y-0">
            {MILESTONE_KEYS.map((m) => {
              const enabledKey = `milestone_${m.count}_enabled`;
              const discKey    = `milestone_${m.count}_discount`;
              const daysKey    = `milestone_${m.count}_days`;
              const isEnabled  = merged[enabledKey] !== "false";
              return (
                <div key={m.count} className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{m.codePrefix}</code>
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                    </div>
                    {isEnabled && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number" min={1} max={100}
                            className="h-6 w-14 px-1.5 rounded border border-border bg-background text-xs"
                            value={merged[discKey] ?? String(m.defaultDisc)}
                            onChange={(e) => set(discKey, e.target.value)}
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                        <select
                          className="h-6 px-1.5 rounded border border-border bg-background text-xs"
                          value={merged[daysKey] ?? String(m.days)}
                          onChange={(e) => set(daysKey, e.target.value)}
                        >
                          <option value="14">14d</option>
                          <option value="30">30d</option>
                          <option value="60">60d</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(v) => set(enabledKey, String(v))}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-end mt-4">
            <Button size="sm" onClick={() => {
              const keys = MILESTONE_KEYS.flatMap((m) => [
                `milestone_${m.count}_enabled`,
                `milestone_${m.count}_discount`,
                `milestone_${m.count}_days`,
              ]);
              handleSave(keys);
            }}>
              {updateSettings.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Save milestones
            </Button>
          </div>
        </div>
      </div>

      {/* Auto-assignment log */}
      <AutoAssignmentLog />
    </div>
  );
}

function PolicyField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function AutoAssignmentLog() {
  const { data: promos = [] } = usePromos();
  // Promos created by "system" are auto-issued milestones
  const autoPromos = promos
    .filter((p: any) => p.createdBy === "system")
    .flatMap((p: any) =>
      (p.usages ?? []).map((u: any) => ({
        user: u.userId,
        code: p.code,
        disc: p.discountType === "PERCENTAGE" ? `${p.discountValue}%` : `₦${p.discountValue.toLocaleString()}`,
        time: new Date(u.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
        redeemed: !!u.bookingId,
      }))
    )
    .slice(0, 20);

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">Auto-assignment log</h3>
        <Badge color="gray">System-issued promos</Badge>
      </div>
      {autoPromos.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No auto-issued promos yet</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border bg-accent/10">
              {["User ID","Code","Discount","Issued","Redeemed"].map((h) => (
                <th key={h} className="py-2 px-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {autoPromos.map((l: any, i: number) => (
              <tr key={i} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 px-2 text-xs text-muted-foreground font-mono">{l.user.slice(0, 8)}…</td>
                <td className="py-2.5 px-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{l.code}</code></td>
                <td className="py-2.5 px-2"><Badge color="purple">{l.disc}</Badge></td>
                <td className="py-2.5 px-2 text-xs text-muted-foreground">{l.time}</td>
                <td className="py-2.5 px-2"><Badge color={l.redeemed ? "green" : "amber"}>{l.redeemed ? "Redeemed" : "Pending"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 3 — USER MILESTONE TRACKER
// ══════════════════════════════════════════════════════════════
function UserTrackerTab() {
  const [params, setParams] = useState({ page: "1", limit: "20" });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { data, isLoading } = useUsers({ ...params, search, role: roleFilter || undefined });
  const users = data?.users ?? [];
  const [quickAssignUser, setQuickAssignUser] = useState<any>(null);

  function nextMilestone(b: number) {
    return [1, 5, 10, 20].find((m) => m > b) ?? null;
  }
  function milestoneProgress(b: number) {
    const nm = nextMilestone(b);
    if (!nm) return 100;
    const prev = [0, 1, 5, 10].reverse().find((m) => m <= b) ?? 0;
    return Math.round(((b - prev) / (nm - prev)) * 100);
  }

  return (
    <>
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 mb-4">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>Track each user's progress toward the next milestone. Use "Assign promo" to manually grant a code directly from this view.</span>
      </div>

      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              className="h-9 w-full pl-8 pr-3 rounded-md border border-border bg-background text-sm"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Individual &amp; Business</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="BUSINESS">Business</option>
          </select>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[780px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-accent/10">
                {["User","Role","Bookings","Next milestone","Progress",""].map((h) => (
                  <th key={h} className="py-3 px-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">No users found</td></tr>
              ) : users.map((u: any) => {
                const bookings = u._count?.bookingsAsCustomer ?? 0;
                const nm = nextMilestone(bookings);
                const pct = milestoneProgress(bookings);
                return (
                  <tr key={u.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">{u.name?.[0] ?? "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge color={u.role === "BUSINESS" ? "blue" : "gray"}>{u.role}</Badge>
                    </td>
                    <td className="py-3 px-2 font-medium">{bookings}</td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">
                      {nm ? `${nm} bookings` : <Badge color="green">All milestones reached</Badge>}
                    </td>
                    <td className="py-3 px-2 min-w-[120px]">
                      <Progress value={pct} />
                    </td>
                    <td className="py-3 px-2">
                      <Button
                        size="sm" variant="outline"
                        className="gap-1.5 text-xs h-7"
                        onClick={() => setQuickAssignUser(u)}
                      >
                        <Gift className="h-3 w-3" /> Assign promo
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted-foreground text-xs">
            Showing {users.length} of {data?.total ?? 0}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={params.page === "1"}
              onClick={() => setParams((p) => ({ ...p, page: String(parseInt(p.page) - 1) }))}>
              ←
            </Button>
            <Button variant="outline" size="sm"
              disabled={users.length < parseInt(params.limit)}
              onClick={() => setParams((p) => ({ ...p, page: String(parseInt(p.page) + 1) }))}>
              →
            </Button>
          </div>
        </div>
      </div>

      {quickAssignUser && (
        <AssignPromoModal
          open={!!quickAssignUser}
          preselectedUser={quickAssignUser}
          onClose={() => setQuickAssignUser(null)}
        />
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// MODAL: CREATE PROMO
// ══════════════════════════════════════════════════════════════
function CreatePromoButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="h-4 w-4" /> New promo
      </Button>
      {open && <CreatePromoModal open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

function CreatePromoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createPromo = useCreatePromo();
  const { data: allUsers = [] } = useUsers({ limit: "100" });
  const users = (allUsers as any)?.users ?? [];

  const [form, setForm] = useState({
    code: "", description: "", discountType: "PERCENTAGE" as DiscountType,
    discountValue: "", minBookingAmount: "", maxDiscount: "",
    usageLimit: "", expiresAt: "", targetType: "ALL" as TargetType,
  });
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userSearch, setUserSearch] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const filteredUsers = users.filter((u: any) =>
    !userSearch ||
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!form.code || !form.discountValue)
      return toast.error("Code and discount value are required");

    createPromo.mutate({
      code: form.code.toUpperCase(),
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minBookingAmount: form.minBookingAmount ? parseFloat(form.minBookingAmount) : undefined,
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
      expiresAt: form.expiresAt || undefined,
      targetType: form.targetType,
      targetUserIds: form.targetType === "USER_SPECIFIC" ? Array.from(selectedUsers) : [],
    }, {
      onSuccess: () => { toast.success("Promo created"); onClose(); },
      onError: (e: any) => toast.error(e.message ?? "Failed to create promo"),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-medium">Create promo code</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manually create a promo for any target group</p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <StepHeader n={1} label="Code details" />

          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Promo code">
              <input
                className="modal-input" placeholder="e.g. SUMMER20"
                style={{ textTransform: "uppercase" }}
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
              />
            </ModalField>
            <ModalField label="Description">
              <input className="modal-input" placeholder="Short description"
                value={form.description} onChange={(e) => set("description", e.target.value)} />
            </ModalField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Discount type">
              <select className="modal-input" value={form.discountType}
                onChange={(e) => set("discountType", e.target.value)}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed amount (₦)</option>
              </select>
            </ModalField>
            <ModalField label="Discount value">
              <input className="modal-input" type="number" placeholder="e.g. 15"
                value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} />
            </ModalField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Min booking amount (₦)">
              <input className="modal-input" type="number" placeholder="Optional"
                value={form.minBookingAmount} onChange={(e) => set("minBookingAmount", e.target.value)} />
            </ModalField>
            <ModalField label="Max discount cap (₦)">
              <input className="modal-input" type="number" placeholder="% promos only"
                value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} />
            </ModalField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Usage limit">
              <input className="modal-input" type="number" placeholder="Blank = unlimited"
                value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} />
            </ModalField>
            <ModalField label="Expires at">
              <input className="modal-input" type="date"
                value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
            </ModalField>
          </div>

          <div className="border-t border-border pt-4">
            <StepHeader n={2} label="Target audience" />
          </div>

          <ModalField label="Who gets this promo?">
            <div className="flex flex-wrap gap-2 mt-1">
              {(["ALL","INDIVIDUAL","BUSINESS","USER_SPECIFIC"] as TargetType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => set("targetType", t)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs border transition-colors",
                    form.targetType === t
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background border-border text-muted-foreground hover:border-foreground/50"
                  )}
                >
                  {t === "ALL" ? "All users" : t === "USER_SPECIFIC" ? "Specific users" : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </ModalField>

          {form.targetType === "USER_SPECIFIC" && (
            <ModalField label={`Select users (${selectedUsers.size} selected)`}>
              <input
                className="modal-input mb-2" placeholder="Search by name or email..."
                value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
              />
              <div className="max-h-40 overflow-y-auto border border-border rounded-md p-1 space-y-0.5">
                {filteredUsers.map((u: any) => (
                  <div
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    className={cn("flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted", selectedUsers.has(u.id) && "bg-muted")}
                  >
                    <div className={cn("h-4 w-4 rounded border flex items-center justify-center flex-shrink-0",
                      selectedUsers.has(u.id) ? "bg-foreground border-foreground" : "border-border")}>
                      {selectedUsers.has(u.id) && <Check className="h-2.5 w-2.5 text-background" />}
                    </div>
                    <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{u.name?.[0]}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <Badge color={u.role === "BUSINESS" ? "blue" : "gray"}>{u.role}</Badge>
                  </div>
                ))}
              </div>
            </ModalField>
          )}
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={createPromo.isPending}>
            {createPromo.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            <Check className="h-3.5 w-3.5 mr-1.5" /> Create promo
          </Button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MODAL: ASSIGN PROMO
// ══════════════════════════════════════════════════════════════
function AssignPromoButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5">
        <UserPlus className="h-4 w-4" /> Assign to users
      </Button>
      {open && <AssignPromoModal open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

function AssignPromoModal({
  open, onClose, preselectedUser,
}: { open: boolean; onClose: () => void; preselectedUser?: any }) {
  const { data: promos = [] } = usePromos();
  const assignPromo = useAssignPromo();
  const { data: allUsersData } = useUsers({ limit: "100" });
  const users: any[] = (allUsersData as any)?.users ?? [];

  const activePromos = promos.filter((p: any) => p.isActive);

  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [newCode, setNewCode]   = useState("");
  const [newDisc, setNewDisc]   = useState("");
  const [newType, setNewType]   = useState<"%" | "₦">("%");
  const [newDays, setNewDays]   = useState("14");
  const [newDesc, setNewDesc]   = useState("");

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(
    preselectedUser ? new Set([preselectedUser.id]) : new Set()
  );
  const [userSearch,  setUserSearch]  = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [sendPush,    setSendPush]    = useState(true);
  const [sendEmail,   setSendEmail]   = useState(true);

  const toggleUser = (id: string) =>
    setSelectedUsers((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filteredUsers = users.filter((u: any) => {
    const matchSearch = !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const b = u._count?.bookingsAsCustomer ?? 0;
    const matchGroup =
      groupFilter === "all" ? true :
      groupFilter === "new" ? b === 0 :
      groupFilter === "business" ? u.role === "BUSINESS" :
      groupFilter === "milestone" ? [1, 5, 10, 20].find((m) => m - b <= 2 && m - b > 0) :
      true;
    return matchSearch && matchGroup;
  });

  const selectAll = () => {
    const ids = filteredUsers.map((u: any) => u.id);
    setSelectedUsers(new Set(ids));
  };

  const handleSubmit = () => {
    if (!selectedUsers.size) return toast.error("Select at least one user");

    if (mode === "existing") {
      if (!selectedPromoId) return toast.error("Select a promo code");
      const promo = promos.find((p: any) => p.id === selectedPromoId);
      assignPromo.mutate(
        { userIds: Array.from(selectedUsers), promoId: selectedPromoId,
          code: promo?.code, description: promo?.description,
          discountValue: promo?.discountValue, discountType: promo?.discountType,
          expiresInDays: 30, sendPush, sendEmail },
        { onSuccess: () => { toast.success(`Promo assigned to ${selectedUsers.size} user(s)`); onClose(); },
          onError: (e: any) => toast.error(e.message ?? "Failed to assign") }
      );
    } else {
      if (!newCode || !newDisc) return toast.error("Code and discount are required");
      assignPromo.mutate(
        { userIds: Array.from(selectedUsers),
          code: newCode.toUpperCase(), description: newDesc,
          discountValue: parseFloat(newDisc),
          discountType: newType === "%" ? "PERCENTAGE" : "FIXED",
          expiresInDays: parseInt(newDays), sendPush, sendEmail },
        { onSuccess: () => { toast.success(`Promo assigned to ${selectedUsers.size} user(s)`); onClose(); },
          onError: (e: any) => toast.error(e.message ?? "Failed to assign") }
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border border-border w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-medium">Assign promo to users</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {preselectedUser ? `Pre-selected: ${preselectedUser.name}` : "Select a promo and the users who receive it"}
            </p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Step 1 */}
          <StepHeader n={1} label="Choose promo code" />

          <div className="flex gap-2 mb-3">
            {(["existing","new"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={cn("px-3 py-1.5 rounded text-xs border transition-colors",
                  mode === m ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/40")}>
                {m === "existing" ? "Use existing code" : "Create new code"}
              </button>
            ))}
          </div>

          {mode === "existing" ? (
            <ModalField label="Select promo">
              <select className="modal-input" value={selectedPromoId}
                onChange={(e) => setSelectedPromoId(e.target.value)}>
                <option value="">— pick a code —</option>
                {activePromos.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.discountType === "PERCENTAGE" ? `${p.discountValue}%` : `₦${p.discountValue.toLocaleString()}`} off
                  </option>
                ))}
              </select>
            </ModalField>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ModalField label="Code">
                  <input className="modal-input" placeholder="e.g. SPECIAL30"
                    style={{ textTransform: "uppercase" }}
                    value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} />
                </ModalField>
                <ModalField label="Discount">
                  <div className="flex gap-1.5">
                    <input className="modal-input flex-1" type="number" placeholder="Value"
                      value={newDisc} onChange={(e) => setNewDisc(e.target.value)} />
                    <select className="modal-input w-16" value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                      <option>%</option><option>₦</option>
                    </select>
                  </div>
                </ModalField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ModalField label="Expires after">
                  <select className="modal-input" value={newDays} onChange={(e) => setNewDays(e.target.value)}>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                  </select>
                </ModalField>
                <ModalField label="Description">
                  <input className="modal-input" placeholder="Optional"
                    value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                </ModalField>
              </div>
            </div>
          )}

          {/* Step 2 */}
          <div className="border-t border-border pt-4">
            <StepHeader n={2} label={`Select users (${selectedUsers.size} selected)`} />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              { id: "all", label: "All" }, { id: "new", label: "New users" },
              { id: "milestone", label: "Near milestone" }, { id: "business", label: "Business" },
            ].map((g) => (
              <button key={g.id} onClick={() => setGroupFilter(g.id)}
                className={cn("px-2.5 py-1 rounded-full text-xs border transition-colors",
                  groupFilter === g.id ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground")}>
                {g.label}
              </button>
            ))}
          </div>

          <input className="modal-input w-full mb-2" placeholder="Search by name or email..."
            value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />

          <div className="max-h-44 overflow-y-auto border border-border rounded-md p-1 space-y-0.5">
            {filteredUsers.map((u: any) => (
              <div key={u.id} onClick={() => toggleUser(u.id)}
                className={cn("flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted", selectedUsers.has(u.id) && "bg-muted")}>
                <div className={cn("h-4 w-4 rounded border flex items-center justify-center flex-shrink-0",
                  selectedUsers.has(u.id) ? "bg-foreground border-foreground" : "border-border")}>
                  {selectedUsers.has(u.id) && <Check className="h-2.5 w-2.5 text-background" />}
                </div>
                <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{u.name?.[0]}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{u._count?.bookingsAsCustomer ?? 0} trips</span>
              </div>
            ))}
          </div>
          <button className="text-xs text-muted-foreground hover:text-foreground underline" onClick={selectAll}>
            Select all ({filteredUsers.length})
          </button>

          {/* Step 3 */}
          <div className="border-t border-border pt-4">
            <StepHeader n={3} label="Notify users" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Send push notification</p>
                <p className="text-xs text-muted-foreground">In-app alert with promo code</p>
              </div>
              <Switch checked={sendPush} onCheckedChange={setSendPush} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Send email</p>
                <p className="text-xs text-muted-foreground">Branded promo email via Brevo</p>
              </div>
              <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={assignPromo.isPending}>
            {assignPromo.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            Assign &amp; notify
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Shared modal helpers ───────────────────────────────────────
function StepHeader({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="h-5 w-5 rounded-full bg-foreground text-background text-[11px] font-medium flex items-center justify-center flex-shrink-0">
        {n}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1 text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

// ── Add this to your global CSS (index.css) ───────────────────
// .modal-input {
//   @apply h-9 w-full px-3 rounded-md border border-border bg-background text-sm;
// }