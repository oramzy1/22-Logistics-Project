// admin/src/pages/LiveTrips.tsx — full replacement logic:
import { useState, useEffect } from "react";
import { MapPin, Gauge, Navigation, Phone, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const TABS = ["Trip information", "Driver's information", "Customer information", "Activity Timeline"];

// Geocode address → lat/lng using Nominatim (free, no key needed)
async function geocode(address: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Nigeria')}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

const LiveTrips = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapSrc, setMapSrc] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    fetchTrips();
    const interval = setInterval(fetchTrips, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!active) return;
    buildMapUrl(active);
  }, [active?.id]);

const fetchTrips = async () => {
  try {
    // Fetch ACCEPTED and IN_PROGRESS separately then merge
    const [accepted, inProgress] = await Promise.all([
      api.get<any>("/admin/bookings", { status: "ACCEPTED", limit: "50" }),
      api.get<any>("/admin/bookings", { status: "IN_PROGRESS", limit: "50" }),
    ]);
    const list = [
      ...(accepted?.bookings ?? []),
      ...(inProgress?.bookings ?? []),
    ];
    setTrips(list);
    if (list.length > 0 && !active) setActive(list[0]);
  } catch (err) {
    console.error("Failed to fetch live trips:", err);
  } finally {
    setLoading(false);
  }
};
  const buildMapUrl = async (trip: any) => {
    setGeocoding(true);
    try {
      const pickup = await geocode(trip.pickupAddress);
      const dropoff = await geocode(trip.dropoffAddress);

      if (pickup && dropoff) {
        const [lat1, lon1] = pickup;
        const [lat2, lon2] = dropoff;
        const minLat = Math.min(lat1, lat2) - 0.01;
        const maxLat = Math.max(lat1, lat2) + 0.01;
        const minLon = Math.min(lon1, lon2) - 0.01;
        const maxLon = Math.max(lon1, lon2) + 0.01;
        setMapSrc(
          `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${lat1},${lon1}`
        );
      } else if (pickup) {
        const [lat, lon] = pickup;
        setMapSrc(
          `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05},${lat - 0.05},${lon + 0.05},${lat + 0.05}&layer=mapnik&marker=${lat},${lon}`
        );
      } else {
        // Fallback to Port Harcourt
        setMapSrc("https://www.openstreetmap.org/export/embed.html?bbox=6.95,4.75,7.1,4.9&layer=mapnik");
      }
    } finally {
      setGeocoding(false);
    }
  };

  const filtered = trips.filter(t =>
    !search ||
    t.driver?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.trackingId?.toLowerCase().includes(search.toLowerCase())
  );

  const scheduledTime = active?.scheduledAt
    ? new Date(active.scheduledAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div>
      <PageHeader
        title="Live Trips & Tracking"
        subtitle="Monitor active drivers and deliveries in real time with instant location updates."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Trip List */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <input
            placeholder="Search by Driver name, Vehicle ID"
            className="h-9 w-full px-3 rounded-md border border-border bg-background text-sm mb-4"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <h3 className="font-semibold mb-3">
            All Drivers
            {!loading && <span className="text-xs text-muted-foreground font-normal ml-2">({filtered.length} active)</span>}
          </h3>

          {loading && (
            <div className="text-center py-10 text-muted-foreground text-sm">Loading trips...</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">No active trips right now</div>
          )}

          <div className="space-y-3">
            {filtered.map((t) => (
              <div key={t.id} className={cn(
                "border rounded-lg p-4 transition-colors",
                active?.id === t.id ? "border-accent bg-accent/5" : "border-border"
              )}>
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={t.driver?.avatarUrl} />
                    <AvatarFallback>{t.driver?.name?.charAt(0) ?? "D"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-warning text-xs font-medium">Vehicle ID {t.trackingId ?? t.id.slice(0, 8)}</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Driver's Name</p>
                        <p className="font-medium text-sm">{t.driver?.name ?? "Unassigned"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Driver's ID</p>
                        <p className="font-medium text-sm">{t.trackingId ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pickup</p>
                        <p className="font-medium text-sm truncate max-w-[120px]">{t.pickupAddress}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <StatusBadge status={t.status} />
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setActive(t)} className="w-full mt-3" size="sm">
                  View Trip
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Map + Details */}
        {active ? (
          <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col">
            {/* Map Stats Bar */}
            <div className="grid grid-cols-3 gap-3 p-4 text-xs border-b border-border">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-muted-foreground">Pickup</p>
                  <p className="font-medium truncate max-w-[80px]">{active.pickupAddress?.split(",")[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-muted-foreground">Package</p>
                  <p className="font-medium">{active.packageType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">₦{active.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="flex-1 min-h-[280px] bg-muted relative">
              {geocoding && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10 text-sm text-muted-foreground">
                  Loading map...
                </div>
              )}
              {mapSrc && (
                <iframe
                  key={mapSrc}
                  title="map"
                  className="w-full h-full min-h-[280px] border-0"
                  src={mapSrc}
                />
              )}
            </div>

            {/* Tabs */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-4 text-xs border-b border-border pb-2 mb-3 overflow-x-auto">
                {TABS.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setTab(i)}
                    className={cn(
                      "whitespace-nowrap pb-1 shrink-0 transition-colors",
                      tab === i
                        ? "font-semibold border-b-2 border-primary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Tab 0: Trip Info */}
              {tab === 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><p className="text-muted-foreground">Pickup location</p><p className="font-medium">{active.pickupAddress}</p></div>
                  <div><p className="text-muted-foreground">Drop off location</p><p className="font-medium">{active.dropoffAddress}</p></div>
                  <div><p className="text-muted-foreground">Scheduled Time</p><p className="font-medium">{scheduledTime}</p></div>
                  <div><p className="text-muted-foreground">Package</p><p className="font-medium">{active.packageType}</p></div>
                  <div><p className="text-muted-foreground">Add Ons</p><p className="font-medium">{active.addOns?.join(", ") || "None"}</p></div>
                  <div><p className="text-muted-foreground">Total Amount</p><p className="font-medium">₦{active.totalAmount?.toLocaleString()}</p></div>
                  <div><p className="text-muted-foreground">Ride Type</p><p className="font-medium">{active.rideType}</p></div>
                  <div><p className="text-muted-foreground">Status</p><StatusBadge status={active.status} /></div>
                  <div><p className="text-muted-foreground">Tracking ID</p><p className="font-medium">{active.trackingId}</p></div>
                </div>
              )}

              {/* Tab 1: Driver Info */}
              {tab === 1 && (
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={active.driver?.avatarUrl} />
                    <AvatarFallback>{active.driver?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid grid-cols-2 gap-3 text-xs flex-1">
                    <div><p className="text-muted-foreground">Name</p><p className="font-medium">{active.driver?.name ?? "—"}</p></div>
                    <div><p className="text-muted-foreground">Role</p><p className="font-medium">Driver</p></div>
                    <div><p className="text-muted-foreground">Fuel Purchased</p><p className="font-medium">₦{active.totalAmount?.toLocaleString()}</p></div>
                    <div><p className="text-muted-foreground">Vehicle ID</p><p className="font-medium">{active.trackingId ?? "—"}</p></div>
                    <div><p className="text-muted-foreground">Plate Number</p><p className="font-medium">{active.driver?.driverProfile?.plateNumber ?? "—"}</p></div>
                    <div><p className="text-muted-foreground">Vehicle</p><p className="font-medium">{active.driver?.driverProfile?.brandModel ?? "—"}</p></div>
                    <div><p className="text-muted-foreground">Current Status</p><StatusBadge status={active.status} /></div>
                    <div className="flex gap-2 mt-1">
                      <a href={`tel:${active.driver?.phone}`} className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-md">
                        <Phone className="h-3 w-3" /> Call
                      </a>
                      <button className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                        <MessageSquare className="h-3 w-3" /> Chat
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Customer Info */}
              {tab === 2 && (
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={active.customer?.avatarUrl} />
                    <AvatarFallback>{active.customer?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid grid-cols-2 gap-3 text-xs flex-1">
                    <div><p className="text-muted-foreground">Name</p><p className="font-medium">{active.customer?.name ?? "—"}</p></div>
                    <div><p className="text-muted-foreground">Role</p><p className="font-medium">Customer</p></div>
                    <div><p className="text-muted-foreground">Trip Type</p><p className="font-medium">{active.packageType}</p></div>
                    <div><p className="text-muted-foreground">Customer ID</p><p className="font-medium">{active.trackingId ?? "—"}</p></div>
                    <div><p className="text-muted-foreground">Email</p><p className="font-medium">{active.customer?.email ?? "—"}</p></div>
                    <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{active.customer?.phone ?? "—"}</p></div>
                    <div className="flex gap-2 mt-1">
                      <a href={`tel:${active.customer?.phone}`} className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-md">
                        <Phone className="h-3 w-3" /> Call
                      </a>
                      <button className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                        <MessageSquare className="h-3 w-3" /> Chat
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Activity Timeline */}
              {tab === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs mb-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={active.driver?.avatarUrl} />
                      <AvatarFallback>{active.driver?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{active.driver?.name}</p>
                      <p className="text-muted-foreground">Driver</p>
                    </div>
                  </div>
                  {[
                    { label: "Trip accepted", done: ["ACCEPTED","IN_PROGRESS","COMPLETED"].includes(active.status) },
                    { label: "Arrived pickup", done: ["IN_PROGRESS","COMPLETED"].includes(active.status) },
                    { label: "Onboarded", done: ["IN_PROGRESS","COMPLETED"].includes(active.status) },
                    { label: "En route", done: active.status === "IN_PROGRESS" || active.status === "COMPLETED" },
                    { label: "Delivered", done: active.status === "COMPLETED" },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        done ? "bg-green-500" : "bg-muted-foreground/30"
                      )} />
                      <span className={cn("text-xs", done ? "text-foreground font-medium" : "text-muted-foreground")}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border flex items-center justify-center min-h-[400px] text-muted-foreground text-sm">
            Select a trip to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTrips;