import { type LucideIcon } from "lucide-react";

export function IconTile({ Icon, tone = "soft" }: { Icon: LucideIcon; tone?: "soft" | "white" }) {
  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${
        tone === "white" ? "bg-white text-brand" : "bg-brand-soft text-brand"
      }`}
    >
      <Icon size={20} />
    </span>
  );
}