import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { createNotification } from '../lib/notifications';

export const paystackWebhook = async (req: Request, res: Response) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'charge.success') {
      const reference = data.reference;

      const booking = await prisma.booking.findFirst({
        where: { paymentRef: reference },
      });

      if (booking && booking.paymentStatus === 'UNPAID') {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: 'PAID', status: 'AWAITING_DRIVER' },
        });

        await createNotification(
          booking.customerId,
          'Booking Confirmed!',
          `Payment received for ${booking.packageType}. A driver will be assigned shortly.`,
          'PAYMENT_CONFIRMED',
          booking.id
        );
      }
    }

    // Always return 200 to Paystack immediately
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(200); // still return 200 to avoid Paystack retries
  }
};