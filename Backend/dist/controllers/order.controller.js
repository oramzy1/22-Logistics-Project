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
exports.updateOrderStatus = exports.getOrders = exports.createOrder = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../lib/prisma"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pickup, dropoff, price } = req.body;
        const customerId = req.user.id;
        const order = yield prisma_1.default.order.create({
            data: {
                customerId,
                pickup,
                dropoff,
                price,
            },
        });
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.createOrder = createOrder;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let orders;
        if (role === 'ADMIN') {
            orders = yield prisma_1.default.order.findMany({ include: { customer: true, driver: true } });
        }
        else if (role === 'DRIVER') {
            // Drivers see pending orders or orders assigned to them
            orders = yield prisma_1.default.order.findMany({
                where: {
                    OR: [
                        { status: 'PENDING' },
                        { driverId: userId }
                    ]
                },
                include: { customer: true }
            });
        }
        else {
            // Individuals and Businesses see their own orders
            orders = yield prisma_1.default.order.findMany({
                where: { customerId: userId },
                include: { driver: true }
            });
        }
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getOrders = getOrders;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const role = req.user.role;
        const order = yield prisma_1.default.order.findUnique({ where: { id } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Checking if it's a valid enum
        const validStatus = Object.values(client_1.OrderStatus).includes(status) ? status : null;
        if (!validStatus) {
            return res.status(400).json({ message: 'Invalid order status' });
        }
        // Driver accepting a pending order
        if (validStatus === 'ACCEPTED' && role === 'DRIVER' && order.status === 'PENDING') {
            const updatedOrder = yield prisma_1.default.order.update({
                where: { id },
                data: { status: validStatus, driverId: userId },
            });
            return res.json(updatedOrder);
        }
        // Only assigned driver or admin can update further statuses
        if (role === 'DRIVER' && order.driverId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updatedOrder = yield prisma_1.default.order.update({
            where: { id },
            data: { status: validStatus },
        });
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.updateOrderStatus = updateOrderStatus;
