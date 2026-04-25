import { useState } from "react";
import { MapPin, Gauge, Navigation } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const trips = [
  { id: 1, vehicle: "Logist#24365", driver: "Matthew B", driverId: "Logist#75327", location: "Onisha", status: "Active" },
  { id: 2, vehicle: "Logist#24366", driver: "Matthew B", driverId: "Logist#75327", location: "Onisha", status: "Completed" },
  { id: 3, vehicle: "Logist#24367", driver: "Matthew B", driverId: "Logist#75327", location: "Onisha", status: "Delayed" },
];

const LiveTrips = () => {
  const [active, setActive] = useState(trips[0]);

  return (
    <div>
      <PageHeader
        title="Live Trips & Tracking"
        subtitle="Monitor active drivers and deliveries in real time with instant location updates."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5">
          <input
            placeholder="Search by Driver name, Vehicle ID"
            className="h-9 w-full px-3 rounded-md border border-border bg-background text-sm mb-4"
          />
          <h3 className="font-semibold mb-3">All Drivers</h3>
          <div className="space-y-3">
            {trips.map((t) => (
              <div key={t.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar><AvatarImage src={`https://i.pravatar.cc/40?img=${t.id + 10}`} /><AvatarFallback>M</AvatarFallback></Avatar>
                    <div>
                      <p className="text-warning text-xs font-medium">Vehicle ID {t.vehicle}</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs">
                        <div><p className="text-muted-foreground">Driver's Name</p><p className="font-medium text-sm">{t.driver}</p></div>
                        <div><p className="text-muted-foreground">Driver's ID Number</p><p className="font-medium text-sm">{t.driverId}</p></div>
                        <div><p className="text-muted-foreground">Current Location</p><p className="font-medium text-sm">{t.location}</p></div>
                        <div><p className="text-muted-foreground">Status Badge</p><StatusBadge status={t.status} /></div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setActive(t)} className="w-full mt-3">View Trip</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="grid grid-cols-3 gap-3 p-4 text-xs border-b border-border">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /><div><p className="text-muted-foreground">Current Location</p><p className="font-medium">{active.location}</p></div></div>
            <div className="flex items-center gap-2"><Navigation className="h-4 w-4 text-accent" /><div><p className="text-muted-foreground">Distance</p><p className="font-medium">120/280 mi</p></div></div>
            <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-accent" /><div><p className="text-muted-foreground">Current Speed</p><p className="font-medium">76 mph</p></div></div>
          </div>
          <div className="flex-1 min-h-[300px] bg-muted relative">
            <iframe
              title="map"
              className="w-full h-full min-h-[300px] border-0"
              src="https://www.openstreetmap.org/export/embed.html?bbox=3.3,6.4,3.5,6.6&layer=mapnik"
            />
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-4 text-xs border-b border-border pb-2 mb-3">
              <span className="font-medium border-b-2 border-primary pb-1">Trip information</span>
              <span className="text-muted-foreground">Driver's information</span>
              <span className="text-muted-foreground">Customer information</span>
              <span className="text-muted-foreground">Activity Timeline</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div><p className="text-muted-foreground">Pickup location</p><p className="font-medium">Onisha</p></div>
              <div><p className="text-muted-foreground">Drop off location</p><p className="font-medium">Onisha</p></div>
              <div><p className="text-muted-foreground">Start time</p><p className="font-medium">12:00 pm</p></div>
              <div><p className="text-muted-foreground">ETA</p><p className="font-medium">14:30 (25 mins remaining)</p></div>
              <div><p className="text-muted-foreground">Distance remaining</p><p className="font-medium">25 mins remaining</p></div>
              <div><p className="text-muted-foreground">Customer ID</p><p className="font-medium">Logist#12345</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrips;