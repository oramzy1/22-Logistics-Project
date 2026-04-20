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
import { sendWelcomeEmail } from "../lib/email.service";
import { OAuth2Client } from "google-auth-library";
import { AuthRequest } from "../middlewares/auth.middleware";


const ALLOWED_GOOGLE_CLIENT_IDS = [
  process.env.GOOGLE_CLIENT_ID_USER_APP,   // user/business app client ID
  process.env.GOOGLE_CLIENT_ID_DRIVER_APP, // driver app client ID
].filter(Boolean) as string[];



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
    try {
      await sendWelcomeEmail(email, name, "INDIVIDUAL");
    } catch (e) {
      console.error("Welcome email failed:", e);
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
    const { email, password, appType } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        businessProfile: true,
        driverProfile: true,
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

    if (appType === 'driver-app' && user.role !== 'DRIVER'){
      return res.status(403).json({
        message: 'This account is not a driver account. Please use the correct app.',
      })
    }

    if (appType === 'user-app' && user.role === 'DRIVER'){
      return res.status(403).json({
        message: 'Driver accounts must use the Driver app to sign in.',
      })
    }

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
        isActive: user.isActive,
        isVerified: user.isVerified,
        businessProfile: user.businessProfile
          ? { logoUrl: user.businessProfile.logoUrl ?? null }
          : null,
        driverProfile: user.driverProfile ?? null,
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

async function verifyGoogleToken(idToken: string) {
  for (const clientId of ALLOWED_GOOGLE_CLIENT_IDS) {
    try {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      return ticket.getPayload();
    } catch {
      // This client ID didn't match — try the next one
      continue;
    }
  }
  return null; // none matched
}

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken, appType } = req.body;

    
    const payload = await verifyGoogleToken(idToken);
    if (!payload?.email) return res.status(400).json({ message: 'Invalid Google token' });

    const { email, name, picture } = payload;

    let user = await prisma.user.findUnique({
      where: { email },
      include: { driverProfile: true, businessProfile: true },
    });

    if (user) {
      // Existing user — enforce role gate
      if (appType === 'driver-app' && user.role !== 'DRIVER') {
        return res.status(403).json({ message: 'This account is not a driver account.' });
      }
      if (appType === 'user-app' && user.role === 'DRIVER') {
        return res.status(403).json({ message: 'Driver accounts must use the Driver app.' });
      }
    } else {
      // New user — role determined by appType
      // user-app can be INDIVIDUAL or BUSINESS; OAuth defaults to INDIVIDUAL.
      // Business accounts created via OAuth must complete their business profile after sign-in.
      const role: Role = appType === 'driver-app' ? 'DRIVER' : 'INDIVIDUAL';

      user = await prisma.user.create({
        data: {
          email,
          name: name ?? email,
          password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
          role,
          isVerified: true,
          avatarUrl: picture ?? null,
          ...(role === 'DRIVER' && {
            driverProfile: { create: { licenseStatus: 'PENDING' } },
          }),
        },
        include: { driverProfile: true, businessProfile: true },
      });
      try { await sendWelcomeEmail(email, user.name, role); } catch {}
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' },
    );

    // Flags the frontend on what additional steps are needed
    const needsLicenseUpload  = user.role === 'DRIVER'   && !user.driverProfile?.licenseImageUrl;
    const needsBusinessProfile = user.role === 'BUSINESS' && !user.businessProfile;

    res.json({
      token,
      needsProfileCompletion: needsLicenseUpload || needsBusinessProfile,
      needsLicenseUpload,
      needsBusinessProfile,
      user: {
        id: user.id, email: user.email, phone: user.phone, name: user.name,
        role: user.role, avatarUrl: user.avatarUrl,
        isActive: user.isActive, isVerified: user.isVerified,
        businessProfile: user.businessProfile ? { logoUrl: user.businessProfile.logoUrl } : null,
        driverProfile: user.driverProfile ?? null,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed', error });
  }
};

// Add appleAuth (was missing entirely):
export const appleAuth = async (req: Request, res: Response) => {
  try {
    const { identityToken, fullName, appType } = req.body;

    if (!identityToken) return res.status(400).json({ message: 'Missing identity token' });

    // Decode Apple JWT — in production verify with Apple's public keys via jwks-rsa
    const decoded = jwt.decode(identityToken) as any;
    if (!decoded?.email && !decoded?.sub) {
      return res.status(400).json({ message: 'Invalid Apple token' });
    }

    // Apple may hide real email after first sign-in — fall back to sub-based placeholder
    const email: string = decoded.email ?? `apple_${decoded.sub}@privaterelay.appleid.com`;
    const givenName  = fullName?.givenName  ?? '';
    const familyName = fullName?.familyName ?? '';
    const resolvedName = [givenName, familyName].filter(Boolean).join(' ') || email.split('@')[0];

    let user = await prisma.user.findUnique({
      where: { email },
      include: { driverProfile: true, businessProfile: true },
    });

    if (user) {
      if (appType === 'driver-app' && user.role !== 'DRIVER') {
        return res.status(403).json({ message: 'This account is not a driver account.' });
      }
      if (appType === 'user-app' && user.role === 'DRIVER') {
        return res.status(403).json({ message: 'Driver accounts must use the Driver app.' });
      }
    } else {
      const role: Role = appType === 'driver-app' ? 'DRIVER' : 'INDIVIDUAL';

      user = await prisma.user.create({
        data: {
          email,
          name: resolvedName,
          password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
          role,
          isVerified: true,
          ...(role === 'DRIVER' && {
            driverProfile: { create: { licenseStatus: 'PENDING' } },
          }),
        },
        include: { driverProfile: true, businessProfile: true },
      });
      try { await sendWelcomeEmail(email, resolvedName, role); } catch {}
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' },
    );

    const needsLicenseUpload   = user.role === 'DRIVER'   && !user.driverProfile?.licenseImageUrl;
    const needsBusinessProfile = user.role === 'BUSINESS' && !user.businessProfile;

    res.json({
      token,
      needsProfileCompletion: needsLicenseUpload || needsBusinessProfile,
      needsLicenseUpload,
      needsBusinessProfile,
      user: {
        id: user.id, email: user.email, phone: user.phone, name: user.name,
        role: user.role, avatarUrl: user.avatarUrl,
        isActive: user.isActive, isVerified: user.isVerified,
        businessProfile: user.businessProfile ? { logoUrl: user.businessProfile.logoUrl } : null,
        driverProfile: user.driverProfile ?? null,
      },
    });
  } catch (error) {
    console.error('Apple auth error:', error);
    res.status(500).json({ message: 'Apple authentication failed', error });
  }
};

export const completeBusiness = async (req: AuthRequest, res: Response) => {
  try {
    const {
      companyName, companyEmail, companyAddress, companyPhone,
      adminName, adminEmail, department, adminPhone, scheduleType, cacNumber,
    } = req.body;

    // Check they don't already have a business profile
    const existing = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (existing) {
      return res.status(400).json({ message: 'Business profile already exists' });
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        role: 'BUSINESS',
        businessProfile: {
          create: {
            companyName, companyEmail, companyAddress, companyPhone,
            adminName, adminEmail,
            department: department ?? '',
            adminPhone,
            scheduleType: scheduleType || 'others',
            cacNumber: cacNumber || null,
            logoUrl: req.file?.path ?? null,
          },
        },
      },
    });

    res.json({ message: 'Business profile completed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const completeDriverProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { licenseNumber } = req.body;
    const licenseImageUrl = req.file?.path ?? null;

    if (!licenseImageUrl) {
      return res.status(400).json({ message: 'License image is required' });
    }

    await prisma.driverProfile.upsert({
      where: { userId: req.user!.id },
      update: {
        licenseNumber: licenseNumber ?? null,
        licenseImageUrl,
        licenseStatus: 'PENDING',
      },
      create: {
        userId: req.user!.id,
        licenseNumber: licenseNumber ?? null,
        licenseImageUrl,
        licenseStatus: 'PENDING',
      },
    });

    // Ensure role is DRIVER
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { role: 'DRIVER' },
    });

    res.json({ message: 'Driver profile submitted. Pending admin verification.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};