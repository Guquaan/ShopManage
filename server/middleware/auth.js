import jwt from 'jsonwebtoken';

// JWT 认证中间件 —— 验证请求是否携带有效 token
export const authMiddleware = (req, res, next) => {
  try {
    // 从 Authorization 头中提取 token（格式：Bearer <token>）
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, data: null, message: '未登录，请先登录' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'vue-demo-default-secret';

    // 验证 token
    const decoded = jwt.verify(token, secret);
    // 将解码后的用户信息挂载到 req 上，后续路由可直接使用
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, data: null, message: '登录已过期，请重新登录' });
    }
    return res.status(401).json({ code: 401, data: null, message: '无效的登录凭证' });
  }
};
