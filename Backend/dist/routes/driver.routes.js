"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../lib/upload");
const driver_controller_1 = require("../controllers/driver.controller");
const router = (0, express_1.Router)();
// Public
router.post('/register', upload_1.upload.single('logo'), driver_controller_1.registerDriver);
// Driver only
router.use(auth_middleware_1.authenticate);
router.post('/license', (0, auth_middleware_1.authorize)(['DRIVER']), upload_1.upload.single('license'), driver_controller_1.uploadLicense);
router.get('/profile', (0, auth_middleware_1.authorize)(['DRIVER']), driver_controller_1.getDriverProfile);
router.patch('/status', (0, auth_middleware_1.authorize)(['DRIVER']), driver_controller_1.setOnlineStatus);
router.patch('/availability', (0, auth_middleware_1.authorize)(['DRIVER']), driver_controller_1.setAvailability);
router.get('/requests', (0, auth_middleware_1.authorize)(['DRIVER']), driver_controller_1.getMyRideRequests);
router.patch('/requests/:requestId/respond', (0, auth_middleware_1.authorize)(['DRIVER']), driver_controller_1.respondToRideRequest);
router.get('/trips/history', (0, auth_middleware_1.authorize)(['DRIVER']), driver_controller_1.getDriverTripHistory);
router.get('/trips/active', (0, auth_middleware_1.authorize)(['DRIVER']), driver_controller_1.getActiveTrip);
router.patch('/trips/:bookingId/start', (0, auth_middleware_1.authorize)(['DRIVER']), driver_controller_1.startTrip);
// Admin only
router.post('/admin/verify-license', (0, auth_middleware_1.authorize)(['ADMIN']), driver_controller_1.verifyDriverLicense);
router.post('/admin/assign', (0, auth_middleware_1.authorize)(['ADMIN']), driver_controller_1.assignDriverToBooking);
router.get('/admin/available', (0, auth_middleware_1.authorize)(['ADMIN']), driver_controller_1.getAvailableDrivers);
exports.default = router;
