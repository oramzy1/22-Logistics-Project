"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
// Raw body needed for Paystack signature verification
router.post('/webhook', express_2.default.raw({ type: 'application/json' }), payment_controller_1.paystackWebhook);
exports.default = router;
