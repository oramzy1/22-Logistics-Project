"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const extension_controller_1 = require("../controllers/extension.controller");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticate, extension_controller_1.createExtension);
router.get('/verify/:reference', extension_controller_1.verifyExtensionPayment);
exports.default = router;
