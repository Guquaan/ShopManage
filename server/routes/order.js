import express from 'express';
const router = express.Router();
import * as orderController from '../controllers/orderController.js';

// 获取所有订单（支持 ?orderNo=&productName=&customerName=&status= 筛选）
router.get('/list', orderController.getOrders);

// 获取单个订单详情
router.get('/detail/:id', orderController.getOrderById);

// 添加订单
router.post('/add', orderController.addOrder);

// 更新订单
router.put('/update/:id', orderController.updateOrder);

// 取消订单
router.put('/cancel/:id', orderController.cancelOrder);

// 删除订单
router.delete('/delete/:id', orderController.deleteOrder);

export default router;
