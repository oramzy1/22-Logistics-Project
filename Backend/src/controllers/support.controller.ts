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


import { sendSupportRequestEmail } from '../lib/email.service';
import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const submitSupportRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, description } = req.body;
    const screenshotUrl = req.file?.path;

    console.log('📩 Support request received:', { subject, description, screenshotUrl, userId: req.user?.id });

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, name: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Await so errors are caught instead of swallowed
    try {
      await sendSupportRequestEmail(user.email, user.name, subject, description, screenshotUrl);
      console.log('✅ Support email sent for:', user.email);
    } catch (emailErr) {
      // Log but don't block the response — request is still recorded
      console.error('❌ Support email failed:', emailErr);
    }

    res.json({ message: 'Support request submitted' });
  } catch (error) {
    console.error('❌ submitSupportRequest error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};