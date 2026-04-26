import { useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Search,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useBookings,
  useCancelBooking,
  useBookingStats,
} from "@/hooks/useAdminData";
import { toast } from "sonner";
import { BookingDetailSheet } from "@/components/dashboard/BookingDetailSheet";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";

const Bookings = () => {
  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    limit: "20",
  });
  const { data, isLoading } = useBookings(params);
  const { data: stats } = useBookingStats();
  const cancel = useCancelBooking();
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const bookings = data?.bookings ?? [];
  const total = data?.total ?? 0;
  const currentPage = parseInt(params.page);
  const limit = parseInt(params.limit);
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Booking Management"
        subtitle="Welcome back! Here's your overview."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Total Bookings"
          value={String(stats?.totalBookings ?? 0)}
          hint="+0% from yesterday"
          icon={CalendarCheck}
          iconBg="bg-warning/15 text-warning"
        />
        <StatCard
          label="Confirmed"
          value={String(stats?.confirmedBookings ?? 0)}
          hint="+0% from yesterday"
          icon={CheckCircle2}
          iconBg="bg-success/15 text-success"
        />
        <StatCard
          label="Pending"
          value={String(stats?.pendingBookings ?? 0)}
          hint="+0% from yesterday"
          icon={Clock}
          iconBg="bg-warning/15 text-warning"
        />
        <StatCard
          label="Cancelled"
          value={String(stats?.cancelledBookings ?? 0)}
          hint="+0% from yesterday"
          hintTone="destructive"
          icon={XCircle}
          iconBg="bg-destructive/15 text-destructive"
        />
      </div>

      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold">Booking List</h2>
          <div className="flex flex-col sm:flex-row gap-2 lg:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={params.search ?? ""}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    search: e.target.value,
                    page: "1",
                  }))
                }
                placeholder="Search by booking ID, Customer Name or Name"
                className="h-9 pl-9 pr-3 rounded-md border border-border bg-background text-sm w-full sm:w-72"
              />
            </div>
            <DateRangeFilter
  onChange={(from, to) => setParams(p => ({ ...p, dateFrom: from, dateTo: to, page: '1' }))}
/>
            <select
              className="h-9 px-3 rounded-md border border-border bg-background text-sm"
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  rideType: e.target.value,
                  page: "1",
                }))
              }
            >
              <option value="">All Types</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="BUSINESS">Business</option>
            </select>
            <select
              className="h-9 px-3 rounded-md border border-border bg-background text-sm"
              onChange={(e) =>
                setParams((p) => ({ ...p, status: e.target.value, page: "1" }))
              }
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="AWAITING_DRIVER">Awaiting Driver</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-muted/40">
                <th className="py-3 px-3">
                  <input type="checkbox" />
                </th>
                <th className="py-3 font-medium">Booking ID</th>
                <th className="py-3 font-medium">Customer Name</th>
                <th className="py-3 font-medium">Type</th>
                <th className="py-3 font-medium">Package</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Booking Time</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-muted-foreground text-sm"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b: any) => (
                  <tr
                    key={b.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3 px-3">
                      <input type="checkbox" />
                    </td>
                    <td className="py-3 font-mono text-xs">
                      {b.trackingId ?? b.id.slice(0, 8)}
                    </td>
                    <td className="py-3">{b.customer?.name ?? "—"}</td>
                    <td className="py-3 text-muted-foreground">{b.rideType}</td>
                    <td className="py-3">{b.packageType ?? "—"}</td>
                    <td className="py-3">₦{b.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!["COMPLETED", "CANCELLED"].includes(b.status) && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                cancel.mutate(
                                  { id: b.id, reason: "Cancelled by admin" },
                                  {
                                    onSuccess: () =>
                                      toast.success("Booking cancelled"),
                                  },
                                )
                              }
                            >
                              Cancel Booking
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setSelectedBooking(b)}
                          >
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page:</span>
            <select
              className="h-8 px-2 rounded border border-border bg-background"
              value={params.limit}
              onChange={(e) =>
                setParams((p) => ({ ...p, limit: e.target.value, page: "1" }))
              }
            >
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <span className="text-muted-foreground">
            Showing {Math.min((currentPage - 1) * limit + 1, total)}–
            {Math.min(currentPage * limit, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() =>
                setParams((p) => ({ ...p, page: String(currentPage - 1) }))
              }
            >
              ←
            </Button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={p === currentPage ? "default" : "outline"}
                onClick={() =>
                  setParams((prev) => ({ ...prev, page: String(p) }))
                }
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setParams((p) => ({ ...p, page: String(currentPage + 1) }))
              }
            >
              →
            </Button>
          </div>
        </div>
      </div>
      <BookingDetailSheet
        booking={selectedBooking}
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
};

export default Bookings;
