import * as User from '../models/User.js';
import { ObjectId } from 'mongodb';

// 获取所有用户（支持搜索和筛选）
export const getUsers = async (req, res) => {
  try {
    const { username, realName, status, phone } = req.query;
    const filter = {};

    // 按用户名模糊搜索
    if (username) {
      filter.username = { $regex: username, $options: 'i' };
    }
    // 按真实姓名模糊搜索
    if (realName) {
      filter.realName = { $regex: realName, $options: 'i' };
    }
    // 按状态精确筛选
    if (status) {
      filter.status = status;
    }
    // 按手机号模糊搜索
    if (phone) {
      filter.phone = { $regex: phone, $options: 'i' };
    }

    const users = await User.getUsers(filter);
    // 不返回密码字段
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json({ code: 200, data: safeUsers, message: '获取成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 获取单个用户详情
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的用户ID' });
    }
    const user = await User.getUserById(id);
    if (!user) {
      return res.status(404).json({ code: 404, data: null, message: '用户不存在' });
    }
    const { password, ...safeUser } = user;
    res.json({ code: 200, data: safeUser, message: '获取成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 添加用户
export const addUser = async (req, res) => {
  try {
    const { username, realName, phone, address, status, password } = req.body;

    // 数据校验
    if (!username || !realName || !phone) {
      return res.status(400).json({ code: 400, data: null, message: '用户名、真实姓名、手机号为必填项' });
    }
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 400, data: null, message: '手机号格式不正确' });
    }

    const newUser = await User.addUser({
      username,
      realName,
      phone,
      address: address || '',
      status: status || '正常',
      password: password || ''
    });

    res.status(201).json({ code: 201, data: newUser, message: '用户添加成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 更新用户
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的用户ID' });
    }

    const updates = req.body;
    // 手机号校验
    if (updates.phone && !/^1[3-9]\d{9}$/.test(updates.phone)) {
      return res.status(400).json({ code: 400, data: null, message: '手机号格式不正确' });
    }

    const updated = await User.updateUser(id, updates);
    if (!updated) {
      return res.status(404).json({ code: 404, data: null, message: '用户不存在' });
    }
    res.json({ code: 200, data: updated, message: '用户更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 删除用户
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的用户ID' });
    }

    const deleted = await User.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ code: 404, data: null, message: '用户不存在' });
    }
    res.json({ code: 200, data: null, message: '用户删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};
