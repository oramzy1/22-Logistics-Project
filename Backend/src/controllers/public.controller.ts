// controllers/public.controller.ts

import { Request, Response } from "express";
import { sendSupportRequestEmail } from "../lib/email.service";

export const submitPublicContact = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    await sendSupportRequestEmail(
      email,
      name,
      subject,
      message
    );

    return res.status(200).json({
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Unable to send message",
    });
  }
};