import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Response } from "express";
import { sendVerificationEmail } from "../lib/email.service";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

const base_url = process.env.BASE_URL;

const generateCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = crypto.createHash("sha256").update(code).digest("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000);
  return { code, hashed, expiry };
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        businessProfile: {
          select: { logoUrl: true },
        },
        driverProfile: {
          select: {
            vehicleType: true,
            brandModel: true,
            plateNumber: true,
            vehicleColor: true,
            workingHours: true,
            onlineStatus: true,
            licenseImageUrl: true,
            licenseStatus: true,
            isVerified: true,
          }
        },
        avatarUrl: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone },
      select: { id: true, email: true, name: true, role: true, phone: true },
    });
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { newEmail, password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Confirm password before allowing email change
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const existing = await prisma.user.findUnique({
      where: { email: newEmail },
    });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const { code, hashed, expiry } = generateCode();

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        email: newEmail,
        isVerified: false, // force re-verification
        verificationToken: hashed,
        verificationExpiry: expiry,
      },
    });

    try {
      await sendVerificationEmail(newEmail, code);
    } catch (e) {
      console.error("Email send failed:", e);
    }

    res.json({
      message: "Email updated. Please verify your new email.",
      email: newEmail,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashed },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deactivateAccount = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { isActive: false },
    });
    res.json({ message: "Account deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    // Delete related records first due to FK constraints
    // await prisma.order.deleteMany({ where: { customerId: req.user!.id } });
    await prisma.businessProfile.deleteMany({
      where: { userId: req.user!.id },
    });
    await prisma.user.delete({ where: { id: req.user!.id } });

    res.json({ message: "Account permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);
  console.log("req.headers content-type:", req.headers["content-type"]);
   try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const imageUrl = req.file.path;
    const role = req.user!.role;

    if (role === 'BUSINESS') {
      await prisma.businessProfile.update({
        where: { userId: req.user!.id },
        data: { logoUrl: imageUrl },
      });
      return res.json({ logoUrl: imageUrl });
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarUrl: imageUrl },
    });

    res.json({ avatarUrl: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const savePushToken = async (req: AuthRequest, res: Response) => {
  try {
    const { pushToken } = req.body;
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { pushToken },
    });
    res.json({ message: 'Push token saved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
