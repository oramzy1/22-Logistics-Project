import { Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { initializeTransaction, verifyTransaction } from '../lib/paystack';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getExtensionPrices } from '../lib/getPrices';

// const EXTENSION_PRICES: Record<string, number> = {
//   '1-Hours': 10000,
//   '2-Hours': 15000,
//   '3-Hours': 24000,
// };

export const createExtension = async (req: AuthRequest, res: Response) => {
   console.log('👤 User making extension request:', req.user);
  try {
    const { bookingId, hours } = req.body; // hours = '1-Hours' | '2-Hours' | '3-Hours'

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, customerId: req.user!.id },
      include: { customer: { select: { email: true } } },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!['IN_PROGRESS', 'AWAITING_DRIVER'].includes(booking.status)) {
      return res.status(400).json({ message: 'Can only extend trips in progress' });
    }

    const EXTENSION_PRICES = await getExtensionPrices();
    const amount = EXTENSION_PRICES[hours];
    if (!amount) return res.status(400).json({ message: 'Invalid extension option' });

    const paymentRef = `22LOG-EXT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const extension = await prisma.tripExtension.create({
      data: { bookingId, hours: parseInt(hours), amount, paymentRef },
    });

    const paystackData = await initializeTransaction(
      booking.customer.email,
      amount * 100,
      { extensionId: extension.id, bookingId, type: 'EXTENSION' },
      paymentRef,
      ['card'],
    );

    await prisma.tripExtension.update({
      where: { id: extension.id },
      data: { paystackAccessCode: paystackData.access_code },
    });

    res.status(201).json({
      extension,
      payment: {
        authorizationUrl: paystackData.authorization_url,
        accessCode: paystackData.access_code,
        reference: paymentRef,
      },
    });
  } catch (error) {
    console.error('Create extension error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const verifyExtensionPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.params;

    const extension = await prisma.tripExtension.findFirst({
      where: { OR: [{ paymentRef: reference }, { id: reference }] },
    });
    if (!extension) return res.status(404).json({ message: 'Extension not found' });
    if (extension.paymentStatus === 'PAID') return res.json({ message: 'Already paid', extension });

    if (!extension.paymentRef) return res.status(400).json({ message: 'No payment reference' });

    let paystackData: any = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      paystackData = await verifyTransaction(extension.paymentRef);
      if (paystackData.status === 'success') break;
      if (attempt < 5) await new Promise((r) => setTimeout(r, attempt * 1000));
    }

    if (paystackData?.status === 'success') {
      const updated = await prisma.tripExtension.update({
        where: { id: extension.id },
        data: { paymentStatus: 'PAID' },
      });
      return res.json({ message: 'Extension payment verified', extension: updated });
    }

    res.status(400).json({ message: 'Payment not successful', status: paystackData?.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};