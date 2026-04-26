import { Router } from 'express';
import { createBooking, getBookings, getBookingById, cancelBooking, rateDriver, cancelBookingWithReason } from '../controllers/booking.controller';
import {verifyPayment, reinitializePayment, endTrip } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', authorize(['INDIVIDUAL', 'BUSINESS']), createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.get('/verify/:reference', verifyPayment);
router.post('/:id/reinitialize', authorize(['INDIVIDUAL', 'BUSINESS']), reinitializePayment);
router.patch('/:id/end', authenticate, endTrip);
router.post('/:id/rate-driver', authenticate, rateDriver);
router.post('/:id/cancel', authenticate, cancelBookingWithReason);

export default router;