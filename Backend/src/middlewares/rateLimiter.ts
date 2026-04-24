import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 5 attempts per IP
  keyGenerator: (req) => {
    const ip = req.ip ?? 'unknown';
    const email = req.body?.email?.toLowerCase()?.trim() ?? 'unknown';
    return `${ip}:${email}`;
  },
  message: {
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    message: "Too many password reset requests. Try again later.",
  },
});

export const resendVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    message: "Too many requests. Please wait before retrying.",
  },
});

export const verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many attempts. Try again later.",
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    message: "Too many accounts created. Try again later.",
  },
});