import express from 'express';
const router = express.Router();
import * as merchantController from '../controllers/merchantController.js';

// 获取商家信息
router.get('/info', merchantController.getMerchant);

// 更新商家信息
router.put('/update', merchantController.updateMerchant);

export default router;
