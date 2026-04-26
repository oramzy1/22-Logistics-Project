import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Bell, CheckCheck, BookOpen, User, Truck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminNotification {
  id: string;
  type: "new_booking" | "new_user" | "license_submitted" | "payment" | "driver_online";
  title: string;
  body: string;
  link: string;        // route to navigate to
  linkId?: string;     // entity id to highlight
  read: boolean;
  createdAt: Date;
}

interface NotificationsSheetProps {
  notifications: AdminNotification[];
  open: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onRead: (id: string) => void;
}

const icons: Record<AdminNotification["type"], typeof Bell> = {
  new_booking:        BookOpen,
  new_user:           User,
  license_submitted:  Truck,
  payment:            CreditCard,
  driver_online:      Truck,
};

const iconColors: Record<AdminNotification["type"], string> = {
  new_booking:        "text-warning bg-warning/10",
  new_user:           "text-accent bg-accent/10",
  license_submitted:  "text-blue-500 bg-blue-500/10",
  payment:            "text-success bg-success/10",
  driver_online:      "text-success bg-success/10",
};

export function NotificationsSheet({
  notifications, open, onClose, onMarkAllRead, onRead,
}: NotificationsSheetProps) {
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;

  const handleClick = (n: AdminNotification) => {
    onRead(n.id);
    onClose();
    // Navigate with state so the target page can highlight the item
    navigate(n.link, { state: { highlightId: n.linkId } });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between pr-6">
            <SheetTitle>Notifications {unread > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">({unread} unread)</span>}</SheetTitle>
            {unread > 0 && (
              <button onClick={onMarkAllRead} className="text-xs text-accent hover:underline flex items-center gap-1">
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="h-8 w-8 mb-3 opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : notifications.map(n => {
            const Icon = icons[n.type];
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted/60",
                  !n.read && "bg-accent/5 border border-accent/20"
                )}
              >
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", iconColors[n.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-accent shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}