import * as Goods from '../models/Goods.js';
import { ObjectId } from 'mongodb';

// 获取所有商品（支持搜索和筛选）
export const getGoods = async (req, res) => {
  try {
    const { name, category, status, keyword } = req.query;
    const filter = {};

    // 按名称模糊搜索
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    // 按分类精确筛选
    if (category) {
      filter.category = category;
    }
    // 按状态精确筛选
    if (status) {
      filter.status = status;
    }
    // 关键字搜索（名称或分类）
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } }
      ];
    }

    const goods = await Goods.getGoods(filter);
    res.json({ code: 200, data: goods, message: '获取成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 获取单个商品详情
export const getGoodsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的商品ID' });
    }
    const good = await Goods.getGoodsById(id);
    if (!good) {
      return res.status(404).json({ code: 404, data: null, message: '商品不存在' });
    }
    res.json({ code: 200, data: good, message: '获取成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 添加商品
export const addGoods = async (req, res) => {
  try {
    const { name, category, price, stock, status, image, description } = req.body;

    // 数据校验
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ code: 400, data: null, message: '商品名称、分类、价格、库存为必填项' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ code: 400, data: null, message: '价格必须为非负数字' });
    }
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ code: 400, data: null, message: '库存必须为非负整数' });
    }

    const newGoods = await Goods.addGoods({
      name,
      category,
      price,
      stock: Math.floor(stock),
      status: status || (stock < 10 ? '库存不足' : '在售'),
      image: image || '',
      description: description || ''
    });

    res.status(201).json({ code: 201, data: newGoods, message: '商品添加成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 更新商品
export const updateGoods = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的商品ID' });
    }

    const updates = req.body;
    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) {
      return res.status(400).json({ code: 400, data: null, message: '价格必须为非负数字' });
    }
    if (updates.stock !== undefined) {
      if (typeof updates.stock !== 'number' || updates.stock < 0) {
        return res.status(400).json({ code: 400, data: null, message: '库存必须为非负整数' });
      }
      // 根据库存自动更新状态
      if (updates.status === undefined) {
        updates.status = updates.stock < 10 ? '库存不足' : '在售';
      }
    }

    const updated = await Goods.updateGoods(id, updates);
    if (!updated) {
      return res.status(404).json({ code: 404, data: null, message: '商品不存在' });
    }
    res.json({ code: 200, data: updated, message: '商品更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 删除商品
export const deleteGoods = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的商品ID' });
    }

    const deleted = await Goods.deleteGoods(id);
    if (!deleted) {
      return res.status(404).json({ code: 404, data: null, message: '商品不存在' });
    }
    res.json({ code: 200, data: null, message: '商品删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 批量删除商品
export const batchDeleteGoods = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, data: null, message: '请提供要删除的商品ID列表' });
    }

    const invalidIds = ids.filter(id => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ code: 400, data: null, message: `无效的商品ID: ${invalidIds.join(', ')}` });
    }

    const count = await Goods.deleteManyGoods(ids);
    res.json({ code: 200, data: { deletedCount: count }, message: `成功删除 ${count} 个商品` });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};
