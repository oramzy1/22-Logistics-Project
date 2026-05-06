import { useEffect } from "react";
import { socketService } from "@/api/socket.service";
import { showToast } from "@/app/utils/toast";
import { getCurrentChat } from "@/components/chatState";

export const useSocketNotifications = () => {
  useEffect(() => {
    const unsubscribe = socketService.onTripMessage((data) => {
    if( getCurrentChat() === data.bookingId) return;
    showToast.success(
   data.sender,
   data.message.length > 50
     ? data.message.slice(0, 50) + "..."
     : data.message
 );
    });

    return () => {
      unsubscribe();
    };
  }, []);
};