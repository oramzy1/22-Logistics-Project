import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import path from 'path'
import bookingRoutes from './routes/booking.routes';
import notificationRoutes from './routes/notification.routes';
import paymentRoutes from './routes/payment.routes';

dotenv.config();


const app = express();
app.use(cors());

app.use('/api/payments', paymentRoutes);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/bookings/webhook', express.raw({ type: 'application/json' }));
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Logistics API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
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