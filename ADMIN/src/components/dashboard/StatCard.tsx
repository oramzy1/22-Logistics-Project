import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  hintTone?: "success" | "warning" | "destructive" | "muted";
  icon?: LucideIcon;
  iconBg?: string;
}

export function StatCard({
  label,
  value,
  hint,
  hintTone = "success",
  icon: Icon,
  iconBg = "bg-warning/15 text-warning",
}: StatCardProps) {
  const toneClass = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
  }[hintTone];
  return (
    <div className="bg-surface text-surface-foreground rounded-xl p-4 border border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", iconBg)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {hint && <p className={cn("text-xs mt-2", toneClass)}>{hint}</p>}
    </div>
  );
}