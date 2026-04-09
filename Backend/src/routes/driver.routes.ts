import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../lib/upload';
import {
  registerDriver,
  uploadLicense,
  getDriverProfile,
  setOnlineStatus,
  setAvailability,
  getMyRideRequests,
  respondToRideRequest,
  getDriverTripHistory,
  getActiveTrip,
  startTrip,
  verifyDriverLicense,
  assignDriverToBooking,
  getAvailableDrivers,
  updateDriverProfile,
  endTrip,
} from '../controllers/driver.controller';

const router = Router();

// Public
router.post('/register', upload.single('logo'), registerDriver);

// Driver only
router.use(authenticate);
router.post('/license', authorize(['DRIVER']), upload.single('license'), uploadLicense);
router.get('/profile', authorize(['DRIVER']), getDriverProfile);
router.patch('/profile', authorize(['DRIVER']), updateDriverProfile);
router.patch('/status', authorize(['DRIVER']), setOnlineStatus);
router.patch('/availability', authorize(['DRIVER']), setAvailability);
router.get('/requests', authorize(['DRIVER']), getMyRideRequests);
router.patch('/requests/:requestId/respond', authorize(['DRIVER']), respondToRideRequest);
router.get('/trips/history', authorize(['DRIVER']), getDriverTripHistory);
router.get('/trips/active', authorize(['DRIVER']), getActiveTrip);
router.patch('/trips/:bookingId/start', authorize(['DRIVER']), startTrip);
router.patch('/trips/:bookingId/end', authorize(['DRIVER']), endTrip);

// Admin only
router.post('/admin/verify-license', authorize(['ADMIN']), verifyDriverLicense);
router.post('/admin/assign', authorize(['ADMIN']), assignDriverToBooking);
router.get('/admin/available', authorize(['ADMIN']), getAvailableDrivers);

export default router;