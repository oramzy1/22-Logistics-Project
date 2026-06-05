import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { createUpgrade, requestUpgradeAsDriver, verifyUpgradePayment } from "../controllers/upgrade.controller";



const router = Router();

router.post("/", authenticate, createUpgrade);
router.post("/driver-request", authenticate, requestUpgradeAsDriver);
router.get("/verify/:reference", verifyUpgradePayment);

export default router;