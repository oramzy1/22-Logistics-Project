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
exports.cleanupStaleBookings = cleanupStaleBookings;
exports.expireRideRequests = expireRideRequests;
const prisma_1 = __importDefault(require("./prisma"));
function cleanupStaleBookings() {
    return __awaiter(this, void 0, void 0, function* () {
        const deleted = yield prisma_1.default.booking.deleteMany({
            where: {
                paymentStatus: 'UNPAID',
                createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) },
            },
        });
        if (deleted.count > 0) {
            console.log(`🧹 Cleaned up ${deleted.count} stale unpaid bookings`);
        }
    });
}
function expireRideRequests() {
    return __awaiter(this, void 0, void 0, function* () {
        const expired = yield prisma_1.default.rideRequest.updateMany({
            where: {
                status: 'PENDING',
                expiresAt: { lt: new Date() },
            },
            data: { status: 'EXPIRED' },
        });
        if (expired.count > 0) {
            console.log(`⏰ Expired ${expired.count} ride requests`);
        }
    });
}
