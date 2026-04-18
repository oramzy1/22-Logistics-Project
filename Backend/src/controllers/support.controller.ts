import { sendSupportRequestEmail } from "../lib/email.service";
import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
export const submitSupportRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, description } = req.body;
    const screenshotUrl = req.file?.path;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, name: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    sendSupportRequestEmail(user.email, user.name, subject, description, screenshotUrl);

    res.json({ message: 'Support request submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};