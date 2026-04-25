import { useState } from "react";
import { Plus, UserCircle, CheckCircle, Truck, Clock, Calendar, Eye, Download, X, Edit, ShieldX, ShieldCheck, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDrivers, useVerifyLicense, useAssignDriver, useBookingStats } from '@/hooks/useAdminData';
import { toast } from 'sonner';

type Driver = {
  id: string;
  name: string;
  contact: string;
  status: string;
  rating: string | number;
  performance: string;
  bookingStatus: string;
  email: string;
  vehicle: string;
  vehicleType: string;
  address: string;
  gender: string;
  trips: number;
};

const drivers: Driver[] = [
  { id: "Logist-001", name: "Matthew B", contact: "+123 806234551", status: "Active", rating: "No rating", performance: "12/15 Trips", bookingStatus: "Assigned", email: "Matthew18@gmail.com", vehicle: "Logist-r233535845", vehicleType: "Toyota", address: "12 olarinwaju street", gender: "Male", trips: 12 },
  { id: "Logist-002", name: "Timothy O", contact: "+123 806234551", status: "Available", rating: 4.9, performance: "12/15 Trips", bookingStatus: "Pending", email: "timothy@gmail.com", vehicle: "Logist-r233535846", vehicleType: "Honda", address: "5 ikoyi road", gender: "Male", trips: 12 },
  { id: "Logist-003", name: "David L", contact: "+123 806234551", status: "Suspended", rating: 4.9, performance: "12/15 Trips", bookingStatus: "Cancelled", email: "david@gmail.com", vehicle: "Logist-r233535847", vehicleType: "Toyota", address: "9 ajao estate", gender: "Male", trips: 11 },
  { id: "Logist-004", name: "Israel K", contact: "+123 806234551", status: "Deactivate", rating: 3.9, performance: "12/15 Trips", bookingStatus: "Cancelled", email: "israel@gmail.com", vehicle: "Logist-r233535848", vehicleType: "Lexus", address: "21 ikeja road", gender: "Male", trips: 10 },
  { id: "Logist-005", name: "Faith F", contact: "+123 806234551", status: "offline", rating: "No rating", performance: "12/15 Trips", bookingStatus: "Rejected", email: "faith@gmail.com", vehicle: "Logist-r233535849", vehicleType: "Toyota", address: "33 yaba road", gender: "Female", trips: 9 },
];

const Drivers = () => {
  const [selected, setSelected] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, string>>({ page: '1', limit: '20' });
  const { data, isLoading } = useDrivers(params);
  const { data: stats } = useBookingStats();
  const verify = useVerifyLicense();

  const drivers = data?.drivers ?? [];
  const total = data?.total ?? 0;

  const onlineCount = drivers.filter((d: any) => d.isOnline).length;
  const availableCount = drivers.filter((d: any) => d.isAvailable).length;
  const deactivatedCount = drivers.filter((d: any) => !d.user?.isActive).length;


  return (
    <div>
      <PageHeader
        title="Drivers Management"
        subtitle="Keep track of driver details, availability, and performance."
        // actions={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Driver</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Drivers" value={String(total)} hint="All registered drivers" hintTone="muted" icon={UserCircle} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Trips Completed" value={String(stats?.completedBookings ?? 0)} hint="Total completed trips" icon={CheckCircle} iconBg="bg-success/15 text-success" />
        <StatCard label="Online Drivers" value={String(onlineCount)} hint={`${availableCount} currently available`} hintTone="muted" icon={Truck} iconBg="bg-accent/15 text-accent" />
        <StatCard label="Pending Trips" value={String(stats?.pendingBookings ?? 0)} hint="Trips not yet started" hintTone="warning" icon={Clock} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Yearly Bookings" value={String(stats?.totalBookings ?? 0)} hint="All time bookings" hintTone="muted" icon={Calendar} iconBg="bg-warning/15 text-warning" />
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
          <select className="h-9 px-3 rounded-md border border-border bg-background text-sm"><option>Date</option></select>
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
          <select className="h-9 px-3 rounded-md border border-border bg-background text-sm"><option>All Rating</option></select>
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
            {/* <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-muted/40">
                <th className="py-3 px-3"><input type="checkbox" /></th>
                <th className="py-3 font-medium">Driver ID</th>
                <th className="py-3 font-medium">Driver's Name</th>
                <th className="py-3 font-medium">Contact</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Rating</th>
                <th className="py-3 font-medium">Performance</th>
                <th className="py-3 font-medium">Booking Status</th>
                <th className="py-3 font-medium">Action</th>
              </tr>
            </thead> */}
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
              ) : drivers.map((d: any, i: number) => (
                <tr key={d.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 px-3"><input type="checkbox" /></td>
                  <td className="py-3">
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
                  <td className="py-3 text-muted-foreground">{d.user?.phone ?? '—'}</td>
                  <td className="py-3"><StatusBadge status={d.onlineStatus} /></td>
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
                  <StatusBadge status={selected.licenseStatus} />
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
                <Detail label="Account Active" value={selected.user?.isActive ? 'Yes' : 'No'} />
                <Detail label="Available" value={selected.isAvailable ? 'Yes' : 'No'} />
              </div>

              {selected.licenseImageUrl && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">License Image</p>
                  <a href={selected.licenseImageUrl} target="_blank" rel="noreferrer">
                    <img src={selected.licenseImageUrl} alt="License" className="w-full rounded-lg border border-border object-cover max-h-48" />
                  </a>
                </div>
              )}

              {selected.licenseStatus === 'PENDING' && (
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => verify.mutate(
                      { driverProfileId: selected.id, status: 'APPROVED' },
                      { onSuccess: () => { toast.success('License approved'); setSelected(null); } }
                    )}
                    disabled={verify.isPending}
                  >
                    <ShieldCheck className="h-4 w-4" /> Approve License
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
            </div>
          )}
        </SheetContent>
      </Sheet>
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