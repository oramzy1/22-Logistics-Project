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
exports.cancelBookingWithReason = exports.rateDriver = exports.endTrip = exports.reinitializePayment = exports.verifyPayment = exports.cancelBooking = exports.getBookingById = exports.getBookings = exports.createBooking = void 0;
const crypto_1 = __importDefault(require("crypto"));
const notifications_1 = require("../lib/notifications");
const paystack_1 = require("../lib/paystack");
const prisma_1 = __importDefault(require("../lib/prisma"));
// Package pricing in Naira
const PACKAGE_PRICES = {
    "3 Hours": 24000,
    "6 Hours": 34000,
    "10 Hours": 54000,
    "Airport Schedule": 80000,
    "Multi-day": 80000,
};
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { pickupAddress, dropoffAddress, pickupLat, pickupLng, dropoffLat, dropoffLng, scheduledAt, packageType, duration, notes, totalAmount: clientTotal, } = req.body;
        const customerId = req.user.id;
        // Get customer for email
        const customer = yield prisma_1.default.user.findUnique({
            where: { id: customerId },
            select: { email: true, name: true },
        });
        if (!customer)
            return res.status(404).json({ message: "User not found" });
        const basePrice = (_a = PACKAGE_PRICES[packageType]) !== null && _a !== void 0 ? _a : 0;
        if (!basePrice)
            return res
                .status(400)
                .json({ message: "Invalid package type or custom pricing required" });
        const MAX_EXTRAS = 20000;
        const totalAmount = clientTotal &&
            clientTotal >= basePrice &&
            clientTotal <= basePrice + MAX_EXTRAS
            ? clientTotal
            : basePrice;
        // Generate unique payment reference
        const paymentRef = `22LOG-${Date.now()}-${crypto_1.default.randomBytes(4).toString("hex").toUpperCase()}`;
        let paystackData;
        try {
            paystackData = yield (0, paystack_1.initializeTransaction)(customer.email, totalAmount * 100, { customerId, packageType }, paymentRef, ["card"]);
        }
        catch (paystackError) {
            console.error("Paystack init failed:", paystackError === null || paystackError === void 0 ? void 0 : paystackError.message);
            return res.status(502).json({
                message: "Payment gateway unavailable. Please try again.",
            });
        }
        // Create booking first
        const booking = yield prisma_1.default.booking.create({
            data: {
                customerId,
                pickupAddress,
                dropoffAddress,
                pickupLat,
                pickupLng,
                dropoffLat,
                dropoffLng,
                scheduledAt: new Date(scheduledAt),
                packageType,
                duration,
                notes,
                totalAmount,
                paymentRef,
                status: "PENDING",
                paymentStatus: "UNPAID",
            },
        });
        // Save access code for verification
        yield prisma_1.default.booking.update({
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
    }
    catch (error) {
        console.error("Create booking error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
exports.createBooking = createBooking;
const getBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const bookings = yield prisma_1.default.booking.findMany({
            where: {
                customerId: userId,
                NOT: {
                    AND: [
                        { paymentStatus: "UNPAID" },
                        { createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) } },
                    ],
                },
            },
            orderBy: { createdAt: "desc" },
            include: {
                driver: { select: { name: true, phone: true, avatarUrl: true } },
                extensions: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getBookings = getBookings;
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const booking = yield prisma_1.default.booking.findFirst({
            where: { id, customerId: req.user.id },
            include: {
                driver: { select: { name: true, phone: true, avatarUrl: true } },
                extensions: {
                    orderBy: { createdAt: "asc" },
                }
            },
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getBookingById = getBookingById;
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const booking = yield prisma_1.default.booking.findFirst({
            where: { id, customerId: req.user.id },
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (["IN_PROGRESS", "COMPLETED"].includes(booking.status)) {
            return res.status(400).json({ message: "Cannot cancel this booking" });
        }
        yield prisma_1.default.booking.update({
            where: { id },
            data: { status: "CANCELLED" },
        });
        yield (0, notifications_1.createNotification)(req.user.id, "Booking Cancelled", `Your booking for ${booking.packageType} has been cancelled.`, "BOOKING_CANCELLED", id);
        res.json({ message: "Booking cancelled" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.cancelBooking = cancelBooking;
// export const verifyPayment = async (req: AuthRequest, res: Response) => {
//   try {
//     const { reference } = req.params;
//     const booking = await prisma.booking.findFirst({
//       where: { paymentRef: reference },
//     });
//     if (!booking) return res.status(404).json({ message: 'Booking not found' });
//       if (booking.paymentStatus === 'PAID') {
//       return res.json({ message: 'Payment already verified', booking });
//     }
//     const paystackData = await verifyTransaction(reference);
//     if (paystackData.status === 'success') {
//       const updated = await prisma.booking.update({
//         where: { id: booking.id },
//         data: {
//           paymentStatus: 'PAID',
//           status: 'AWAITING_DRIVER',
//         },
//       });
//       await createNotification(
//         booking.customerId,
//         'Payment Confirmed',
//         `Your payment for ${booking.packageType} was successful. We are assigning a driver.`,
//         'PAYMENT_CONFIRMED',
//         booking.id
//       );
//       return res.json({ message: 'Payment verified', booking: updated });
//     }
//       console.error('Paystack verify returned non-success:', paystackData);
//     res.status(400).json({ message: 'Payment not successful', status: paystackData.status });
//   } catch (error) {
//     console.error('Verify payment error:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { reference } = req.params;
        console.log("🔍 Verify called with reference:", reference);
        const booking = yield prisma_1.default.booking.findFirst({
            where: {
                OR: [{ paymentRef: reference }, { id: reference }],
            },
        });
        console.log("📦 Booking found:", (_a = booking === null || booking === void 0 ? void 0 : booking.id) !== null && _a !== void 0 ? _a : "NOT FOUND");
        console.log("📋 All payment refs in DB:");
        //   const allRefs = await prisma.booking.findMany({
        //   select: { paymentRef: true, id: true, paymentStatus: true }
        // });
        // console.log(allRefs);
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        // Already updated (by webhook or previous verify call)
        if (booking.paymentStatus === "PAID") {
            return res.json({ message: "Payment already verified", booking });
        }
        if (!booking.paymentRef) {
            return res
                .status(400)
                .json({ message: "Booking has no payment reference" });
        }
        // Retry verifying with Paystack up to 5 times with backoff
        let paystackData = null;
        for (let attempt = 1; attempt <= 5; attempt++) {
            paystackData = yield (0, paystack_1.verifyTransaction)(booking.paymentRef); // no const here — assign to outer variable
            console.log(`Verify attempt ${attempt}:`, paystackData.status);
            if (paystackData.status === "success")
                break;
            if (attempt < 5) {
                yield new Promise((r) => setTimeout(r, attempt * 1000));
            }
        }
        if ((paystackData === null || paystackData === void 0 ? void 0 : paystackData.status) === "success") {
            const updated = yield prisma_1.default.booking.update({
                where: { id: booking.id },
                data: { paymentStatus: "PAID", status: "AWAITING_DRIVER" },
            });
            yield (0, notifications_1.createNotification)(booking.customerId, "Payment Confirmed", `Your payment for ${booking.packageType} was successful. A driver will be assigned shortly.`, "PAYMENT_CONFIRMED", booking.id);
            return res.json({ message: "Payment verified", booking: updated });
        }
        console.error("All verify attempts failed. Final status:", paystackData === null || paystackData === void 0 ? void 0 : paystackData.status);
        return res.status(400).json({
            message: "Payment not successful after retries",
            status: paystackData === null || paystackData === void 0 ? void 0 : paystackData.status,
        });
    }
    catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
exports.verifyPayment = verifyPayment;
const reinitializePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { channel } = req.body; // 'card' | 'bank_transfer'
        const booking = yield prisma_1.default.booking.findFirst({
            where: { id, customerId: req.user.id },
            include: {
                customer: { select: { email: true } }, // ✅ 'customer' matches your schema relation
            },
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.paymentStatus === "PAID")
            return res.status(400).json({ message: "Already paid" });
        const validChannels = ["card", "bank_transfer"];
        if (!validChannels.includes(channel)) {
            return res.status(400).json({ message: "Invalid payment channel" });
        }
        const newRef = `22LOG-${Date.now()}-${crypto_1.default.randomBytes(4).toString("hex").toUpperCase()}`;
        const paystackData = yield (0, paystack_1.initializeTransaction)(booking.customer.email, booking.totalAmount * 100, {
            bookingId: booking.id,
            customerId: booking.customerId,
            packageType: booking.packageType,
        }, newRef, [channel]);
        yield prisma_1.default.booking.update({
            where: { id: booking.id },
            data: {
                paymentRef: newRef,
                paystackAccessCode: paystackData.access_code,
            },
        });
        res.json({
            authorizationUrl: paystackData.authorization_url,
            reference: newRef,
        });
    }
    catch (error) {
        console.error("Reinitialize payment error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
exports.reinitializePayment = reinitializePayment;
const endTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const booking = yield prisma_1.default.booking.findFirst({
            where: { id, customerId: req.user.id },
        });
        if (!booking)
            return res.status(404).json({ message: 'Booking not found' });
        if (!['IN_PROGRESS', 'AWAITING_DRIVER'].includes(booking.status)) {
            return res.status(400).json({ message: 'Trip cannot be ended' });
        }
        const updated = yield prisma_1.default.booking.update({
            where: { id },
            data: { status: 'COMPLETED' },
        });
        yield (0, notifications_1.createNotification)(booking.customerId, 'Trip Completed', `Your ${booking.packageType} trip has been completed. Thank you for riding with us!`, 'BOOKING_COMPLETED', id);
        res.json({ message: 'Trip ended', booking: updated });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.endTrip = endTrip;
const rateDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // bookingId
        const { rating, comment } = req.body; // rating: 1-5
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
        const booking = yield prisma_1.default.booking.findFirst({
            where: { id, customerId: req.user.id, status: 'COMPLETED' },
            include: { review: true },
        });
        if (!booking)
            return res.status(404).json({ message: 'Booking not found or not completed' });
        if (!booking.driverId)
            return res.status(400).json({ message: 'No driver assigned' });
        const review = yield prisma_1.default.driverReview.create({
            data: {
                bookingId: id,
                driverId: booking.driverId,
                customerId: req.user.id,
                rating,
                comment: comment !== null && comment !== void 0 ? comment : null,
            },
        });
        res.json({ message: 'Driver rated', review });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.rateDriver = rateDriver;
const cancelBookingWithReason = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { reason, requestRefund } = req.body;
        const booking = yield prisma_1.default.booking.findFirst({
            where: { id, customerId: req.user.id },
        });
        if (!booking)
            return res.status(404).json({ message: 'Booking not found' });
        if (['IN_PROGRESS', 'COMPLETED'].includes(booking.status)) {
            return res.status(400).json({ message: 'Cannot cancel this booking' });
        }
        yield prisma_1.default.booking.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                cancellationReason: reason,
                refundRequested: requestRefund && booking.paymentStatus === 'PAID',
            },
        });
        yield (0, notifications_1.createNotification)(req.user.id, 'Booking Cancelled', `Your booking for ${booking.packageType} has been cancelled.${requestRefund && booking.paymentStatus === 'PAID' ? ' Your refund request is being processed.' : ''}`, 'BOOKING_CANCELLED', id);
        res.json({
            message: 'Booking cancelled',
            refundRequested: requestRefund && booking.paymentStatus === 'PAID',
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.cancelBookingWithReason = cancelBookingWithReason;
