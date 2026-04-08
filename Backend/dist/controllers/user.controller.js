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
exports.savePushToken = exports.uploadAvatar = exports.deleteAccount = exports.deactivateAccount = exports.changePassword = exports.updateEmail = exports.updateProfile = exports.getMe = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const email_service_1 = require("../lib/email.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
const base_url = process.env.BASE_URL;
const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = crypto_1.default.createHash("sha256").update(code).digest("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    return { code, hashed, expiry };
};
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: req.user.id },
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
                avatarUrl: true,
            },
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getMe = getMe;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone } = req.body;
        const user = yield prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { name, phone },
            select: { id: true, email: true, name: true, role: true, phone: true },
        });
        res.json({ message: "Profile updated", user });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.updateProfile = updateProfile;
const updateEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newEmail, password } = req.body;
        const user = yield prisma_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // Confirm password before allowing email change
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Incorrect password" });
        const existing = yield prisma_1.default.user.findUnique({
            where: { email: newEmail },
        });
        if (existing)
            return res.status(400).json({ message: "Email already in use" });
        const { code, hashed, expiry } = generateCode();
        yield prisma_1.default.user.update({
            where: { id: req.user.id },
            data: {
                email: newEmail,
                isVerified: false, // force re-verification
                verificationToken: hashed,
                verificationExpiry: expiry,
            },
        });
        try {
            yield (0, email_service_1.sendVerificationEmail)(newEmail, code);
        }
        catch (e) {
            console.error("Email send failed:", e);
        }
        res.json({
            message: "Email updated. Please verify your new email.",
            email: newEmail,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.updateEmail = updateEmail;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = yield prisma_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Current password is incorrect" });
        const hashed = yield bcryptjs_1.default.hash(newPassword, 10);
        yield prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { password: hashed },
        });
        res.json({ message: "Password changed successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.changePassword = changePassword;
const deactivateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { isActive: false },
        });
        res.json({ message: "Account deactivated" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.deactivateAccount = deactivateAccount;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password } = req.body;
        const user = yield prisma_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Incorrect password" });
        // Delete related records first due to FK constraints
        // await prisma.order.deleteMany({ where: { customerId: req.user!.id } });
        yield prisma_1.default.businessProfile.deleteMany({
            where: { userId: req.user.id },
        });
        yield prisma_1.default.user.delete({ where: { id: req.user.id } });
        res.json({ message: "Account permanently deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.deleteAccount = deleteAccount;
const uploadAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    console.log("req.headers content-type:", req.headers["content-type"]);
    try {
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        const imageUrl = req.file.path;
        const role = req.user.role;
        if (role === 'BUSINESS') {
            yield prisma_1.default.businessProfile.update({
                where: { userId: req.user.id },
                data: { logoUrl: imageUrl },
            });
            return res.json({ logoUrl: imageUrl });
        }
        yield prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { avatarUrl: imageUrl },
        });
        res.json({ avatarUrl: imageUrl });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.uploadAvatar = uploadAvatar;
const savePushToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pushToken } = req.body;
        yield prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { pushToken },
        });
        res.json({ message: 'Push token saved' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.savePushToken = savePushToken;
