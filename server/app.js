import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import goodsRouter from './routes/goods.js';
import userRouter from './routes/user.js';
import orderRouter from './routes/order.js';
import merchantRouter from './routes/merchant.js';
import authRouter from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3300;

// 中间件
app.use(cors());          // 允许跨域请求
app.use(express.json());  // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码请求体

// 路由注册
// 认证路由（公开访问）
app.use('/api/auth', authRouter);

// 以下路由需要登录认证
app.use('/api/goods', authMiddleware, goodsRouter);
app.use('/api/users', authMiddleware, userRouter);
app.use('/api/orders', authMiddleware, orderRouter);
app.use('/api/merchant', authMiddleware, merchantRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(` 服务器正在运行，端口号: ${PORT}`);
    console.log(` API 地址: http://localhost:${PORT}/api`);
  });
}

start();
