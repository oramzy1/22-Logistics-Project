import { Router } from 'express';
import { createBooking, getBookings, getBookingById, cancelBooking, verifyPayment } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', authorize(['INDIVIDUAL', 'BUSINESS']), createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', authorize(['INDIVIDUAL', 'BUSINESS']), cancelBooking);
router.get('/verify/:reference', verifyPayment);

export default router;