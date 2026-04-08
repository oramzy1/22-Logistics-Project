"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const path_1 = __importDefault(require("path"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const extension_route_1 = __importDefault(require("./routes/extension.route"));
const cleanup_1 = require("./lib/cleanup");
const http_1 = require("http");
const socket_1 = require("./lib/socket");
const driver_routes_1 = __importDefault(require("./routes/driver.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = (0, socket_1.initSocket)(httpServer);
app.use((0, cors_1.default)());
app.use('/api/payments', payment_routes_1.default);
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api/bookings/webhook', express_1.default.raw({ type: 'application/json' }));
app.use('/api/bookings', booking_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/extensions', extension_route_1.default);
app.use('/api/driver', driver_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), message: 'Logistics API is running' });
});
(0, cleanup_1.cleanupStaleBookings)();
setInterval(cleanup_1.cleanupStaleBookings, 60 * 60 * 1000);
setInterval(cleanup_1.expireRideRequests, 10 * 1000);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Add at the very bottom of index.ts, after all routes:
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        message: err.message || 'Internal server error',
        details: err.toString()
    });
});
