let currentChatId: string | null = null;

export const setCurrentChat = (bookingId: string | null) => {
  currentChatId = bookingId;
};

export const getCurrentChat = () => {
  return currentChatId;
};