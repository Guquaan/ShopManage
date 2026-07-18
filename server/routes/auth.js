import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

// 注册
router.post('/register', authController.register);

// 登录
router.post('/login', authController.login);

// 获取当前用户信息（需要登录）
router.get('/me', authMiddleware, authController.getMe);

export default router;
