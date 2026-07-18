import * as Order from '../models/Order.js';
import { ObjectId } from 'mongodb';

// 获取所有订单（支持搜索和筛选）
export const getOrders = async (req, res) => {
  try {
    const { orderNo, productName, customerName, status } = req.query;
    const filter = {};

    // 按订单编号模糊搜索
    if (orderNo) {
      filter.orderNo = { $regex: orderNo, $options: 'i' };
    }
    // 按商品名称模糊搜索
    if (productName) {
      filter.productName = { $regex: productName, $options: 'i' };
    }
    // 按客户名称模糊搜索
    if (customerName) {
      filter.customerName = { $regex: customerName, $options: 'i' };
    }
    // 按状态精确筛选
    if (status) {
      filter.status = status;
    }

    const orders = await Order.getOrders(filter);
    res.json({ code: 200, data: orders, message: '获取成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 获取单个订单详情
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的订单ID' });
    }
    const order = await Order.getOrderById(id);
    if (!order) {
      return res.status(404).json({ code: 404, data: null, message: '订单不存在' });
    }
    res.json({ code: 200, data: order, message: '获取成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 添加订单
export const addOrder = async (req, res) => {
  try {
    const { orderNo, productName, productImage, customerName, quantity, amount, status } = req.body;
    const parsedQuantity = typeof quantity === 'string' ? Number(quantity) : quantity;
    const parsedAmount = typeof amount === 'string' ? Number(amount) : amount;

    // 数据校验
    if (!orderNo || !productName || !customerName) {
      return res.status(400).json({ code: 400, data: null, message: '订单编号、商品名称、客户名称为必填项' });
    }
    if (parsedQuantity !== undefined && (typeof parsedQuantity !== 'number' || Number.isNaN(parsedQuantity) || parsedQuantity < 1)) {
      return res.status(400).json({ code: 400, data: null, message: '购买数量必须为大于0的数字' });
    }
    if (parsedAmount !== undefined && (typeof parsedAmount !== 'number' || Number.isNaN(parsedAmount) || parsedAmount < 0)) {
      return res.status(400).json({ code: 400, data: null, message: '订单金额必须为非负数字' });
    }

    const newOrder = await Order.addOrder({
      orderNo,
      productName,
      productImage: productImage || '',
      customerName,
      quantity: parsedQuantity || 1,
      amount: parsedAmount || 0,
      status: status || '待付款'
    });

    res.status(201).json({ code: 201, data: newOrder, message: '订单添加成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 更新订单
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的订单ID' });
    }

    const updates = req.body;
    const parsedQuantity = typeof updates.quantity === 'string' ? Number(updates.quantity) : updates.quantity;
    const parsedAmount = typeof updates.amount === 'string' ? Number(updates.amount) : updates.amount;
    if (parsedQuantity !== undefined && (typeof parsedQuantity !== 'number' || Number.isNaN(parsedQuantity) || parsedQuantity < 1)) {
      return res.status(400).json({ code: 400, data: null, message: '购买数量必须为大于0的数字' });
    }
    if (parsedAmount !== undefined && (typeof parsedAmount !== 'number' || Number.isNaN(parsedAmount) || parsedAmount < 0)) {
      return res.status(400).json({ code: 400, data: null, message: '订单金额必须为非负数字' });
    }
    if (parsedQuantity !== undefined) updates.quantity = parsedQuantity;
    if (parsedAmount !== undefined) updates.amount = parsedAmount;

    const updated = await Order.updateOrder(id, updates);
    if (!updated) {
      return res.status(404).json({ code: 404, data: null, message: '订单不存在' });
    }
    res.json({ code: 200, data: updated, message: '订单更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 取消订单
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的订单ID' });
    }

    const cancelled = await Order.cancelOrder(id);
    if (!cancelled) {
      return res.status(404).json({ code: 404, data: null, message: '订单不存在' });
    }
    res.json({ code: 200, data: cancelled, message: '订单已取消' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 删除订单
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的订单ID' });
    }

    const deleted = await Order.deleteOrder(id);
    if (!deleted) {
      return res.status(404).json({ code: 404, data: null, message: '订单不存在' });
    }
    res.json({ code: 200, data: null, message: '订单删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};
