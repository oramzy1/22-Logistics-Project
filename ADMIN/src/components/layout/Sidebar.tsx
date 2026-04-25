import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Truck,
  MapPin,
  Users,
  CreditCard,
  LifeBuoy,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { label: "Booking Management", to: "/bookings", icon: CalendarCheck },
  { label: "Drivers Management", to: "/drivers", icon: Truck },
  { label: "Live Trips & Tracking", to: "/live-trips", icon: MapPin },
  { label: "Users Management", to: "/users", icon: Users },
  { label: "Payment", to: "/payment", icon: CreditCard },
  { label: "Support", to: "/support", icon: LifeBuoy },
  { label: "Settings", to: "/settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-warning flex items-center justify-center text-warning-foreground font-bold text-sm">
              ZZ
            </div>
            <span className="font-semibold text-sidebar-accent-foreground">
              ZZ Logistics
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground hover:text-sidebar-accent-foreground"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5 text-xs uppercase tracking-wider text-sidebar-foreground/60">
          Admin Panel
        </div>

        <nav className="px-3 space-y-1 overflow-y-auto h-[calc(100vh-7rem)] pb-6">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}