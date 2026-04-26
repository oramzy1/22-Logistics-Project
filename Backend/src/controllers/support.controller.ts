// import { sendSupportRequestEmail } from "../lib/email.service";
// import { Response } from "express";
// import prisma from "../lib/prisma";
// import { AuthRequest } from "../middlewares/auth.middleware";
// export const submitSupportRequest = async (req: AuthRequest, res: Response) => {
//   try {
//     const { subject, description } = req.body;
//     const screenshotUrl = req.file?.path;

//     const user = await prisma.user.findUnique({
//       where: { id: req.user!.id },
//       select: { email: true, name: true },
//     });

//     if (!user) return res.status(404).json({ message: 'User not found' });

//     sendSupportRequestEmail(user.email, user.name, subject, description, screenshotUrl);

//     res.json({ message: 'Support request submitted' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// import { sendSupportRequestEmail } from '../lib/email.service';
// import { Response } from 'express';
// import prisma from '../lib/prisma';
// import { AuthRequest } from '../middlewares/auth.middleware';

// export const submitSupportRequest = async (req: AuthRequest, res: Response) => {
//   try {
//     const { subject, description } = req.body;
//     const screenshotUrl = req.file?.path;

//     console.log('📩 Support request received:', { subject, description, screenshotUrl, userId: req.user?.id });

//     if (!subject || !description) {
//       return res.status(400).json({ message: 'Subject and description are required' });
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: req.user!.id },
//       select: { email: true, name: true },
//     });

//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // Await so errors are caught instead of swallowed
//     try {
//       await sendSupportRequestEmail(user.email, user.name, subject, description, screenshotUrl);
//       console.log('✅ Support email sent for:', user.email);
//     } catch (emailErr) {
//       // Log but don't block the response — request is still recorded
//       console.error('❌ Support email failed:', emailErr);
//     }

//     res.json({ message: 'Support request submitted' });
//   } catch (error) {
//     console.error('❌ submitSupportRequest error:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// backend/src/controllers/support.controller.ts
import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { emitToAdmin, getIO } from "../lib/socket";
import { sendSupportRequestEmail } from "../lib/email.service";
import { createNotification } from "../lib/notifications";

const generateTicketId = async () => {
  const count = await prisma.supportTicket.count();
  return `TKT-${String(count + 1).padStart(3, "0")}`;
};

// User creates a ticket (replaces submitSupportRequest)
export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, description, category } = req.body;
    const screenshotUrl = req.file?.path;

    if (!subject || !description) {
      return res
        .status(400)
        .json({ message: "Subject and description are required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, name: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ticketId = await generateTicketId();

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketId,
        userId: req.user!.id,
        subject,
        category: category ?? "OTHER",
        screenshotUrl,
        messages: {
          create: {
            senderId: req.user!.id,
            body: description,
            isAdmin: false,
          },
        },
      },
      include: {
        messages: true,
        user: { select: { name: true, email: true } },
      },
    });

    // Notify admins via socket
    // getIO().to('admins').emit('support:new_ticket', ticket);
    emitToAdmin("admin:support_new_ticket", ticket);

    // Still send the email as a backup notification to admins
    try {
      await sendSupportRequestEmail(
        user.email,
        user.name,
        subject,
        description,
        screenshotUrl,
      );
    } catch (e) {
      console.error("Support email failed:", e);
    }

    res.status(201).json({ message: "Ticket created", ticket });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// User/Admin sends a message in a ticket
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { body } = req.body;
    const isAdmin = req.user!.role === "ADMIN";

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Only ticket owner or admin can message
    if (!isAdmin && ticket.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const message = await prisma.supportMessage.create({
      data: { ticketId, senderId: req.user!.id, body, isAdmin },
      include: { sender: { select: { name: true, avatarUrl: true } } },
    });

    // Update ticket status if admin is replying
    if (isAdmin && ticket.status === "OPEN") {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "IN_PROGRESS" },
      });
    }

    // Emit to ticket room
    getIO().to(`ticket:${ticketId}`).emit("support:new_message", {
      ticketId, // ← include this so frontend can update the list
      message,
    });

    if (isAdmin) {
  getIO().to(`user:${ticket.userId}`).emit('support:new_message', {
    ticketId,
    message,
  });
}

    // Notify the user (if admin replied)
    if (isAdmin) {
      await createNotification(
        ticket.userId,
        "Support Reply",
        `Admin replied to your ticket: ${ticket.subject}`,
        "SUPPORT_REPLY",
        ticketId,
      );
      // Also push to user's socket room
      getIO()
        .to(`user:${ticket.userId}`)
        .emit("support:new_message", { ticketId, message });
    }

    res.json({ ticketId, message });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all tickets (admin) or own tickets (user)
export const getTickets = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user!.role === "ADMIN";
    const { status, category, search } = req.query;

    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...(isAdmin ? {} : { userId: req.user!.id }),
        ...(status ? { status: status as any } : {}),
        ...(category ? { category: category as any } : {}),
        ...(search
          ? {
              OR: [
                {
                  subject: { contains: search as string, mode: "insensitive" },
                },
                {
                  ticketId: { contains: search as string, mode: "insensitive" },
                },
                {
                  user: {
                    name: { contains: search as string, mode: "insensitive" },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { name: true, avatarUrl: true, email: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 }, // preview
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get single ticket with full messages
export const getTicketById = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const isAdmin = req.user!.role === "ADMIN";

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { name: true, avatarUrl: true, email: true } },
        messages: {
          include: { sender: { select: { name: true, avatarUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!isAdmin && ticket.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin updates ticket status/priority
export const updateTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { status, priority } = req.body;

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { ...(status && { status }), ...(priority && { priority }) },
    });

    getIO().to(`ticket:${ticketId}`).emit("support:ticket_updated", ticket);
    getIO().to("admins").emit("support:ticket_updated", ticket);

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Ticket stats for admin dashboard cards
export const getTicketStats = async (_req: AuthRequest, res: Response) => {
  try {
    const [open, inProgress, resolvedToday] = await Promise.all([
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.supportTicket.count({
        where: {
          status: "RESOLVED",
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);
    res.json({ open, inProgress, resolvedToday, avgResponseTime: "2.4 hrs" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
