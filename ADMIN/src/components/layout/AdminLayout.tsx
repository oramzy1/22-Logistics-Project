import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topnav } from "./Topnav";
import { useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/lib/api";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { NotificationsSheet } from "@/components/dashboard/NotificationsSheet";
import { useAdminNotifications } from "@/lib/useAdminNotifications";

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
   const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
   const { notifications, push, markRead, markAllRead, unreadCount } = useAdminNotifications();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:5000';
    const socket = io(BASE, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Join admin channel with JWT verification
      socket.emit('join_admin', token);
    });

    socket.on('admin:joined', () => {
      console.log('✅ Admin socket channel joined');
    });

    // ── New booking notification ──────────────────────────────
    socket.on('admin:new_booking', (payload: any) => {
      // Invalidate relevant queries so tables refresh automatically
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['charts'] });

       push({
        type: 'new_booking',
        title: 'New booking received',
        body: `₦${payload.amount?.toLocaleString()} · ${payload.rideType}${payload.customerName ? ` from ${payload.customerName}` : ''}`,
        link: '/bookings',
        linkId: payload.bookingId,
      });

      toast(
        `New booking — ₦${payload.amount?.toLocaleString()} · ${payload.rideType}`,
        {
          description: payload.customerName
            ? `From ${payload.customerName}`
            : 'A customer just placed a booking',
          duration: 8000,
          action: {
            label: 'View',
            // onClick: () => window.location.href = '/bookings',
            onClick: () => setNotifOpen(true)
          },
        }
      );
    });

    // ── Driver status changes ────────────────────────────────
    socket.on('admin:driver_online', (payload: any) => {
      qc.invalidateQueries({ queryKey: ['drivers'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      push({
        type: 'driver_online',
        title: 'Driver came online',
        body: 'A driver is now available for assignments',
        link: '/drivers',
        linkId: payload.driverProfileId,
      });
    });

    socket.on('admin:driver_offline', () => {
      qc.invalidateQueries({ queryKey: ['drivers'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // ── License submitted ────────────────────────────────────
    socket.on('admin:license_submitted', (payload: any) => {
      qc.invalidateQueries({ queryKey: ['drivers'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
       push({
        type: 'license_submitted',
        title: 'License review needed',
        body: 'A driver submitted a license for verification',
        link: '/drivers',
        linkId: payload.driverId,
      });
      toast('License review needed', {
        description: 'A driver submitted a license for verification',
        duration: 6000,
        action: {
          label: 'Review',
          // onClick: () => window.location.href = '/drivers',
          onClick: () => setNotifOpen(true)
        },
      });
    });

    // ── New user registered ──────────────────────────────────
    socket.on('admin:user_registered', (payload: any) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      push({
        type: 'new_user',
        title: 'New user registered',
        body: `A new ${payload.role?.toLowerCase() ?? 'user'} account was created`,
        link: '/users',
        linkId: payload.userId,
      });
    });

    // ── Payment received ─────────────────────────────────────
    socket.on('admin:payment_received', (payload: any) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['charts'] });
      push({
        type: 'payment',
        title: 'Payment received',
        body: `₦${payload.amount?.toLocaleString()} payment confirmed`,
        link: '/payment',
        linkId: payload.bookingId,
      });
    }); 
    socket.on('admin:error', (err: any) => {
      console.warn('Admin socket error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [qc, push]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={open} onClose={() => setOpen(false)} />
        <Topnav
        onMenuClick={() => setOpen(true)}
        unreadCount={unreadCount}
        onNotifClick={() => setNotifOpen(true)}
      />
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
       <NotificationsSheet
        notifications={notifications}
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onMarkAllRead={markAllRead}
        onRead={markRead}
      />
    </div>
  );
}