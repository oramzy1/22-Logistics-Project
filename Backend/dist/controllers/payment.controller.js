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
exports.paystackWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const notifications_1 = require("../lib/notifications");
const paystackWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify webhook signature
        const hash = crypto_1.default
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            // .update(JSON.stringify(req.body))
            .update(req.body)
            .digest('hex');
        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(401).json({ message: 'Invalid signature' });
        }
        const { event, data } = req.body;
        if (event === 'charge.success') {
            const reference = data.reference;
            const booking = yield prisma_1.default.booking.findFirst({
                where: { paymentRef: reference },
            });
            if (booking && booking.paymentStatus === 'UNPAID') {
                yield prisma_1.default.booking.update({
                    where: { id: booking.id },
                    data: { paymentStatus: 'PAID', status: 'AWAITING_DRIVER' },
                });
                yield (0, notifications_1.createNotification)(booking.customerId, 'Booking Confirmed!', `Payment received for ${booking.packageType}. A driver will be assigned shortly.`, 'PAYMENT_CONFIRMED', booking.id);
            }
        }
        // Always return 200 to Paystack immediately
        res.sendStatus(200);
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(200); // still return 200 to avoid Paystack retries
    }
});
exports.paystackWebhook = paystackWebhook;
