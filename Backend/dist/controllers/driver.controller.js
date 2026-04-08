"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableDrivers = exports.assignDriverToBooking = exports.verifyDriverLicense = exports.startTrip = exports.getActiveTrip = exports.getDriverTripHistory = exports.respondToRideRequest = exports.getMyRideRequests = exports.setAvailability = exports.setOnlineStatus = exports.updateDriverProfile = exports.getDriverProfile = exports.uploadLicense = exports.registerDriver = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const email_service_1 = require("../lib/email.service");
const socket_1 = require("../lib/socket");
const prisma_1 = __importDefault(require("../lib/prisma"));
const notifications_1 = require("../lib/notifications");
const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = crypto_1.default.createHash('sha256').update(code).digest('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    return { code, hashed, expiry };
};
// ── REGISTRATION ──────────────────────────────────────────────
const registerDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, password, licenseNumber } = req.body;
        const existing = yield prisma_1.default.user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ message: 'Email already registered' });
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const { code, hashed, expiry } = generateCode();
        const licenseImageUrl = req.file ? req.file.path : null;
        const user = yield prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'DRIVER',
                phone,
                verificationToken: hashed,
                verificationExpiry: expiry,
                driverProfile: {
                    create: {
                        licenseNumber: licenseNumber !== null && licenseNumber !== void 0 ? licenseNumber : null,
                        licenseImageUrl: licenseImageUrl, // 3. Store the image instantly!
                        licenseStatus: licenseImageUrl ? 'PENDING' : 'REJECTED',
                    },
                },
            },
        });
        try {
            yield (0, email_service_1.sendVerificationEmail)(email, code);
        }
        catch (e) {
            console.error('Email send failed:', e);
        }
        res.status(201).json({
            message: 'Driver registered. Check your email for the verification code.',
            email,
        });
    }
    catch (error) {
        console.error('Driver register error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.registerDriver = registerDriver;
// ── LICENSE UPLOAD ─────────────────────────────────────────────
const uploadLicense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        const licenseImageUrl = req.file.path;
        yield prisma_1.default.driverProfile.update({
            where: { userId: req.user.id },
            data: { licenseImageUrl, licenseStatus: 'PENDING' },
        });
        res.json({ message: 'License uploaded. Pending admin verification.', licenseImageUrl });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.uploadLicense = uploadLicense;
// ── GET DRIVER PROFILE ─────────────────────────────────────────
const getDriverProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield prisma_1.default.driverProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                user: {
                    select: { name: true, email: true, phone: true, avatarUrl: true },
                },
            },
        });
        if (!profile)
            return res.status(404).json({ message: 'Driver profile not found' });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getDriverProfile = getDriverProfile;
const updateDriverProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vehicleType, brandModel, plateNumber, vehicleColor, workingHours } = req.body;
        const profile = yield prisma_1.default.driverProfile.update({
            where: { userId: req.user.id },
            data: { vehicleType, brandModel, plateNumber, vehicleColor, workingHours },
        });
        res.json({ message: 'Profile updated', profile });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.updateDriverProfile = updateDriverProfile;
// ── TOGGLE ONLINE STATUS ────────────────────────────────────────
const setOnlineStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const profile = yield prisma_1.default.driverProfile.update({
            where: { userId: req.user.id },
            data: {
                onlineStatus: status,
                isOnline: status !== 'OFFLINE',
                isAvailable: status === 'ONLINE',
            },
        });
        // Broadcast status change so admin dashboard updates in real-time
        (0, socket_1.getIO)().emit('driver:status_changed', {
            driverProfileId: profile.id,
            isOnline: profile.isOnline,
            isAvailable: profile.isAvailable,
        });
        res.json({ message: `Status updated to ${status}`, profile });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.setOnlineStatus = setOnlineStatus;
// ── TOGGLE AVAILABILITY ─────────────────────────────────────────
const setAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { isAvailable } = req.body;
        const profile = yield prisma_1.default.driverProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!profile)
            return res.status(404).json({ message: 'Profile not found' });
        if (!profile.isOnline && isAvailable) {
            return res.status(400).json({ message: 'You must be online to set availability' });
        }
        const updated = yield prisma_1.default.driverProfile.update({
            where: { userId: req.user.id },
            data: { isAvailable },
        });
        (0, socket_1.getIO)().emit('driver:availability_changed', {
            driverProfileId: updated.id,
            isAvailable: updated.isAvailable,
        });
        res.json({ message: `Availability updated`, profile: updated });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.setAvailability = setAvailability;
// ── GET AVAILABLE RIDE REQUESTS ─────────────────────────────────
const getMyRideRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield prisma_1.default.driverProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!profile)
            return res.status(404).json({ message: 'Profile not found' });
        const requests = yield prisma_1.default.rideRequest.findMany({
            where: {
                driverProfileId: profile.id,
                status: 'PENDING',
                expiresAt: { gt: new Date() }, // not expired
            },
            include: {
                booking: {
                    include: {
                        customer: { select: { name: true, phone: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getMyRideRequests = getMyRideRequests;
// ── RESPOND TO RIDE REQUEST ─────────────────────────────────────
const respondToRideRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { requestId } = req.params;
        const { action } = req.body; // 'ACCEPTED' | 'DECLINED'
        const profile = yield prisma_1.default.driverProfile.findUnique({
            where: { userId: req.user.id },
            include: { user: { select: { name: true } }, rideRequests: { where: { id: requestId } } },
        });
        if (!profile)
            return res.status(404).json({ message: 'Profile not found' });
        const request = yield prisma_1.default.rideRequest.findFirst({
            where: { id: requestId, driverProfileId: profile.id },
            include: { booking: true },
        });
        if (!request)
            return res.status(404).json({ message: 'Ride request not found' });
        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request already responded to' });
        }
        if (new Date() > request.expiresAt) {
            yield prisma_1.default.rideRequest.update({
                where: { id: requestId },
                data: { status: 'EXPIRED' },
            });
            return res.status(400).json({ message: 'Request has expired' });
        }
        // Check if driver is already on an active trip
        if (action === 'ACCEPTED') {
            const activeTrip = yield prisma_1.default.booking.findFirst({
                where: {
                    driverId: profile.userId,
                    status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
                },
            });
            if (activeTrip) {
                // Don't block — just warn. Frontend shows the prompt.
                // Let driver confirm via a separate flag if needed.
                // For now we include the warning in the response.
                console.warn(`Driver ${profile.id} accepted ride while on active trip`);
            }
        }
        const updatedRequest = yield prisma_1.default.rideRequest.update({
            where: { id: requestId },
            data: {
                status: action,
                respondedAt: new Date(),
            },
        });
        if (action === 'ACCEPTED') {
            // Assign driver to booking
            yield prisma_1.default.booking.update({
                where: { id: request.bookingId },
                data: {
                    driverId: profile.userId,
                    status: 'ACCEPTED',
                },
            });
            // Update driver stats
            yield prisma_1.default.driverProfile.update({
                where: { id: profile.id },
                data: {
                    isAvailable: false, // no longer available for new rides
                    totalTrips: { increment: 1 },
                },
            });
            // Notify customer in real-time
            (0, socket_1.getIO)().to(`user:${request.booking.customerId}`).emit('booking:driver_assigned', {
                bookingId: request.bookingId,
                driverName: (_a = profile.user) === null || _a === void 0 ? void 0 : _a.name,
            });
            yield (0, notifications_1.createNotification)(request.booking.customerId, 'Driver Assigned!', `A driver has been assigned to your booking.`, 'DRIVER_ASSIGNED', request.bookingId);
        }
        // Notify admin of response
        (0, socket_1.getIO)().emit('driver:request_responded', {
            requestId,
            action,
            driverProfileId: profile.id,
            bookingId: request.bookingId,
        });
        res.json({ message: `Ride ${action.toLowerCase()}`, request: updatedRequest });
    }
    catch (error) {
        console.error('Respond to ride request error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.respondToRideRequest = respondToRideRequest;
// ── GET DRIVER TRIP HISTORY ─────────────────────────────────────
const getDriverTripHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trips = yield prisma_1.default.booking.findMany({
            where: {
                driverId: req.user.id,
                status: { in: ['COMPLETED', 'CANCELLED'] },
            },
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { select: { name: true, phone: true, avatarUrl: true } },
                review: { select: { rating: true, comment: true } },
            },
        });
        res.json(trips);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getDriverTripHistory = getDriverTripHistory;
// ── GET ACTIVE TRIP ─────────────────────────────────────────────
const getActiveTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trip = yield prisma_1.default.booking.findFirst({
            where: {
                driverId: req.user.id,
                status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
            },
            include: {
                customer: { select: { name: true, phone: true, avatarUrl: true } },
                extensions: { where: { paymentStatus: 'PAID' } },
            },
        });
        res.json(trip !== null && trip !== void 0 ? trip : null);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getActiveTrip = getActiveTrip;
// ── START TRIP ──────────────────────────────────────────────────
const startTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const booking = yield prisma_1.default.booking.findFirst({
            where: { id: bookingId, driverId: req.user.id, status: 'ACCEPTED' },
        });
        if (!booking)
            return res.status(404).json({ message: 'Booking not found or not accepted' });
        const updated = yield prisma_1.default.booking.update({
            where: { id: bookingId },
            data: { status: 'IN_PROGRESS' },
        });
        // Notify customer
        (0, socket_1.getIO)().to(`user:${booking.customerId}`).emit('booking:trip_started', {
            bookingId,
        });
        yield (0, notifications_1.createNotification)(booking.customerId, 'Trip Started', 'Your driver has started the trip. Have a safe journey!', 'TRIP_STARTED', bookingId);
        res.json({ message: 'Trip started', booking: updated });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.startTrip = startTrip;
// ── ADMIN: VERIFY LICENSE ───────────────────────────────────────
const verifyDriverLicense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driverProfileId, status, rejectionReason } = req.body;
        // status: 'APPROVED' | 'REJECTED'
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const profile = yield prisma_1.default.driverProfile.update({
            where: { id: driverProfileId },
            data: { licenseStatus: status },
            include: { user: { select: { id: true, name: true } } },
        });
        // Notify driver in real-time
        (0, socket_1.getIO)().to(`user:${profile.user.id}`).emit('license:verified', { status, rejectionReason });
        yield (0, notifications_1.createNotification)(profile.user.id, status === 'APPROVED' ? 'License Approved!' : 'License Rejected', status === 'APPROVED'
            ? 'Your driver\'s license has been verified. You can now receive ride requests.'
            : `Your license was rejected. ${rejectionReason !== null && rejectionReason !== void 0 ? rejectionReason : 'Please re-upload a valid license.'}`, 'LICENSE_STATUS', undefined);
        res.json({ message: `License ${status.toLowerCase()}`, profile });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.verifyDriverLicense = verifyDriverLicense;
// ── ADMIN: ASSIGN DRIVER TO BOOKING ────────────────────────────
const assignDriverToBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId, driverProfileId } = req.body;
        const driverProfile = yield prisma_1.default.driverProfile.findUnique({
            where: { id: driverProfileId },
            include: { user: true },
        });
        if (!driverProfile)
            return res.status(404).json({ message: 'Driver not found' });
        if (!driverProfile.isOnline) {
            return res.status(400).json({ message: 'Driver is offline' });
        }
        if (driverProfile.licenseStatus !== 'APPROVED') {
            return res.status(400).json({ message: 'Driver license not verified' });
        }
        const booking = yield prisma_1.default.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            return res.status(404).json({ message: 'Booking not found' });
        // Create ride request that expires in 30 seconds
        const expiresAt = new Date(Date.now() + 30 * 1000);
        const rideRequest = yield prisma_1.default.rideRequest.create({
            data: {
                bookingId,
                driverProfileId,
                expiresAt,
                status: 'PENDING',
            },
            include: {
                booking: {
                    include: {
                        customer: { select: { name: true, phone: true } },
                    },
                },
            },
        });
        // Push ride request to driver in real-time
        (0, socket_1.getIO)().to(`driver:${driverProfileId}`).emit('ride:new_request', {
            requestId: rideRequest.id,
            booking: rideRequest.booking,
            expiresAt,
        });
        res.json({ message: 'Ride request sent to driver', rideRequest });
    }
    catch (error) {
        console.error('Assign driver error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.assignDriverToBooking = assignDriverToBooking;
// ── GET ALL AVAILABLE DRIVERS (Admin) ──────────────────────────
const getAvailableDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drivers = yield prisma_1.default.driverProfile.findMany({
            where: {
                isOnline: true,
                isAvailable: true,
                licenseStatus: 'APPROVED',
            },
            include: {
                user: { select: { name: true, phone: true, avatarUrl: true } },
            },
        });
        res.json(drivers);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getAvailableDrivers = getAvailableDrivers;
