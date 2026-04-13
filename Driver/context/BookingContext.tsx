// Driver/context/BookingContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BookingService, BookingPayload } from "../api/booking.service";

export type BookingStatus =
  | "PENDING"
  | "AWAITING_DRIVER"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type TripExtension = {
  id: string;
  bookingId: string;
  hours: number;
  amount: number;
  paymentRef: string;
  paymentStatus: 'UNPAID' | 'PAID';
  paystackAccessCode?: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledAt: string;
  packageType: string;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: "UNPAID" | "PAID";
  paymentRef: string;
  duration?: number;
  notes?: string;
  driver?: {
    name: string;
    phone: string;
    avatarUrl?: string;
  } | null;
  extensions?: TripExtension[];
  _count?: {
    extensions: number;
  };
  createdAt: string;
};

type BookingContextType = {
  bookings: Booking[];
  activeBookings: Booking[];
  isLoading: boolean;
  error: string | null;
  patchBooking: (booking: Booking) => void;
  fetchBookings: () => Promise<void>;
  createBooking: (payload: BookingPayload) => Promise<{
    booking: Booking;
    payment: {
      authorizationUrl: string;
      accessCode: string;
      reference: string;
    };
  }>;
  cancelBooking: (id: string) => Promise<void>;
  verifyPayment: (reference: string) => Promise<void>;
  reinitializeBooking: (bookingId: string, channel: 'card' | 'bank_transfer') => Promise<{
  authorizationUrl: string;
  reference: string;
}>;
};

const BookingContext = createContext<BookingContextType>(
  {} as BookingContextType
);

const ACTIVE_STATUSES: BookingStatus[] = ["AWAITING_DRIVER", "IN_PROGRESS"];

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await BookingService.getAll();
      setBookings(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, []);

   useEffect(() => {
  const { socketService } = require('../api/socket.service');
  
   const unsubscribe = socketService.onBookingUpdated((updatedBooking: any) => {
    console.log('⚡ BookingContext socket update:', updatedBooking.id, updatedBooking.status);
    setBookings((prev) => {
      const exists = prev.find((b) => b.id === updatedBooking.id);
      if (exists) {
        return prev.map((b) => (b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b));
      }
      return [updatedBooking, ...prev];
    });
  });
  const unsubRemoved = socketService.onRideRemoved?.((bookingId: string) => {
    // Only remove from list if it's genuinely cancelled (not accepted by this driver)
    setBookings((prev) => prev.filter((b) => {
      if (b.id !== bookingId) return true;          // keep unrelated bookings
      if (b.status === 'ACCEPTED') return true;     // keep our own accepted booking
      return false;                                  // remove cancelled/taken ride
    }));
  });
  return () => {
    if (unsubscribe) unsubscribe();
    if (unsubRemoved) unsubRemoved();
  };
}, []);

  const createBooking = useCallback(async (payload: BookingPayload) => {
    const data = await BookingService.create(payload);
    // Optimistically add the new booking to state
    setBookings((prev) => [data.booking, ...prev]);
    return data;
  }, []);

  const cancelBooking = useCallback(async (id: string) => {
    await BookingService.cancel(id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
    );
  }, []);

  const patchBooking = useCallback((updated: Booking) => {
  setBookings((prev) =>
    prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
  );
}, []);

  const verifyPayment = useCallback(async (reference: string) => {
  try {
    const data = await BookingService.verifyPayment(reference);
    setBookings((prev) =>
      prev.map((b) => (b.id === data.booking?.id ? data.booking : b))
    );
  } catch (err: any) {
    // 400 means already paid (webhook beat us to it) — not a real error
    if (err?.response?.status !== 400) throw err;
  }
}, []);


  const reinitializeBooking = useCallback(async (bookingId: string, channel: 'card' | 'bank_transfer') => {
  const data = await BookingService.reinitialize(bookingId, channel);
  return data; // { authorizationUrl, reference }
}, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const activeBookings = bookings.filter((b) =>
    ACTIVE_STATUSES.includes(b.status)
  );

  return (
    <BookingContext.Provider
      value={{
        bookings,
        activeBookings,
        isLoading,
        error,
        fetchBookings,
        createBooking,
        cancelBooking,
        verifyPayment,
        patchBooking,
        reinitializeBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export const useBookings = () => useContext(BookingContext);