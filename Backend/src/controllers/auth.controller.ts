import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../lib/email.service";
import prisma from "../lib/prisma";

const base_url = process.env.BASE_URL;

const generateCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = crypto.createHash("sha256").update(code).digest("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  return { code, hashed, expiry };
};

export const register = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    const { role } = req.body;
    const userRole = Object.values(Role).includes(role as Role)
      ? (role as Role)
      : "INDIVIDUAL";

    if (userRole === "BUSINESS") {
      const {
        password,
        // Company Info
        companyName,
        companyEmail,
        companyAddress,
        companyPhone,
        // Admin Details
        adminName,
        adminEmail,
        department,
        adminPhone,
        scheduleType,
        // Business Setup
        cacNumber,
      } = req.body;

      // adminEmail is the login identity for business accounts
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });
      if (existingUser)
        return res
          .status(400)
          .json({ message: "An account with this admin email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const { code, hashed, expiry } = generateCode();

      console.log("req.file:", req.file);
      console.log("req.body keys:", Object.keys(req.body));

      await prisma.user.create({
        data: {
          email: adminEmail, // admin email is the login email
          password: hashedPassword,
          name: adminName,
          role: userRole,
          phone: adminPhone,
          verificationToken: hashed,
          verificationExpiry: expiry,
          businessProfile: {
            create: {
              companyName,
              companyEmail,
              companyAddress,
              companyPhone,
              adminName,
              adminEmail,
              department,
              adminPhone,
              scheduleType: scheduleType || "others",
              cacNumber: cacNumber || null,
              logoUrl: req.file
                ? req.file.path // Cloudinary URL from multer
                : null,
            },
          },
        },
      });

      try {
        await sendVerificationEmail(adminEmail, code);
      } catch (emailError) {
        console.error("Verification email failed to send:", emailError);
      }
      return res.status(201).json({
        message:
          "Business registered successfully. Check your admin email for the verification code.",
        email: adminEmail,
      });
    }

    const { email, password, name, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { code, hashed, expiry } = generateCode();

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        phone,
        verificationToken: hashed,
        verificationExpiry: expiry,
      },
    });

    try {
      await sendVerificationEmail(email, code);
    } catch (emailError) {
      console.error("Verification email failed to send:", emailError);
      // User is created, just warn — they can request resend
    }
    return res.status(201).json({
      message:
        "Registration successful. Check your email for the verification code.",
      email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        businessProfile: {
          select: {
            logoUrl: true,
            companyName: true,
            companyEmail: true,
            companyAddress: true,
            companyPhone: true,
            adminName: true,
            adminEmail: true,
            department: true,
            adminPhone: true,
            scheduleType: true,
            cacNumber: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated. Contact support to reactivate.",
      });
    }

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
        businessProfile: user.businessProfile
          ? { logoUrl: user.businessProfile.logoUrl ?? null }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    console.log("Verifying:", { email, code }); // ← add

    const hashed = crypto.createHash("sha256").update(code).digest("hex");
    console.log("Hashed code:", hashed); // ← add

    // Check what's actually in the DB for this user
    const userCheck = await prisma.user.findUnique({ where: { email } });
    console.log("DB token:", userCheck?.verificationToken); // ← add
    console.log("DB expiry:", userCheck?.verificationExpiry); // ← add
    console.log("Token match:", userCheck?.verificationToken === hashed); // ← add

    const user = await prisma.user.findFirst({
      where: {
        email,
        verificationToken: hashed,
        verificationExpiry: { gt: new Date() },
      },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired code." });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    res.json({ message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.json({
        message: "If that email exists, a reset code was sent.",
      });

    const { code, hashed, expiry } = generateCode();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashed, resetTokenExpiry: expiry },
    });

    await sendPasswordResetEmail(email, code);
    res.json({ message: "If that email exists, a reset code was sent." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    const hashed = crypto.createHash("sha256").update(code).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        email,
        resetToken: hashed,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired code." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
