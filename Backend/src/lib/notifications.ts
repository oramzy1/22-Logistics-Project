// import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import prisma from './prisma';

// const expo = new Expo();

export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  const { Expo } = await import('expo-server-sdk');  // dynamic import here

  if (!Expo.isExpoPushToken(pushToken)) return;

  const expo = new Expo();
  const message = { to: pushToken, sound: 'default' as const, title, body, data };

  try {
    await expo.sendPushNotificationsAsync([message]);
  } catch (error) {
    console.error('Push notification failed:', error);
  }
}; 
export const createNotification = async (
  userId: string,
  title: string,
  body: string,
  type: string,
  bookingId?: string
) => {
  // Save to DB
  await prisma.notification.create({
    data: { userId, title, body, type, bookingId },
  });

  // Send push if user has token
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushToken: true },
  });

  if (user?.pushToken) {
    await sendPushNotification(user.pushToken, title, body, { bookingId, type });
  }
};