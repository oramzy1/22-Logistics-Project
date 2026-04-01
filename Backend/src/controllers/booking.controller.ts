// import crypto from 'crypto';
// import { Response } from 'express';
// import { initializeTransaction, verifyTransaction } from '../lib/paystack';
// import { sendPushNotification } from '../lib/notifications';
// import prisma from '../lib/prisma';
// import { AuthRequest } from '../middlewares/auth.middleware';

// // Helper to create notification record + send push
// const notify = async (
//   userId: string,
//   title: string,
//   body: string,
//   type: string,
//   data?: object,
// ) => {
//   const user = await prisma.user.findUnique({ where: { id: userId } });
//   await prisma.notification.create({
//     data: { userId, title, body, type, data },
//   });
//   if (user?.pushToken) {
//     await sendPushNotification(user.pushToken, title, body, data);
//   }
// };

// export const createBooking = async (req: AuthRequest, res: Response) => {
//   try {
//     const {
//       pickupAddress, dropoffAddress,
//       pickupLat, pickupLng, dropoffLat, dropoffLng,
//       scheduledAt, duration, packageType,
//       totalAmount, notes,
//     } = req.body;

//     const customerId = req.user!.id;
//     const reference = `BK-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

//     // Create booking in PENDING state
//     const booking = await prisma.booking.create({
//       data: {
//         customerId, pickupAddress, dropoffAddress,
//         pickupLat, pickupLng, dropoffLat, dropoffLng,
//         scheduledAt: new Date(scheduledAt),
//         duration, packageType,
//         totalAmount, notes,
//         paymentRef: reference,
//       },
//     });

//     // Initialize Paystack transaction
//     const customer = await prisma.user.findUnique({ where: { id: customerId } });
//     const paystackData = await initializeTransaction(
//       customer!.email,
//       Math.round(totalAmount * 100), // convert to kobo
//       { bookingId: booking.id, customerId },
//       reference,
//     );

//     res.status(201).json({
//       booking,
//       payment: {
//         authorizationUrl: paystackData.authorization_url,
//         accessCode: paystackData.access_code,
//         reference,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// export const verifyPayment = async (req: AuthRequest, res: Response) => {
//   try {
//     const { reference } = req.params;

//     const paystackData = await verifyTransaction(reference);

//     if (paystackData.status !== 'success') {
//       return res.status(400).json({ message: 'Payment not successful' });
//     }

//     const booking = await prisma.booking.update({
//       where: { paymentRef: reference },
//       data: {
//         paymentStatus: 'PAID',
//         status: 'AWAITING_DRIVER',
//       },
//       include: { customer: true },
//     });

//     // Notify customer
//     await notify(
//       booking.customerId,
//       'Booking Confirmed!',
//       `Your ${booking.packageType} ride on ${new Date(booking.scheduledAt).toDateString()} is confirmed. We are assigning a driver.`,
//       'BOOKING_CONFIRMED',
//       { bookingId: booking.id },
//     );

//     res.json({ message: 'Payment verified', booking });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// export const paystackWebhook = async (req: AuthRequest, res: Response) => {
//   try {
//     const hash = crypto
//       .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
//       .update(JSON.stringify(req.body))
//       .digest('hex');

//     if (hash !== req.headers['x-paystack-signature']) {
//       return res.status(401).json({ message: 'Invalid signature' });
//     }

//     const { event, data } = req.body;

//     if (event === 'charge.success') {
//       const booking = await prisma.booking.findUnique({
//         where: { paymentRef: data.reference },
//       });

//       if (booking && booking.paymentStatus === 'UNPAID') {
//         await prisma.booking.update({
//           where: { paymentRef: data.reference },
//           data: { paymentStatus: 'PAID', status: 'AWAITING_DRIVER' },
//         });

//         await notify(
//           booking.customerId,
//           'Payment Received!',
//           'Your payment was successful. We are finding you a driver.',
//           'PAYMENT_SUCCESS',
//           { bookingId: booking.id },
//         );
//       }
//     }

//     res.sendStatus(200);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// export const getMyBookings = async (req: AuthRequest, res: Response) => {
//   try {
//     const bookings = await prisma.booking.findMany({
//       where: { customerId: req.user!.id },
//       orderBy: { createdAt: 'desc' },
//       include: {
//         driver: {
//           select: { id: true, name: true, phone: true, avatarUrl: true },
//         },
//       },
//     });
//     res.json(bookings);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// export const getBookingById = async (req: AuthRequest, res: Response) => {
//   try {
//     const booking = await prisma.booking.findFirst({
//       where: { id: req.params.id, customerId: req.user!.id },
//       include: {
//         driver: {
//           select: { id: true, name: true, phone: true, avatarUrl: true },
//         },
//       },
//     });
//     if (!booking) return res.status(404).json({ message: 'Booking not found' });
//     res.json(booking);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// export const cancelBooking = async (req: AuthRequest, res: Response) => {
//   try {
//     const booking = await prisma.booking.findFirst({
//       where: { id: req.params.id, customerId: req.user!.id },
//     });

//     if (!booking) return res.status(404).json({ message: 'Booking not found' });

//     if (['IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(booking.status)) {
//       return res.status(400).json({ message: `Cannot cancel a ${booking.status.toLowerCase()} booking` });
//     }

//     await prisma.booking.update({
//       where: { id: req.params.id },
//       data: { status: 'CANCELLED' },
//     });

//     res.json({ message: 'Booking cancelled' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };



import { Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { initializeTransaction, verifyTransaction } from '../lib/paystack';
import { createNotification } from '../lib/notifications';
import { AuthRequest } from '../middlewares/auth.middleware';

// Package pricing in Naira
const PACKAGE_PRICES: Record<string, number> = {
  '3 Hours':   24000,
  '6 Hours':   34000,
  '10 Hours':  54000,
  'Airport':   30000,
  'Multi-day': 0, // custom pricing
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const {
      pickupAddress, dropoffAddress,
      pickupLat, pickupLng, dropoffLat, dropoffLng,
      scheduledAt, packageType, duration, notes,
    } = req.body;

    const customerId = req.user!.id;

    // Get customer for email
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { email: true, name: true },
    });
    if (!customer) return res.status(404).json({ message: 'User not found' });

    const totalAmount = PACKAGE_PRICES[packageType] ?? 0;
    if (!totalAmount) return res.status(400).json({ message: 'Invalid package type or custom pricing required' });

    // Generate unique payment reference
    const paymentRef = `22LOG-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create booking first
    const booking = await prisma.booking.create({
      data: {
        customerId,
        pickupAddress, dropoffAddress,
        pickupLat, pickupLng, dropoffLat, dropoffLng,
        scheduledAt: new Date(scheduledAt),
        packageType, duration, notes,
        totalAmount,
        paymentRef,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
      },
    });

    // Initialize Paystack transaction
    const paystackData = await initializeTransaction(
      customer.email,
      totalAmount * 100, // convert to kobo
      { bookingId: booking.id, customerId, packageType },
      paymentRef,
      ["card"]
    );

    // Save access code for verification
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paystackAccessCode: paystackData.access_code },
    });

    res.status(201).json({
      booking,
      payment: {
        authorizationUrl: paystackData.authorization_url,
        accessCode: paystackData.access_code,
        reference: paymentRef,
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const bookings = await prisma.booking.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        driver: { select: { name: true, phone: true, avatarUrl: true } },
      },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findFirst({
      where: { id, customerId: req.user!.id },
      include: {
        driver: { select: { name: true, phone: true, avatarUrl: true } },
      },
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (['IN_PROGRESS', 'COMPLETED'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await createNotification(
      req.user!.id,
      'Booking Cancelled',
      `Your booking for ${booking.packageType} has been cancelled.`,
      'BOOKING_CANCELLED',
      id
    );

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { paymentRef: reference },
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const paystackData = await verifyTransaction(reference);

    if (paystackData.status === 'success') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'PAID',
          status: 'AWAITING_DRIVER',
        },
      });

      await createNotification(
        booking.customerId,
        'Payment Confirmed',
        `Your payment for ${booking.packageType} was successful. We are assigning a driver.`,
        'PAYMENT_CONFIRMED',
        booking.id
      );

      return res.json({ message: 'Payment verified', booking });
    }

    res.status(400).json({ message: 'Payment not successful', status: paystackData.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};