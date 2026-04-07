"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Customers can create orders
router.post('/', (0, auth_middleware_1.authorize)(['INDIVIDUAL', 'BUSINESS']), order_controller_1.createOrder);
// Everyone can view orders (logic handled in controller)
router.get('/', order_controller_1.getOrders);
// Drivers and Admins can update status
router.patch('/:id/status', (0, auth_middleware_1.authorize)(['DRIVER', 'ADMIN']), order_controller_1.updateOrderStatus);
exports.default = router;
