"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const IS_DEV = process.env.NODE_ENV === 'development';
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER, // your Brevo login email
        pass: process.env.BREVO_SMTP_KEY, // SMTP key, NOT your account password
    },
});
const sendVerificationEmail = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`\n📧 VERIFICATION CODE for ${email}: ${code}\n`);
    yield transporter.sendMail({
        from: `"22Logistics" <${process.env.BREVO_SENDER_EMAIL}>`,
        to: email,
        subject: 'Verify your email',
        html: `<p>Your verification code is: <strong>${code}</strong>. It expires in 15 minutes.</p>`,
    });
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`\n📧 VERIFICATION CODE for ${email}: ${code}\n`);
    yield transporter.sendMail({
        from: `"22Logistics" <${process.env.BREVO_SENDER_EMAIL}>`,
        to: email,
        subject: 'Reset your password',
        html: `<p>Your password reset code is: <strong>${code}</strong>. It expires in 15 minutes.</p>`,
    });
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// Add to `.env`:
// ```
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your@email.com
// SMTP_PASS=your_app_password
