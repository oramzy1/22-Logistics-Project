import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { createExtension, verifyExtensionPayment } from "../controllers/extension.controller";


const router = Router();

router.post('/', authenticate, createExtension);
router.get('/verify/:reference', verifyExtensionPayment);

export default router;