import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Response } from "express";
import {
  sendSupportRequestEmail,
  sendVerificationEmail,
} from "../lib/email.service";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { validatePassword } from "../lib/password.validator";

const base_url = process.env.BASE_URL;

const generateCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = crypto.createHash("sha256").update(code).digest("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000);
  return { code, hashed, expiry };
};

type VerifyResult = 
  | { ok: true } 
  | { ok: false; status: number; message: string; requiresPasswordSetup: boolean; useOtp?: boolean};


async function verifyUserCredential(
  user: {
    id: string;
    authProvider: string;
    password: string | null;
    actionOtp: string | null;
    actionOtpExpiry: Date | null;
  },
  credential: string
): Promise<VerifyResult> {
  if (user.authProvider === "email" || user.authProvider === "hybrid") {
    if (!user.password) {
      return { ok: false, status: 400, message: "No password set", requiresPasswordSetup: false };
    }
    const match = await bcrypt.compare(credential, user.password);
    if (!match) {
      return { ok: false, status: 400, message: "Incorrect password", requiresPasswordSetup: false };
    }
    return { ok: true };
  }

  // Pure OAuth user — verify via otp
   if (!user.actionOtp || !user.actionOtpExpiry) {
    return {
      ok: false, status: 403,
      message: "Please request a verification code to proceed.",
      requiresPasswordSetup: false,
      useOtp: true,
    };
  }
  if (new Date() > user.actionOtpExpiry) {
    return {
      ok: false, status: 403,
      message: "Verification code expired. Please request a new one.",
      requiresPasswordSetup: false,
      useOtp: true,
    };
  }
  const hashed = crypto.createHash("sha256").update(credential).digest("hex");
  if (hashed !== user.actionOtp) {
    return {
      ok: false, status: 400,
      message: "Invalid verification code.",
      requiresPasswordSetup: false,
      useOtp: true,
    };
  }

  // Consume OTP
  await prisma.user.update({
    where: { id: user.id },
    data: { actionOtp: null, actionOtpExpiry: null },
  });
  return { ok: true };
}



export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        authProvider: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        isVerified: true,
        businessProfile: {
          select: { logoUrl: true },
        },
        driverProfile: {
          select: {
            id: true,
            vehicleType: true,
            brandModel: true,
            plateNumber: true,
            vehicleColor: true,
            workingHours: true,
            onlineStatus: true,
            licenseImageUrl: true,
            licenseStatus: true,
          },
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

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { 
        id: true, password: true, authProvider: true, 
        actionOtp: true, actionOtpExpiry: true 
      }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.authProvider === "google" || user.authProvider === "apple") {
      return res.status(400).json({
        message: `Your email is managed by ${user.authProvider === "google" ? "Google" : "Apple"} and cannot be changed here.`,
        requiresPasswordSetup: true, // still nudge them to set a password
      });
    }

    const check = await verifyUserCredential(user, password);
    if (!check.ok) return res.status(check.status).json({ 
      message: check.message, 
      requiresPasswordSetup: check.requiresPasswordSetup 
    });

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

    const user = await prisma.user.findUnique({
  where: { id: req.user!.id },
  select: { id: true, password: true, authProvider: true, actionOtp: true, actionOtpExpiry: true }
});
if (!user) return res.status(404).json({ message: "User not found" });

    // OAuth users have no password to change — direct them to email change flow
    if (user.authProvider === "google" || user.authProvider === "apple") {
      return res.status(400).json({
        message: "Your account uses social sign-in. To set a password, please use the Change Email flow.",
        requiresEmailChange: true,
      });
    }

const check = await verifyUserCredential(user, currentPassword);
if (!check.ok) return res.status(check.status).json({ 
  message: check.message,
  requiresPasswordSetup: check.requiresPasswordSetup
});

const passwordCheck = validatePassword(newPassword);
if (!passwordCheck.valid) {
  return res.status(400).json({
    message: "Password does not meet requirements",
    errors: passwordCheck.errors,
  });
}
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
    const { credential } = req.body; // add this to the request

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, password: true, authProvider: true, actionOtp: true, actionOtpExpiry: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const check = await verifyUserCredential(user, credential);
    if (!check.ok) return res.status(check.status).json({ 
      message: check.message,
      useOtp: (check as any).useOtp
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });
    res.json({ message: "Account deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { credential } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const check = await verifyUserCredential(user, credential);
if (!check.ok) return res.status(check.status).json({ 
  message: check.message,
  useOtp: (check as any).useOtp
});
    // Delete related records first due to FK constraints
    // await prisma.order.deleteMany({ where: { customerId: req.user!.id } });
    await prisma.businessProfile.deleteMany({
      where: { userId: req.user!.id },
    });
    await prisma.notification.deleteMany({
      where: { userId: req.user!.id },
    });
    await prisma.driverProfile.deleteMany({
      where: { userId: req.user!.id },
    });
    await prisma.user.delete({ where: { id: req.user!.id } });

    res.json({ message: "Account permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const submitSupportRequest = async (req: AuthRequest, res: Response) => {
  const { subject, description } = req.body;
  const screenshotUrl = req.file?.path;
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { email: true, name: true },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  sendSupportRequestEmail(
    user.email,
    user.name,
    subject,
    description,
    screenshotUrl,
  );
  res.json({ message: "Support request submitted" });
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);
  console.log("req.headers content-type:", req.headers["content-type"]);
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imageUrl = req.file.path;
    const role = req.user!.role;

    if (role === "BUSINESS") {
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
    res.status(500).json({ message: "Server error", error });
  }
};

export const savePushToken = async (req: AuthRequest, res: Response) => {
  try {
    const { pushToken } = req.body;
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { pushToken },
    });
    res.json({ message: "Push token saved" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const requestPasswordSetupOtp = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user!.id },
      select: { id: true, email: true, authProvider: true, password: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.authProvider === "email") {
      return res.status(400).json({ 
        message: "Email accounts already have a password." 
      });
    }

    if (user.authProvider === "hybrid") {
      return res.status(400).json({ 
        message: "You have already set a password." 
      });
    }

    const { code, hashed, expiry } = generateCode();

    await prisma.user.update({
      where: { id: user.id },
      data: { actionOtp: hashed, actionOtpExpiry: expiry },
    });

    await sendVerificationEmail(user.email, code);
    res.json({ message: "A verification code has been sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const setupPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { otp, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { 
        id: true, authProvider: true, 
        actionOtp: true, actionOtpExpiry: true 
      }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.authProvider === "email") {
      return res.status(400).json({ message: "Use change password instead." });
    }

    if (!user.actionOtp || !user.actionOtpExpiry) {
      return res.status(400).json({ 
        message: "No OTP requested. Please request a verification code first." 
      });
    }

    if (new Date() > user.actionOtpExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const hashed = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashed !== user.actionOtp) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        authProvider: "hybrid",   // ← graduated to full account
        actionOtp: null,
        actionOtpExpiry: null,
      },
    });

    res.json({ 
      message: "Password set successfully. You can now use all account features.",
      authProvider: "hybrid"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const requestActionOtp = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, authProvider: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.authProvider === "email" || user.authProvider === "hybrid") {
      return res.status(400).json({ message: "Use your password instead." });
    }

    const { code, hashed, expiry } = generateCode();
    await prisma.user.update({
      where: { id: user.id },
      data: { actionOtp: hashed, actionOtpExpiry: expiry },
    });

    await sendVerificationEmail(user.email, code);
    res.json({ message: "Verification code sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const requestEmailChange = async (req: AuthRequest, res: Response) => {
  try {
    const { newEmail, newPassword, otp } = req.body;
    // otp = action OTP for OAuth users (already verified they control the account)
    // For email/hybrid users this endpoint isn't needed — they use updateEmail directly

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, authProvider: true,
        password: true, actionOtp: true, actionOtpExpiry: true
      }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Block if new email already taken
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    // Verify they control the account via OTP
    const check = await verifyUserCredential(user, otp);
    if (!check.ok) return res.status(check.status).json({
      message: check.message,
      useOtp: (check as any).useOtp
    });

    // Stage the pending changes — nothing commits yet
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { code, hashed, expiry } = generateCode();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        pendingEmail: newEmail,
        pendingPassword: hashedPassword,
        pendingEmailToken: hashed,
        pendingEmailExpiry: expiry,
      },
    });

    // Send verification to the NEW email
    await sendVerificationEmail(newEmail, code);

    res.json({
      message: "A verification code has been sent to your new email address. Please verify it to complete the change.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const verifyActionOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, actionOtp: true, actionOtpExpiry: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.actionOtp || !user.actionOtpExpiry) {
      return res.status(400).json({ message: "No OTP requested. Please request a new code." });
    }
    if (new Date() > user.actionOtpExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const hashed = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashed !== user.actionOtp) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Don't consume it yet — it's still needed for requestEmailChange
    res.json({ message: "OTP verified." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const confirmEmailChange = async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        pendingEmail: true,
        pendingPassword: true,
        pendingEmailToken: true,
        pendingEmailExpiry: true,
        authProvider: true,
      }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.pendingEmail || !user.pendingEmailToken || !user.pendingEmailExpiry) {
      return res.status(400).json({ message: "No pending email change found." });
    }

    if (new Date() > (user.pendingEmailExpiry as Date)) {
      // Clean up expired staging
      await prisma.user.update({
        where: { id: user.id },
        data: {
          pendingEmail: null, pendingPassword: null,
          pendingEmailToken: null, pendingEmailExpiry: null,
        }
      });
      return res.status(400).json({ message: "Verification code expired. Please start over." });
    }

    const hashed = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashed !== user.pendingEmailToken) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Atomic commit — everything changes at once
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        password: user.pendingPassword,
        authProvider: "hybrid",       // ← only NOW does provider change
        isVerified: true,
        pendingEmail: null,
        pendingPassword: null,
        pendingEmailToken: null,
        pendingEmailExpiry: null,
        actionOtp: null,
        actionOtpExpiry: null,
      },
    });

    // Force logout — they must re-login with new credentials
    res.json({
      message: "Email changed successfully. Please sign in with your new email and password.",
      forceLogout: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};