import { Router } from 'express';
import { paystackWebhook } from '../controllers/payment.controller';
import express from 'express';

const router = Router();

// Raw body needed for Paystack signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), paystackWebhook);

export default router;