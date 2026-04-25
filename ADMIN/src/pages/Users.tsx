import { useState } from "react";
import { MoreHorizontal, Download, Building2, User } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const users = [
  { id: "Logist-001", contact: "Matthew B", business: "Sawga Ltd", status: "Active", amount: "₦1,250,000" },
  { id: "Logist-002", contact: "Timothy O", business: "Proma Ltd", status: "Inactive", amount: "₦890,000" },
  { id: "Logist-003", contact: "David L", business: "Loma Ltd", status: "Suspended", amount: "₦80,000" },
  { id: "Logist-004", contact: "Israel K", business: "2Face Ltd", status: "Deactivated", amount: "₦0,000" },
  { id: "Logist-005", contact: "Tina B", business: "Juris Ltd", status: "Inactive", amount: "₦790,000" },
  { id: "Logist-006", contact: "Faith A", business: "Proffes Ltd", status: "Active", amount: "₦18,000" },
  { id: "Logist-006", contact: "Bimbo F", business: "Comf Ltd", status: "Active", amount: "₦90,000" },
  { id: "Logist-005", contact: "Ade A", business: "Icon Ltd", status: "Deactivated", amount: "₦60,000" },
];

const Users = () => {
  const [tab, setTab] = useState<"Business" | "Individual">("Business");
  return (
    <div>
      <PageHeader title="Users Management" subtitle="Manage individual and Business users" />

      <div className="flex gap-2 mb-4">
        {(["Business", "Individual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm border",
              tab === t ? "bg-accent/10 text-accent border-accent" : "bg-surface text-muted-foreground border-border"
            )}
          >
            {t === "Business" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
            {t}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <input placeholder={`Search ${tab}`} className="h-9 px-3 rounded-md border border-border bg-background text-sm flex-1" />
          <select className="h-9 px-3 rounded-md border border-border bg-background text-sm"><option>Date</option></select>
          <select className="h-9 px-3 rounded-md border border-border bg-background text-sm"><option>All Status</option></select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">{tab} ({users.length})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Active (2)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> Inactive (1)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Suspended (0)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Deactivated (1)</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-accent/10">
                <th className="py-3 px-3"><input type="checkbox" /></th>
                <th className="py-3 font-medium">{tab === "Business" ? "Business ID" : "User ID"}</th>
                <th className="py-3 font-medium">Contact Person</th>
                {tab === "Business" && <th className="py-3 font-medium">Business Name</th>}
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-b border-border/60 last:border-0">
                  <td className="py-3 px-3"><input type="checkbox" /></td>
                  <td className="py-3">{u.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7"><AvatarImage src={`https://i.pravatar.cc/40?img=${i + 20}`} /><AvatarFallback>{u.contact[0]}</AvatarFallback></Avatar>
                      {u.contact}
                    </div>
                  </td>
                  {tab === "Business" && <td className="py-3 text-muted-foreground">{u.business}</td>}
                  <td className="py-3"><StatusBadge status={u.status} /></td>
                  <td className="py-3">{u.amount}</td>
                  <td className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 rounded hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>View Invoice</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm">
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

export default Users;