"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../lib/upload");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/me', user_controller_1.getMe);
router.patch('/profile', user_controller_1.updateProfile);
router.patch('/email', user_controller_1.updateEmail);
router.patch('/password', user_controller_1.changePassword);
router.post('/avatar', (req, res, next) => {
    upload_1.upload.single('avatar')(req, res, (err) => {
        if (err && !req.file) {
            console.error('Upload middleware error:', err);
            return res.status(400).json({ message: err.message, details: err.toString() });
        }
        if (err)
            console.warn('Non-fatal upload warning:', err.message);
        next();
    });
}, user_controller_1.uploadAvatar);
router.post('/push-token', user_controller_1.savePushToken);
router.patch('/deactivate', user_controller_1.deactivateAccount);
router.delete('/delete', user_controller_1.deleteAccount);
exports.default = router;
