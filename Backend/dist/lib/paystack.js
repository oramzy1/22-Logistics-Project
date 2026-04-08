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
exports.verifyTransaction = exports.initializeTransaction = void 0;
const axios_1 = __importDefault(require("axios"));
const paystackClient = axios_1.default.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
    },
});
const initializeTransaction = (email, amountInKobo, metadata, reference, channels) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield paystackClient.post('/transaction/initialize', Object.assign({ email, amount: amountInKobo, reference,
        metadata, callback_url: `${process.env.BASE_URL}/api/payments/callback` }, (channels && { channels })));
    return response.data.data;
});
exports.initializeTransaction = initializeTransaction;
const verifyTransaction = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield paystackClient.get(`/transaction/verify/${reference}`);
    return response.data.data;
});
exports.verifyTransaction = verifyTransaction;
