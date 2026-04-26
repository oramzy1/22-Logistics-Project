import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSetUserStatus, useDeleteUser, useUpdateUserRole } from "@/hooks/useAdminData";
import { toast } from "sonner";

interface UserDetailSheetProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

export function UserDetailSheet({ userId, open, onClose }: UserDetailSheetProps) {
  const [showAllBookings, setShowAllBookings] = useState(false);
  const setStatus = useSetUserStatus();
  const deleteUser = useDeleteUser();
  const updateRole = useUpdateUserRole();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user-detail", userId],
    queryFn: () => api.get<any>(`/admin/users/${userId}`),
    enabled: !!userId && open,
  });

  // Recent bookings — 3 initially
  const { data: bookingsData } = useQuery({
    queryKey: ["user-bookings", userId, showAllBookings],
    queryFn: () => api.get<any>(`/admin/bookings?customerId=${userId}&limit=${showAllBookings ? 50 : 3}`),
    enabled: !!userId && open,
  });

  const bookings = bookingsData?.bookings ?? [];

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : user ? (
          <div className="mt-4 space-y-6">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl ?? user.businessProfile?.logoUrl} />
                <AvatarFallback className="text-lg">{user.name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <StatusBadge status={user.isActive ? "Active" : "Inactive"} />
                  <StatusBadge status={user.role} />
                  {user.isVerified && <span className="text-xs text-success">✓ Verified</span>}
                </div>
              </div>
            </div>

            {/* Personal details */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <Field label="Phone" value={user.phone ?? "—"} />
              <Field label="Auth Provider" value={user.authProvider} />
              <Field label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
              <Field label="Total Bookings" value={String(user._count?.bookingsAsCustomer ?? 0)} />
            </div>

            {/* Business profile if exists */}
            {user.businessProfile && (
              <div className="bg-muted/40 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Business Profile</p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <Field label="Company" value={user.businessProfile.companyName} />
                  <Field label="Company Email" value={user.businessProfile.companyEmail} />
                  <Field label="Company Phone" value={user.businessProfile.companyPhone} />
                  <Field label="Address" value={user.businessProfile.companyAddress} />
                  {user.businessProfile.cacNumber && (
                    <Field label="CAC Number" value={user.businessProfile.cacNumber} />
                  )}
                  {user.businessProfile.department && (
                    <Field label="Department" value={user.businessProfile.department} />
                  )}
                </div>
              </div>
            )}

            {/* Recent bookings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recent Bookings
                </p>
                {!showAllBookings && (bookingsData?.total ?? 0) > 3 && (
                  <button
                    onClick={() => setShowAllBookings(true)}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    View all {bookingsData?.total} <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>

              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet</p>
              ) : (
                <div className="space-y-2">
                  {bookings.map((b: any) => (
                    <div key={b.id} className="border border-border rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {b.trackingId ?? b.id.slice(0, 8)}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="font-medium">{b.packageType ?? "—"}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-muted-foreground text-xs">{new Date(b.createdAt).toLocaleDateString()}</span>
                        <span className="font-medium">₦{b.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-border pt-4 space-y-2">
              {user.role !== "ADMIN" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => updateRole.mutate(
                    { id: user.id, role: "ADMIN" },
                    { onSuccess: () => { toast.success("Upgraded to admin"); onClose(); } }
                  )}
                  disabled={updateRole.isPending}
                >
                  Upgrade to Admin
                </Button>
              )}
              <div className="flex gap-2">
                {user.isActive ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-warning border-warning/40"
                    onClick={() => setStatus.mutate(
                      { id: user.id, isActive: false },
                      { onSuccess: () => { toast.success("User deactivated"); onClose(); } }
                    )}
                    disabled={setStatus.isPending}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setStatus.mutate(
                      { id: user.id, isActive: true },
                      { onSuccess: () => { toast.success("User reactivated"); onClose(); } }
                    )}
                    disabled={setStatus.isPending}
                  >
                    Reactivate
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => deleteUser.mutate(
                    user.id,
                    { onSuccess: () => { toast.success("User deleted"); onClose(); } }
                  )}
                  disabled={deleteUser.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium truncate">{value}</p>
  </div>
);