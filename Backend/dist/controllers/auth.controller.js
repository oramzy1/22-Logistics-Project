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
exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_service_1 = require("../lib/email.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
const base_url = process.env.BASE_URL;
const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = crypto_1.default.createHash("sha256").update(code).digest("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    return { code, hashed, expiry };
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role } = req.body;
        const userRole = Object.values(client_1.Role).includes(role)
            ? role
            : "INDIVIDUAL";
        if (userRole === "BUSINESS") {
            const { password, 
            // Company Info
            companyName, companyEmail, companyAddress, companyPhone, 
            // Admin Details
            adminName, adminEmail, department, adminPhone, scheduleType, 
            // Business Setup
            cacNumber, } = req.body;
            // adminEmail is the login identity for business accounts
            const existingUser = yield prisma_1.default.user.findUnique({
                where: { email: adminEmail },
            });
            if (existingUser)
                return res
                    .status(400)
                    .json({ message: "An account with this admin email already exists" });
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const { code, hashed, expiry } = generateCode();
            console.log("req.file:", req.file);
            console.log("req.body keys:", Object.keys(req.body));
            yield prisma_1.default.user.create({
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
                yield (0, email_service_1.sendVerificationEmail)(adminEmail, code);
            }
            catch (emailError) {
                console.error("Verification email failed to send:", emailError);
            }
            return res.status(201).json({
                message: "Business registered successfully. Check your admin email for the verification code.",
                email: adminEmail,
            });
        }
        const { email, password, name, phone } = req.body;
        const existingUser = yield prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const { code, hashed, expiry } = generateCode();
        yield prisma_1.default.user.create({
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
            yield (0, email_service_1.sendVerificationEmail)(email, code);
        }
        catch (emailError) {
            console.error("Verification email failed to send:", emailError);
            // User is created, just warn — they can request resend
        }
        return res.status(201).json({
            message: "Registration successful. Check your email for the verification code.",
            email,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { email, password } = req.body;
        const user = yield prisma_1.default.user.findUnique({
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
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role,
                avatarUrl: (_a = user.avatarUrl) !== null && _a !== void 0 ? _a : null,
                businessProfile: user.businessProfile
                    ? { logoUrl: (_b = user.businessProfile.logoUrl) !== null && _b !== void 0 ? _b : null }
                    : null,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.login = login;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, code } = req.body;
        console.log("Verifying:", { email, code }); // ← add
        const hashed = crypto_1.default.createHash("sha256").update(code).digest("hex");
        console.log("Hashed code:", hashed); // ← add
        // Check what's actually in the DB for this user
        const userCheck = yield prisma_1.default.user.findUnique({ where: { email } });
        console.log("DB token:", userCheck === null || userCheck === void 0 ? void 0 : userCheck.verificationToken); // ← add
        console.log("DB expiry:", userCheck === null || userCheck === void 0 ? void 0 : userCheck.verificationExpiry); // ← add
        console.log("Token match:", (userCheck === null || userCheck === void 0 ? void 0 : userCheck.verificationToken) === hashed); // ← add
        const user = yield prisma_1.default.user.findFirst({
            where: {
                email,
                verificationToken: hashed,
                verificationExpiry: { gt: new Date() },
            },
        });
        if (!user)
            return res.status(400).json({ message: "Invalid or expired code." });
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationExpiry: null,
            },
        });
        res.json({ message: "Email verified successfully." });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.verifyEmail = verifyEmail;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.json({
                message: "If that email exists, a reset code was sent.",
            });
        const { code, hashed, expiry } = generateCode();
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: { resetToken: hashed, resetTokenExpiry: expiry },
        });
        yield (0, email_service_1.sendPasswordResetEmail)(email, code);
        res.json({ message: "If that email exists, a reset code was sent." });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, code, newPassword } = req.body;
        const hashed = crypto_1.default.createHash("sha256").update(code).digest("hex");
        const user = yield prisma_1.default.user.findFirst({
            where: {
                email,
                resetToken: hashed,
                resetTokenExpiry: { gt: new Date() },
            },
        });
        if (!user)
            return res.status(400).json({ message: "Invalid or expired code." });
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        res.json({ message: "Password reset successfully." });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.resetPassword = resetPassword;
