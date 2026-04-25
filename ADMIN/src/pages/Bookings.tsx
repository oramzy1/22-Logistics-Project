import { useState } from "react";
import { CalendarCheck, CheckCircle2, Clock, XCircle, Download, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";

const data = [
  { id: "BKG-001", name: "Jane D", type: "Individual", duration: "6 hrs", amount: "₦24,000", time: "Mon, Sep, 2nd 2025,2:30:48 PM", status: "Completed" },
  { id: "BKG-002", name: "Ade ayo", type: "Business", duration: "6 hrs", amount: "₦24,000", time: "Mon, Sep, 2nd 2025,2:30:48 PM", status: "Completed" },
  { id: "BKG-003", name: "Bayo", type: "Individual", duration: "Multi-day", amount: "₦24,000", time: "Mon, Sep, 2nd 2025,2:30:48 PM", status: "Pending" },
  { id: "BKG-004", name: "Samuel", type: "Business", duration: "Multi-day", amount: "₦24,000", time: "Mon, Sep, 2nd 2025,2:30:48 PM", status: "Cancelled" },
  { id: "BKG-005", name: "Tope", type: "Business", duration: "10 hrs", amount: "₦24,000", time: "Mon, Sep, 2nd 2025,2:30:48 PM", status: "Completed" },
];

const Bookings = () => {
  const [q, setQ] = useState("");
  const filtered = data.filter((d) => `${d.id} ${d.name}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Booking Management"
        subtitle="Welcome back! Here's your overview."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
            <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Bookings" value="6" hint="+0% from yesterday" icon={CalendarCheck} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Confirmed" value="6" hint="+0% from yesterday" icon={CheckCircle2} iconBg="bg-success/15 text-success" />
        <StatCard label="Pending" value="2" hint="+0% from yesterday" icon={Clock} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Cancelled" value="1" hint="+0% from yesterday" hintTone="destructive" icon={XCircle} iconBg="bg-destructive/15 text-destructive" />
      </div>

      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold">Booking List</h2>
          <div className="flex flex-col sm:flex-row gap-2 lg:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by booking ID, Customer Name or Name"
                className="h-9 pl-9 pr-3 rounded-md border border-border bg-background text-sm w-full sm:w-72"
              />
            </div>
            <select className="h-9 px-3 rounded-md border border-border bg-background text-sm">
              <option>Date</option>
            </select>
            <select className="h-9 px-3 rounded-md border border-border bg-background text-sm">
              <option>All Types</option>
            </select>
            <select className="h-9 px-3 rounded-md border border-border bg-background text-sm">
              <option>All Status</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-muted/40">
                <th className="py-3 px-3"><input type="checkbox" /></th>
                <th className="py-3 font-medium">Booking ID</th>
                <th className="py-3 font-medium">Customer Name</th>
                <th className="py-3 font-medium">Type</th>
                <th className="py-3 font-medium">Duration</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Booking Time</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 px-3"><input type="checkbox" /></td>
                  <td className="py-3">{b.id}</td>
                  <td className="py-3">{b.name}</td>
                  <td className="py-3 text-muted-foreground">{b.type}</td>
                  <td className="py-3">{b.duration}</td>
                  <td className="py-3">{b.amount}</td>
                  <td className="py-3 text-muted-foreground">{b.time}</td>
                  <td className="py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page:</span>
            <select className="h-8 px-2 rounded border border-border bg-background"><option>20</option></select>
          </div>
          <span className="text-muted-foreground">Showing results 1-10 of 100</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm">←</Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <span className="px-1">...</span>
            <Button variant="outline" size="sm">9</Button>
            <Button variant="outline" size="sm">10</Button>
            <Button variant="outline" size="sm">→</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;