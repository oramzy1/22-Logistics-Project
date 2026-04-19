import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import path from 'path'
import bookingRoutes from './routes/booking.routes';
import notificationRoutes from './routes/notification.routes';
import paymentRoutes from './routes/payment.routes';
import extensionRoutes from './routes/extension.route';
import { cleanupStaleBookings, expireRideRequests } from './lib/cleanup';
import { createServer } from 'http';
import { initSocket } from './lib/socket';
import driverRoutes from './routes/driver.routes';
import supportRouter from './routes/support.route';

dotenv.config();


const app = express();
const httpServer = createServer(app);
const io = initSocket(httpServer);

app.use(cors());

app.use('/api/payments', paymentRoutes);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/bookings/webhook', express.raw({ type: 'application/json' }));
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes)
app.use('/api/extensions', extensionRoutes)
app.use('/api/driver', driverRoutes);
app.use('api/support', supportRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), message: 'Logistics API is running' });
});

cleanupStaleBookings();
setInterval(cleanupStaleBookings, 60 * 60 * 1000);
setInterval(expireRideRequests, 10 * 1000);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Add at the very bottom of index.ts, after all routes:
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    message: err.message || 'Internal server error',
    details: err.toString()
  });
});