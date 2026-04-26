import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Download,
  Building2,
  User,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  useUsers,
  useSetUserStatus,
  useDeleteUser,
  useUpdateUserRole,
} from "@/hooks/useAdminData";
import { toast } from "sonner";
import { UserDetailSheet } from "@/components/dashboard/UserDetailSheet";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { useLocation } from "react-router-dom";
import { exportCSV } from "@/lib/export";


const Users = () => {
  const [tab, setTab] = useState<"BUSINESS" | "INDIVIDUAL">("BUSINESS");
  const location = useLocation();
  const [params, setParams] = useState<Record<string, string>>({
    page: "1",
    limit: "20",
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data, isLoading } = useUsers({ ...params, role: tab });
  const setStatus = useSetUserStatus();
  const deleteUser = useDeleteUser();
  const updateRole = useUpdateUserRole();

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const currentPage = parseInt(params.page);
  const limit = parseInt(params.limit);
  const totalPages = Math.ceil(total / limit);

  const activeCount = users.filter((u: any) => u.isActive).length;
  const inactiveCount = users.filter((u: any) => !u.isActive).length;
  useEffect(() => {
  const id = location.state?.highlightId;
  if (id) { setSelectedUserId(id); window.history.replaceState({}, ""); }
}, [location.state?.highlightId]);

const handleExport = () =>
  exportCSV(`users_${tab.toLowerCase()}`, ["Name","Email","Phone","Role","Bookings","Status","Joined"],
    users.map((u: any) => [u.name, u.email, u.phone, u.role, u._count?.bookingsAsCustomer ?? 0, u.isActive ? "Active" : "Deactivated", new Date(u.createdAt).toLocaleDateString()]));


  return (
    <div>
      <PageHeader
        title="Users Management"
        subtitle="Manage Individual and Business users"
      />

      <div className="flex gap-2 mb-4">
        {(
          [
            ["BUSINESS", "Business"],
            ["INDIVIDUAL", "Individual"],
          ] as const
        ).map(([val, label]) => (
          <button
            key={val}
            onClick={() => {
              setTab(val);
              setParams((p) => ({ ...p, page: "1" }));
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm border",
              tab === val
                ? "bg-accent/10 text-accent border-accent"
                : "bg-surface text-muted-foreground border-border",
            )}
          >
            {val === "BUSINESS" ? (
              <Building2 className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
            {label}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <input
            placeholder={`Search ${tab === "BUSINESS" ? "businesses" : "users"}...`}
            className="h-9 px-3 rounded-md border border-border bg-background text-sm flex-1"
            onChange={(e) =>
              setParams((p) => ({ ...p, search: e.target.value, page: "1" }))
            }
          />
          <DateRangeFilter
  onChange={(from, to) => setParams(p => ({ ...p, dateFrom: from, dateTo: to, page: '1' }))}
/>
          <select
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
            onChange={(e) =>
              setParams((p) => ({ ...p, isActive: e.target.value, page: "1" }))
            }
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Deactivated</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">
              {tab === "BUSINESS" ? "Business" : "Individual"} ({total})
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success" /> Active (
              {activeCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-destructive" />{" "}
              Deactivated ({inactiveCount})
            </span>
            {/* <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Suspended (0)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Deactivated (1)</span> */}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-accent/10">
                <th className="py-3 px-3">
                  <input type="checkbox" />
                </th>
                <th className="py-3 font-medium">Contact Person</th>
                {tab === "BUSINESS" && (
                  <th className="py-3 font-medium">Business Name</th>
                )}
                <th className="py-3 font-medium">Email</th>
                <th className="py-3 font-medium">Bookings</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Joined</th>
                <th className="py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-muted-foreground text-sm"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u: any, i: number) => (
                  <tr
                    key={u.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3 px-3">
                      <input type="checkbox" />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={u.avatarUrl ?? u.businessProfile?.logoUrl}
                          />
                          <AvatarFallback>{u.name?.[0] ?? "?"}</AvatarFallback>
                        </Avatar>
                        <div className={`${u.isActive ? "" : "line-through text-muted-foreground"}`}>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.phone ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {tab === "BUSINESS" && (
                      <td className="py-3 text-muted-foreground">
                        {u.businessProfile?.companyName ?? "—"}
                      </td>
                    )}
                    <td className="py-3 text-muted-foreground text-xs">
                      {u.email}
                    </td>
                    <td className="py-3">
                      {u._count?.bookingsAsCustomer ?? 0}
                    </td>
                    <td className="py-3">
                      <StatusBadge
                        status={u.isActive ? "Active" : "Deactivated"}
                      />
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedUserId(u.id)}
                          >
                            View Details
                          </DropdownMenuItem>
                          {u.role !== "ADMIN" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateRole.mutate(
                                  { id: u.id, role: "ADMIN" },
                                  {
                                    onSuccess: () =>
                                      toast.success("Upgraded to admin"),
                                  },
                                )
                              }
                            >
                              Upgrade to Admin
                            </DropdownMenuItem>
                          )}
                          {u.isActive ? (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                setStatus.mutate(
                                  { id: u.id, isActive: false },
                                  {
                                    onSuccess: () =>
                                      toast.success("User deactivated"),
                                  },
                                )
                              }
                            >
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                setStatus.mutate(
                                  { id: u.id, isActive: true },
                                  {
                                    onSuccess: () =>
                                      toast.success("User reactivated"),
                                  },
                                )
                              }
                            >
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              deleteUser.mutate(u.id, {
                                onSuccess: () => toast.success("User deleted"),
                              })
                            }
                          >
                            Delete Account
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

        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm">
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
              <ArrowRight className="h-3 w-3 rotate-180" />
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
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      <UserDetailSheet
        userId={selectedUserId}
        open={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
};

export default Users;
