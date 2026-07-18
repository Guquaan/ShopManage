import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as User from '../models/User.js';

const SALT_ROUNDS = 10; // bcrypt 加密强度

// 生成 JWT token
function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'vue-demo-default-secret';
  return jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username
    },
    secret,
    { expiresIn: '7d' } // token 有效期 7 天
  );
}

// 注册
export const register = async (req, res) => {
  try {
    const { username, password, realName, phone } = req.body;

    // 数据校验
    if (!username || !password) {
      return res.status(400).json({ code: 400, data: null, message: '用户名和密码为必填项' });
    }
    if (password.length < 4 || password.length > 16) {
      return res.status(400).json({ code: 400, data: null, message: '密码长度需要4-16位' });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ code: 409, data: null, message: '该用户名已被注册' });
    }

    // 对密码进行哈希加密
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 创建用户
    const newUser = await User.addUser({
      username,
      realName: realName || username,
      phone: phone || username,
      password: hashedPassword,
      status: '正常'
    });

    // 生成 token
    const token = generateToken(newUser);

    // 返回结果（不返回密码）
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      code: 201,
      data: { token, user: userWithoutPassword },
      message: '注册成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 登录
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 数据校验
    if (!username || !password) {
      return res.status(400).json({ code: 400, data: null, message: '用户名和密码为必填项' });
    }

    // 查找用户
    const user = await User.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ code: 401, data: null, message: '用户名或密码错误' });
    }

    // 比较密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: 401, data: null, message: '用户名或密码错误' });
    }

    // 生成 token
    const token = generateToken(user);

    // 返回结果（不返回密码）
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      code: 200,
      data: { token, user: userWithoutPassword },
      message: '登录成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};

// 获取当前登录用户信息
export const getMe = async (req, res) => {
  try {
    const user = await User.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ code: 404, data: null, message: '用户不存在' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ code: 200, data: userWithoutPassword, message: '获取成功' });
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message });
  }
};
