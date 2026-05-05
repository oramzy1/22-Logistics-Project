// hooks/useUnreadTripMessages.ts (add to both apps)
import { useState, useEffect } from 'react';
import { socketService } from '@/api/socket.service';

export function useUnreadTripMessages(bookingId: string | null, currentUserId: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!bookingId) return;

    const unsub = socketService.onTripMessage((data) => {
      if (data.bookingId !== bookingId) return;
      if (data.senderId !== currentUserId) {
        setUnreadCount((c) => c + 1);
      }
    });

    const unsubRead = socketService.onTripMessagesRead(() => {
      setUnreadCount(0);
    });

    return () => { unsub(); unsubRead(); };
  }, [bookingId, currentUserId]);

  const clearUnread = () => {
    setUnreadCount(0);
    if (bookingId) socketService.markTripMessagesRead(bookingId, currentUserId);
  };

  return { unreadCount, clearUnread };
}