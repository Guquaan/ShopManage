import express from 'express';
const router = express.Router();
import * as goodsController from '../controllers/goodsController.js';

// 获取所有商品（支持 ?name=&category=&status=&keyword= 筛选）
router.get('/list', goodsController.getGoods);

// 获取单个商品详情
router.get('/detail/:id', goodsController.getGoodsById);

// 添加商品
router.post('/add', goodsController.addGoods);

// 更新商品
router.put('/update/:id', goodsController.updateGoods);

// 删除商品
router.delete('/delete/:id', goodsController.deleteGoods);

// 批量删除商品
router.post('/batch-delete', goodsController.batchDeleteGoods);

export default router;
