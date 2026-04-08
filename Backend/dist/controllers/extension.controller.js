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
exports.verifyExtensionPayment = exports.createExtension = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const paystack_1 = require("../lib/paystack");
const EXTENSION_PRICES = {
    '1-Hours': 10000,
    '2-Hours': 15000,
    '3-Hours': 24000,
};
const createExtension = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('👤 User making extension request:', req.user);
    try {
        const { bookingId, hours } = req.body; // hours = '1-Hours' | '2-Hours' | '3-Hours'
        const booking = yield prisma_1.default.booking.findFirst({
            where: { id: bookingId, customerId: req.user.id },
            include: { customer: { select: { email: true } } },
        });
        if (!booking)
            return res.status(404).json({ message: 'Booking not found' });
        if (!['IN_PROGRESS', 'AWAITING_DRIVER'].includes(booking.status)) {
            return res.status(400).json({ message: 'Can only extend trips in progress' });
        }
        const amount = EXTENSION_PRICES[hours];
        if (!amount)
            return res.status(400).json({ message: 'Invalid extension option' });
        const paymentRef = `22LOG-EXT-${Date.now()}-${crypto_1.default.randomBytes(4).toString('hex').toUpperCase()}`;
        const extension = yield prisma_1.default.tripExtension.create({
            data: { bookingId, hours: parseInt(hours), amount, paymentRef },
        });
        const paystackData = yield (0, paystack_1.initializeTransaction)(booking.customer.email, amount * 100, { extensionId: extension.id, bookingId, type: 'EXTENSION' }, paymentRef, ['card']);
        yield prisma_1.default.tripExtension.update({
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
    }
    catch (error) {
        console.error('Create extension error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.createExtension = createExtension;
const verifyExtensionPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reference } = req.params;
        const extension = yield prisma_1.default.tripExtension.findFirst({
            where: { OR: [{ paymentRef: reference }, { id: reference }] },
        });
        if (!extension)
            return res.status(404).json({ message: 'Extension not found' });
        if (extension.paymentStatus === 'PAID')
            return res.json({ message: 'Already paid', extension });
        if (!extension.paymentRef)
            return res.status(400).json({ message: 'No payment reference' });
        let paystackData = null;
        for (let attempt = 1; attempt <= 5; attempt++) {
            paystackData = yield (0, paystack_1.verifyTransaction)(extension.paymentRef);
            if (paystackData.status === 'success')
                break;
            if (attempt < 5)
                yield new Promise((r) => setTimeout(r, attempt * 1000));
        }
        if ((paystackData === null || paystackData === void 0 ? void 0 : paystackData.status) === 'success') {
            const updated = yield prisma_1.default.tripExtension.update({
                where: { id: extension.id },
                data: { paymentStatus: 'PAID' },
            });
            return res.json({ message: 'Extension payment verified', extension: updated });
        }
        res.status(400).json({ message: 'Payment not successful', status: paystackData === null || paystackData === void 0 ? void 0 : paystackData.status });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.verifyExtensionPayment = verifyExtensionPayment;
