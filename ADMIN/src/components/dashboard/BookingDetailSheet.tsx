import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Car, Loader2, MapPin, Clock, Package, CreditCard } from "lucide-react";
import { useAssignDriver, useBookings } from "@/hooks/useAdminData";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface BookingDetailSheetProps {
  booking: any | null;
  open: boolean;
  onClose: () => void;
}

export function BookingDetailSheet({ booking: b, open, onClose }: BookingDetailSheetProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("");
  const assign = useAssignDriver();

  const { data: availableDrivers } = useQuery({
    queryKey: ["available-drivers"],
    queryFn: () => api.get<any>("/admin/drivers/available"),
    enabled: assignOpen,
  });

  if (!b) return null;

  const canAssign = ["AWAITING_DRIVER"].includes(b.status) && b.paymentStatus === "PAID";

  const handleAssign = () => {
    if (!selectedDriver) return;
    assign.mutate(
      { bookingId: b.id, driverProfileId: selectedDriver },
      {
        onSuccess: () => {
          toast.success("Driver assigned successfully");
          setAssignOpen(false);
          setSelectedDriver("");
          onClose();
        },
        onError: (e: any) => toast.error(e.message ?? "Assignment failed"),
      }
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Booking Details</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-sm text-muted-foreground">{b.trackingId ?? b.id.slice(0, 8)}</p>
                <div className="flex gap-2 mt-1">
                  <StatusBadge status={b.status} />
                  <StatusBadge status={b.paymentStatus} />
                </div>
              </div>
              <p className="text-xl font-bold">₦{b.totalAmount?.toLocaleString()}</p>
            </div>

            {/* Customer */}
            <div className="bg-muted/40 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={b.customer?.avatarUrl} />
                  <AvatarFallback>{b.customer?.name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{b.customer?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{b.customer?.email} · {b.rideType}</p>
                </div>
              </div>
            </div>

            {/* Driver if assigned */}
            {b.driver && (
              <div className="bg-muted/40 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned Driver</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={b.driver?.avatarUrl} />
                    <AvatarFallback>{b.driver?.name?.[0] ?? "D"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{b.driver?.name}</p>
                    <p className="text-xs text-muted-foreground">{b.driver?.phone}</p>
                    {b.driver?.driverProfile && (
                      <p className="text-xs text-muted-foreground">
                        {b.driver.driverProfile.brandModel} · {b.driver.driverProfile.plateNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Trip details */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Trip Details</p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="font-medium">{b.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Drop-off</p>
                    <p className="font-medium">{b.dropoffAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail icon={Package} label="Package" value={b.packageType ?? "—"} />
              <Detail icon={Clock} label="Scheduled" value={b.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : "—"} />
              <Detail icon={CreditCard} label="Payment ref" value={b.paymentRef?.slice(-8) ?? "—"} />
              <Detail icon={Clock} label="Booked at" value={new Date(b.createdAt).toLocaleString()} />
            </div>

            {b.addOns?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Add-ons</p>
                <div className="flex flex-wrap gap-1">
                  {b.addOns.map((a: string) => (
                    <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {b.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{b.notes}</p>
              </div>
            )}

            {b.cancellationReason && (
              <div className="bg-destructive/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Cancellation reason</p>
                <p className="text-sm">{b.cancellationReason}</p>
              </div>
            )}

            {/* Assign driver button */}
            {canAssign && (
              <Button className="w-full gap-2" onClick={() => setAssignOpen(true)}>
                <Car className="h-4 w-4" /> Assign Driver
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Assign driver dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver to Booking</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">Select an available driver:</p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {!availableDrivers || availableDrivers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No available drivers online</p>
              ) : availableDrivers.map((d: any) => (
                <label
                  key={d.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDriver === d.id ? "border-accent bg-accent/10" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="driver"
                    value={d.id}
                    checked={selectedDriver === d.id}
                    onChange={() => setSelectedDriver(d.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={d.user?.avatarUrl} />
                    <AvatarFallback>{d.user?.name?.[0] ?? "D"}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{d.user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.brandModel ?? "No vehicle"} · ★ {d.rating?.toFixed(1) ?? "—"} · {d.totalTrips} trips
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedDriver || assign.isPending}>
              {assign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const Detail = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex gap-2">
    <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-xs">{value}</p>
    </div>
  </div>
);