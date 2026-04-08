"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.createNotification = exports.sendPushNotification = void 0;
// import { Expo, ExpoPushMessage } from 'expo-server-sdk';
const prisma_1 = __importDefault(require("./prisma"));
// const expo = new Expo();
const sendPushNotification = (pushToken, title, body, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { Expo } = yield Promise.resolve().then(() => __importStar(require('expo-server-sdk'))); // dynamic import here
    if (!Expo.isExpoPushToken(pushToken))
        return;
    const expo = new Expo();
    const message = { to: pushToken, sound: 'default', title, body, data };
    try {
        yield expo.sendPushNotificationsAsync([message]);
    }
    catch (error) {
        console.error('Push notification failed:', error);
    }
});
exports.sendPushNotification = sendPushNotification;
const createNotification = (userId, title, body, type, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    // Save to DB
    yield prisma_1.default.notification.create({
        data: { userId, title, body, type, bookingId },
    });
    // Send push if user has token
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { pushToken: true },
    });
    if (user === null || user === void 0 ? void 0 : user.pushToken) {
        yield (0, exports.sendPushNotification)(user.pushToken, title, body, { bookingId, type });
    }
});
exports.createNotification = createNotification;
