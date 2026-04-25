import { Router } from 'express';
import {
  adminLogin, getDashboardStats, getAllUsers, getUserById,
  updateUserRole, setUserActiveStatus, adminDeleteUser,
  getAllBookings, adminCancelBooking,
  getAllDrivers,
  getSettings, updateSettings, getPublicPrices,
  createPromo, getAllPromos, togglePromo, deletePromo, validatePromoCode,
  getAuditLog,
} from '../controllers/admin.controller';
import {
  verifyDriverLicense, assignDriverToBooking, getAvailableDrivers,
} from '../controllers/driver.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { loginLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public — no auth
router.post('/auth/login', loginLimiter, adminLogin);
router.get('/public/prices', getPublicPrices);  // frontend price fetch

// All routes below require admin JWT
router.use(authenticate, authorize(['ADMIN']));

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/audit-log', getAuditLog);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', setUserActiveStatus);
router.delete('/users/:id', adminDeleteUser);

// Bookings
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/cancel', adminCancelBooking);

// Drivers
router.get('/drivers', getAllDrivers);
router.post('/drivers/verify-license', verifyDriverLicense);
router.post('/drivers/assign', assignDriverToBooking);
router.get('/drivers/available', getAvailableDrivers);

// Settings / Pricing
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

// Promos
router.post('/promos', createPromo);
router.get('/promos', getAllPromos);
router.patch('/promos/:id/toggle', togglePromo);
router.delete('/promos/:id', deletePromo);

// Promo validation (also usable by authenticated users at checkout)
router.post('/promos/validate', authenticate, validatePromoCode);

export default router;