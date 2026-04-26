import { useState } from "react";
import { UserCircle, CheckCircle, Truck, Clock, Calendar, Eye, Download, X, ShieldX, ShieldCheck, Loader2, UserX, Trash2, Car } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDrivers, useVerifyLicense, useBookingStats, useAssignDriver, useSetUserStatus, useDeleteUser, useBookings } from '@/hooks/useAdminData';
import { toast } from 'sonner';
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";

const Drivers = () => {
  const [selected, setSelected] = useState<any | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string>('');
  const [params, setParams] = useState<Record<string, string>>({ page: '1', limit: '20' });

  const { data, isLoading, refetch } = useDrivers(params);
  const { data: stats } = useBookingStats();
  const { data: awaitingData } = useBookings({ status: 'AWAITING_DRIVER', paymentStatus: 'PAID', limit: '50' });
  const verify = useVerifyLicense();
  const assign = useAssignDriver();
  const setStatus = useSetUserStatus();
  const deleteUser = useDeleteUser();

  const drivers = data?.drivers ?? [];
  const total = data?.total ?? 0;
  const awaitingBookings = awaitingData?.bookings ?? [];

  const onlineCount = drivers.filter((d: any) => d.isOnline).length;
  const availableCount = drivers.filter((d: any) => d.isAvailable).length;
  const deactivatedCount = drivers.filter((d: any) => !d.user?.isActive).length;

  const handleAssign = () => {
    if (!selectedBooking || !selected) return;
    assign.mutate(
      { bookingId: selectedBooking, driverProfileId: selected.id },
      {
        onSuccess: () => {
          toast.success('Driver assigned successfully');
          setAssignOpen(false);
          setSelectedBooking('');
          refetch();
        },
        onError: (e: any) => toast.error(e.message ?? 'Assignment failed'),
      }
    );
  };

  // Driver can be assigned if online and not AWAY
  const canBeAssigned = (d: any) => d.isOnline && d.onlineStatus !== 'AWAY' && d.isAvailable;

  return (
    <div>
      <PageHeader
        title="Drivers Management"
        subtitle="Keep track of driver details, availability, and performance."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Drivers" value={String(total)} hint="All registered drivers" hintTone="muted" icon={UserCircle} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Trips Completed" value={String(stats?.completedBookings ?? 0)} hint="Total completed trips" icon={CheckCircle} iconBg="bg-success/15 text-success" />
        <StatCard label="Online Drivers" value={String(onlineCount)} hint={`${availableCount} currently available`} hintTone="muted" icon={Truck} iconBg="bg-accent/15 text-accent" />
        <StatCard label="Pending Trips" value={String(stats?.pendingBookings ?? 0)} hint="Trips not yet started" hintTone="warning" icon={Clock} iconBg="bg-warning/15 text-warning" />
        <StatCard label="All Bookings" value={String(stats?.totalBookings ?? 0)} hint="All time paid bookings" hintTone="muted" icon={Calendar} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Pending Licenses" value={String(stats?.pendingLicenses ?? 0)} hint="Awaiting verification" hintTone="warning" icon={Calendar} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Confirmed Bookings" value={String(stats?.confirmedBookings ?? 0)} hint="Accepted or in progress" hintTone="muted" icon={Calendar} iconBg="bg-success/15 text-success" />
        <StatCard label="Deactivated Drivers" value={String(deactivatedCount)} hint="Total deactivated" hintTone="destructive" icon={X} iconBg="bg-destructive/15 text-destructive" />
      </div>

      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <input
            placeholder="Search by Name, Email, Phone..."
            className="h-9 px-3 rounded-md border border-border bg-background text-sm flex-1"
            onChange={(e) => setParams(p => ({ ...p, search: e.target.value, page: '1' }))}
          />
          <DateRangeFilter
  onChange={(from, to) => setParams(p => ({ ...p, dateFrom: from, dateTo: to, page: '1' }))}
/>
          <select
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
            onChange={(e) => setParams(p => ({ ...p, licenseStatus: e.target.value, page: '1' }))}
          >
            <option value="">All License Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
            onChange={(e) => setParams(p => ({ ...p, isOnline: e.target.value, page: '1' }))}
          >
            <option value="">All Status</option>
            <option value="true">Online</option>
            <option value="false">Offline</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">Drivers ({total})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Online ({onlineCount})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Available ({availableCount})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Deactivated ({deactivatedCount})</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-muted/40">
                <th className="py-3 px-3"><input type="checkbox" /></th>
                <th className="py-3 font-medium">Driver</th>
                <th className="py-3 font-medium">Contact</th>
                <th className="py-3 font-medium">Online Status</th>
                <th className="py-3 font-medium">Rating</th>
                <th className="py-3 font-medium">Total Trips</th>
                <th className="py-3 font-medium">License</th>
                <th className="py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-12 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : drivers.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">No drivers found</td></tr>
              ) : drivers.map((d: any) => (
                <tr key={d.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 px-3"><input type="checkbox" /></td>
                  <td className={`py-3 ${!d.user?.isActive ? 'line-through text-muted-foreground' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={d.user?.avatarUrl} />
                        <AvatarFallback>{d.user?.name?.[0] ?? 'D'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{d.user?.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{d.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`py-3 ${!d.user?.isActive ? 'line-through text-muted-foreground' : ''}`}>{d.user?.phone ?? '—'}</td>
                  <td className="py-3"><StatusBadge status={!d.user?.isActive ? 'DEACTIVATED' : d.onlineStatus} /></td>
                  <td className="py-3">
                    {d.rating > 0
                      ? <span className="text-warning">★ {d.rating.toFixed(1)}</span>
                      : <span className="text-muted-foreground">No rating</span>}
                  </td>
                  <td className="py-3">{d.totalTrips}</td>
                  <td className="py-3"><StatusBadge status={d.licenseStatus} /></td>
                  <td className="py-3">
                    <button onClick={() => setSelected(d)} className="text-accent hover:opacity-80" aria-label="View">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Driver Details</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selected.user?.avatarUrl} />
                  <AvatarFallback>{selected.user?.name?.[0] ?? 'D'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{selected.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.user?.email}</p>
                  <div className="flex gap-2 mt-1">
                    <StatusBadge status={selected.licenseStatus} />
                    <StatusBadge status={selected.user?.isActive ? 'Active' : 'Inactive'} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <Detail label="Phone" value={selected.user?.phone ?? '—'} />
                <Detail label="Online Status" value={<StatusBadge status={selected.onlineStatus} />} />
                <Detail label="Rating" value={selected.rating > 0 ? `★ ${selected.rating.toFixed(1)}` : 'No rating'} />
                <Detail label="Total Trips" value={String(selected.totalTrips)} />
                <Detail label="Acceptance Rate" value={`${selected.acceptanceRate ?? 0}%`} />
                <Detail label="Vehicle Type" value={selected.vehicleType ?? '—'} />
                <Detail label="Brand / Model" value={selected.brandModel ?? '—'} />
                <Detail label="Plate Number" value={selected.plateNumber ?? '—'} />
                <Detail label="Vehicle Color" value={selected.vehicleColor ?? '—'} />
                <Detail label="Working Hours" value={selected.workingHours ?? '—'} />
              </div>

              {selected.licenseImageUrl && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">License Image</p>
                  <a href={selected.licenseImageUrl} target="_blank" rel="noreferrer">
                    <img src={selected.licenseImageUrl} alt="License" className="w-full rounded-lg border border-border object-cover max-h-48" />
                  </a>
                </div>
              )}

              {/* License actions */}
              {selected.licenseStatus === 'PENDING' && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => verify.mutate(
                      { driverProfileId: selected.id, status: 'APPROVED' },
                      { onSuccess: () => { toast.success('License approved'); setSelected(null); } }
                    )}
                    disabled={verify.isPending}
                  >
                    <ShieldCheck className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => verify.mutate(
                      { driverProfileId: selected.id, status: 'REJECTED', rejectionReason: 'Does not meet requirements' },
                      { onSuccess: () => { toast.success('License rejected'); setSelected(null); } }
                    )}
                    disabled={verify.isPending}
                  >
                    <ShieldX className="h-4 w-4" /> Reject
                  </Button>
                </div>
              )}

              {/* Assign to ride — only if online and not AWAY */}
              {canBeAssigned(selected) && awaitingBookings.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setAssignOpen(true)}
                >
                  <Car className="h-4 w-4" /> Assign to a Ride
                </Button>
              )}

              {/* Account actions */}
              <div className="border-t border-border pt-4 flex gap-3">
                {selected.user?.isActive ? (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-warning border-warning/40 hover:bg-warning/10"
                    onClick={() => setStatus.mutate(
                      { id: selected.userId, isActive: false },
                      { onSuccess: () => { toast.success('Driver deactivated'); setSelected(null); } }
                    )}
                    disabled={setStatus.isPending}
                  >
                    <UserX className="h-4 w-4" /> Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => setStatus.mutate(
                      { id: selected.userId, isActive: true },
                      { onSuccess: () => { toast.success('Driver reactivated'); setSelected(null); } }
                    )}
                    disabled={setStatus.isPending}
                  >
                    Reactivate
                  </Button>
                )}
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => deleteUser.mutate(
                    selected.userId,
                    { onSuccess: () => { toast.success('Driver deleted'); setSelected(null); } }
                  )}
                  disabled={deleteUser.isPending}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Assign ride dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {selected?.user?.name} to a Ride</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">Select a booking awaiting a driver:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {awaitingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No rides awaiting assignment</p>
              ) : awaitingBookings.map((b: any) => (
                <label
                  key={b.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedBooking === b.id ? 'border-accent bg-accent/10' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="booking"
                    value={b.id}
                    checked={selectedBooking === b.id}
                    onChange={() => setSelectedBooking(b.id)}
                    className="mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{b.trackingId ?? b.id.slice(0, 8)} — {b.customer?.name}</p>
                    <p className="text-xs text-muted-foreground">{b.packageType} · {b.pickupAddress}</p>
                    <p className="text-xs text-muted-foreground">₦{b.totalAmount?.toLocaleString()} · {new Date(b.scheduledAt).toLocaleString()}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedBooking || assign.isPending}>
              {assign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <div className="font-medium">{value}</div>
  </div>
);

export default Drivers;