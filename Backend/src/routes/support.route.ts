// import { Router } from 'express';
// import { authenticate } from '../middlewares/auth.middleware';
// import { upload } from '../lib/upload';
// import { submitSupportRequest } from '../controllers/support.controller';

// const router = Router();

// router.use(authenticate); 
// router.post('/request', upload.single('screenshot'), submitSupportRequest);

// export default router;




import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { upload } from '../lib/upload';
import {
  createTicket, sendMessage, getTickets,
  getTicketById, updateTicket, getTicketStats,
} from '../controllers/support.controller';

const router = Router();

router.use(authenticate);

// User routes
router.post('/tickets', upload.single('screenshot'), createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/:ticketId', getTicketById);
router.post('/tickets/:ticketId/messages', sendMessage);

// Admin only
router.get('/stats', requireAdmin, getTicketStats);
router.patch('/tickets/:ticketId', requireAdmin, updateTicket);

export default router;