import { cn } from "@/lib/utils";

type Status =
  | "Completed"
  | "Failed"
  | "Pending"
  | "Successful"
  | "Active"
  | "Available"
  | "Suspended"
  | "Deactivate"
  | "Deactivated"
  | "offline"
  | "Offline"
  | "Inactive"
  | "Assigned"
  | "Cancelled"
  | "Rejected"
  | "Delayed";

const map: Record<string, string> = {
  Completed: "bg-success/15 text-success",
  Successful: "bg-success/15 text-success",
  Active: "bg-success/15 text-success",
  Available: "bg-success/15 text-success",
  Assigned: "bg-success/15 text-success",
  Pending: "bg-warning/15 text-warning",
  Delayed: "bg-warning/15 text-warning",
  Failed: "bg-destructive/15 text-destructive",
  Suspended: "bg-warning/15 text-warning",
  Deactivate: "bg-destructive/15 text-destructive",
  Deactivated: "bg-destructive/15 text-destructive",
  Cancelled: "bg-destructive/15 text-destructive",
  Rejected: "bg-destructive/15 text-destructive",
  Inactive: "bg-muted text-muted-foreground",
  offline: "bg-muted text-muted-foreground",
  Offline: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = map[status] ?? "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium", cls)}>
      {status}
    </span>
  );
}