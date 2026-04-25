import { useState } from "react";
import { Plus, UserCircle, CheckCircle, Truck, Clock, Calendar, Eye, Download, X, Edit } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
  const [selected, setSelected] = useState<Driver | null>(null);

  return (
    <div>
      <PageHeader
        title="Drivers Management"
        subtitle="Keep track of driver details, availability, and performance."
        actions={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Driver</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Bookings Assigned" value="6" hint="2 bookings assigned to drivers" hintTone="muted" icon={UserCircle} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Trips Completed" value="6" hint="6 trips successfully completed" icon={CheckCircle} iconBg="bg-success/15 text-success" />
        <StatCard label="Active Drivers" value="4" hint="2 drivers currently available" hintTone="muted" icon={Truck} iconBg="bg-accent/15 text-accent" />
        <StatCard label="Pending Trips" value="2" hint="Trips assigned but not yet started" hintTone="warning" icon={Clock} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Yearly Bookings Assigned" value="6" hint="6 bookings assigned to drivers" hintTone="muted" icon={Calendar} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Weekly Bookings Assigned" value="10" hint="6 bookings assigned to drivers" hintTone="muted" icon={Calendar} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Monthly Bookings Assigned" value="20" hint="6 bookings assigned to drivers" hintTone="muted" icon={Calendar} iconBg="bg-warning/15 text-warning" />
        <StatCard label="Deactivated Drivers" value="0" hint="Total deactivated drivers" hintTone="destructive" icon={X} iconBg="bg-destructive/15 text-destructive" />
      </div>

      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <input placeholder="Search by Name, Email, Phone Numb..." className="h-9 px-3 rounded-md border border-border bg-background text-sm flex-1" />
          <select className="h-9 px-3 rounded-md border border-border bg-background text-sm"><option>Date</option></select>
          <select className="h-9 px-3 rounded-md border border-border bg-background text-sm"><option>All Status</option></select>
          <select className="h-9 px-3 rounded-md border border-border bg-background text-sm"><option>All Rating</option></select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">Drivers ({drivers.length})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Active (2)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Available (2)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Suspended (0)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Deactivated (1)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> Offline (1)</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
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
            </thead>
            <tbody>
              {drivers.map((d, i) => (
                <tr key={d.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 px-3"><input type="checkbox" /></td>
                  <td className="py-3">{d.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7"><AvatarImage src={`https://i.pravatar.cc/40?img=${i + 5}`} /><AvatarFallback>{d.name[0]}</AvatarFallback></Avatar>
                      {d.name}
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{d.contact}</td>
                  <td className="py-3"><StatusBadge status={d.status} /></td>
                  <td className="py-3">{typeof d.rating === "number" ? <span className="text-warning">★ {d.rating}</span> : <span className="text-muted-foreground">{d.rating}</span>}</td>
                  <td className="py-3">{d.performance}</td>
                  <td className="py-3"><StatusBadge status={d.bookingStatus} /></td>
                  <td className="py-3">
                    <button onClick={() => setSelected(d)} className="text-accent hover:opacity-80" aria-label="View"><Eye className="h-4 w-4" /></button>
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
            <SheetTitle>Driver' details</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-6">
                <Avatar className="h-20 w-20"><AvatarImage src="https://i.pravatar.cc/120?img=8" /><AvatarFallback>{selected.name[0]}</AvatarFallback></Avatar>
                <Button variant="outline" size="sm" className="gap-2"><Edit className="h-4 w-4" /> Edit</Button>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <Detail label="Driver ID" value={selected.id} />
                <Detail label="Driver's Name" value={selected.name} />
                <Detail label="Contact" value={selected.contact} />
                <Detail label="Account Status" value={<StatusBadge status={selected.status} />} />
                <Detail label="Email" value={selected.email} />
                <Detail label="Gender" value={selected.gender} />
                <Detail label="Rating" value={String(selected.rating)} />
                <Detail label="Registration Date" value="Sep, 2025,2:30:48 PM" />
                <Detail label="Performance" value={selected.performance} />
                <Detail label="Booking Status" value={<StatusBadge status={selected.bookingStatus} />} />
                <Detail label="Vehicle" value={selected.vehicle} />
                <Detail label="Vehicle" value={selected.vehicleType} />
                <Detail label="Availability Status" value={<StatusBadge status="Available" />} />
                <Detail label="Address" value={selected.address} />
                <Detail label="Total Trips Completed" value={`${selected.trips} trips completed`} />
              </div>
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