// routes/public.routes.ts

import { Router } from "express";
import { submitPublicContact } from "../controllers/public.controller";

const router = Router();

router.post("/contact", submitPublicContact);

export default router;