import { Filter, Download, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const txns = [
  { id: "TXN-001", user: "Matthew B", method: "Card", trip: "TRP-234", amt: "₦45,000", status: "Successful", date: "2026-01-15 14:30" },
  { id: "TXN-002", user: "Ade A", method: "Bank Transfer", trip: "TRP-235", amt: "₦35,000", status: "Successful", date: "2026-01-15 14:30" },
  { id: "TXN-003", user: "Timothy O", method: "Monthly Invoice", trip: "TRP-236", amt: "₦70,000", status: "Pending", date: "2026-01-15 14:30" },
  { id: "TXN-004", user: "Bimbo F", method: "Card", trip: "TRP-237", amt: "₦5,8000", status: "Failed", date: "2026-01-15 14:30" },
];

const PayCard = ({ label, value, hint, hintTone = "success" }: { label: string; value: string; hint: string; hintTone?: string }) => (
  <div className="bg-surface rounded-xl p-5 border border-border">
    <div className="flex items-center gap-2 text-xs">
      <span className="h-6 w-6 rounded bg-success/15 text-success flex items-center justify-center font-bold">₦</span>
      <span className={hintTone === "success" ? "text-success flex items-center gap-1" : "text-muted-foreground"}>
        <TrendingUp className="h-3 w-3" /> {hint}
      </span>
    </div>
    <p className="text-2xl font-bold mt-3">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </div>
);

const Payment = () => (
  <div>
    <PageHeader
      title="Payments & Billing"
      subtitle="Track revenue, transactions, and generate invoices."
      actions={<Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button>}
    />

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <PayCard label="Today's Revenue" value="₦2.4M" hint="+18.2%" />
      <PayCard label="This Month" value="₦45.8M" hint="+12.5%" />
      <PayCard label="This Year" value="₦312.4M" hint="+24.3%" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <div className="bg-surface rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-medium">Business Payments</span>
          <span className="text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +8.4% from last month</span>
        </div>
        <p className="text-3xl font-bold">₦18.2M</p>
        <p className="text-xs text-muted-foreground mt-1">847 transaction</p>
      </div>
      <div className="bg-surface rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-medium">Individual Payments</span>
          <span className="text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +15.2% from last month</span>
        </div>
        <p className="text-3xl font-bold">₦27.6M</p>
        <p className="text-xs text-muted-foreground mt-1">124 transactions</p>
      </div>
    </div>

    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <input placeholder="Search User" className="h-9 px-3 rounded-md border border-border bg-background text-sm flex-1" />
        <select className="h-9 px-3 rounded-md border border-border bg-background text-sm"><option>Date</option></select>
        <select className="h-9 px-3 rounded-md border border-border bg-background text-sm"><option>Type</option></select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium">Business (6)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Successful (1)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Pending (1)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Failed (1)</span>
        </div>
        <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border bg-accent/10">
              <th className="py-3 px-3"><input type="checkbox" /></th>
              <th className="py-3 font-medium">Transaction ID</th>
              <th className="py-3 font-medium">User</th>
              <th className="py-3 font-medium">Payment Method</th>
              <th className="py-3 font-medium">Trip ID</th>
              <th className="py-3 font-medium">Amount</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t, i) => (
              <tr key={t.id} className="border-b border-border/60 last:border-0">
                <td className="py-3 px-3"><input type="checkbox" /></td>
                <td className="py-3">{t.id}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7"><AvatarImage src={`https://i.pravatar.cc/40?img=${i + 30}`} /><AvatarFallback>{t.user[0]}</AvatarFallback></Avatar>
                    {t.user}
                  </div>
                </td>
                <td className="py-3 text-muted-foreground">{t.method}</td>
                <td className="py-3">{t.trip}</td>
                <td className="py-3">{t.amt}</td>
                <td className="py-3"><StatusBadge status={t.status} /></td>
                <td className="py-3 text-muted-foreground">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Payment;