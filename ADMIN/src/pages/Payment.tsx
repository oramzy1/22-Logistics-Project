import { Filter, Download, TrendingUp, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBookings, useBookingStats } from "@/hooks/useAdminData";
import { useState } from "react";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";

const fmt = (n: number) => n >= 1_000_000
  ? `₦${(n / 1_000_000).toFixed(1)}M`
  : `₦${n.toLocaleString()}`;


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

const Payment = () => {
  const { data: stats } = useBookingStats();
  const [params, setParams] = useState<Record<string, string>>({ page: '1', limit: '20' });
  const { data, isLoading } = useBookings(params);
  const bookings = data?.bookings ?? [];
  const total = data?.total ?? 0;
  return(
  <div>
      <PageHeader
        title="Payments & Billing"
        subtitle="Track revenue, transactions, and generate invoices."
        actions={
          <select
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
            onChange={(e) => setParams(p => ({ ...p, rideType: e.target.value, page: '1' }))}
          >
            <option value="">All Types</option>
            <option value="BUSINESS">Business</option>
            <option value="INDIVIDUAL">Individual</option>
          </select>
        }
      />

   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {[
          { label: "Today's Revenue", value: fmt(stats?.revenueToday ?? 0) },
          { label: "This Month", value: fmt(stats?.revenueThisMonth ?? 0) },
          { label: "This Year", value: fmt(stats?.revenueThisYear ?? 0) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-6 w-6 rounded bg-success/15 text-success flex items-center justify-center font-bold">₦</span>
              <span className="text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Live</span>
            </div>
            <p className="text-2xl font-bold mt-3">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-surface rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-medium">Business Payments</span>
            <span className="text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" /> All time</span>
          </div>
          <p className="text-3xl font-bold">{fmt(stats?.businessRevenue ?? 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats?.businessTxnCount ?? 0} transactions</p>
        </div>
        <div className="bg-surface rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-medium">Individual Payments</span>
            <span className="text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" /> All time</span>
          </div>
          <p className="text-3xl font-bold">{fmt(stats?.individualRevenue ?? 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats?.individualTxnCount ?? 0} transactions</p>
        </div>
      </div>

    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <input
            placeholder="Search customer..."
            className="h-9 px-3 rounded-md border border-border bg-background text-sm flex-1"
            onChange={(e) => setParams(p => ({ ...p, search: e.target.value, page: '1' }))}
          />
       <DateRangeFilter
  onChange={(from, to) => setParams(p => ({ ...p, dateFrom: from, dateTo: to, page: '1' }))}
/>
            <select
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
            onChange={(e) => setParams(p => ({ ...p, status: e.target.value, page: '1' }))}
          >
            <option value="">All Status</option>
            <option value="AWAITING_DRIVER">Paid</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* <span className="font-medium">Business (6)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Successful (1)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Pending (1)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Failed (1)</span> */}
           <span className="font-medium">Transactions ({total})</span>
        </div>
        <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[800px]">
           <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-accent/10">
                <th className="py-3 px-3"><input type="checkbox" /></th>
                <th className="py-3 font-medium">Booking ID</th>
                <th className="py-3 font-medium">Customer</th>
                <th className="py-3 font-medium">Type</th>
                <th className="py-3 font-medium">Package</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Payment</th>
                <th className="py-3 font-medium">Date</th>
              </tr>
            </thead>
           <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-12 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : bookings.map((b: any, i: number) => (
                <tr key={b.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 px-3"><input type="checkbox" /></td>
                  <td className="py-3 font-mono text-xs">{b.trackingId ?? b.id.slice(0, 8)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback>{b.customer?.name?.[0] ?? '?'}</AvatarFallback>
                      </Avatar>
                      {b.customer?.name ?? '—'}
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{b.rideType}</td>
                  <td className="py-3">{b.packageType ?? '—'}</td>
                  <td className="py-3 font-medium">₦{b.totalAmount?.toLocaleString()}</td>
                  <td className="py-3"><StatusBadge status={b.paymentStatus} /></td>
                  <td className="py-3 text-muted-foreground text-xs">{new Date(b.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  </div>
);}

export default Payment;