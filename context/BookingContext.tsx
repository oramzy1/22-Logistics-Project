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
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

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
  createdAt: string;
};

type BookingContextType = {
  bookings: Booking[];
  activeBookings: Booking[];
  isLoading: boolean;
  error: string | null;
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

  const verifyPayment = useCallback(async (reference: string) => {
    const data = await BookingService.verifyPayment(reference);
    // Sync the updated booking returned from verify
    setBookings((prev) =>
      prev.map((b) => (b.id === data.booking.id ? data.booking : b))
    );
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
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export const useBookings = () => useContext(BookingContext);