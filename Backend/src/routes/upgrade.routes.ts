import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { createUpgrade, getUpgradeQuotes, requestUpgradeAsDriver, verifyUpgradePayment } from "../controllers/upgrade.controller";



const router = Router();

router.post("/", authenticate, createUpgrade);
router.post("/driver-request", authenticate, requestUpgradeAsDriver);
router.get("/verify/:reference", verifyUpgradePayment);
router.get("/quotes/:bookingId", getUpgradeQuotes);

export default router;