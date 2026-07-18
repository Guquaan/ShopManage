# 商品后台管理系统

基于 **Vue 3 + TypeScript + Element Plus** 前端和 **Node.js + Express + MongoDB** 后端的商品管理后台系统，支持商品的增删改查及多维度数据统计。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API) + TypeScript |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP 请求 | Axios |
| 图表可视化 | ECharts 6 |
| 后端框架 | Express 5 |
| 数据库 | MongoDB（原生驱动 mongodb 7.x） |
| 模块系统 | ES Modules（`"type": "module"`） |

---

## 项目目录结构

```
vue-demo/
├── server/                          # 后端服务
│   ├── app.js                       # Express 应用入口，注册中间件和路由
│   ├── .env                         # 环境变量配置（端口、MongoDB连接）
│   ├── package.json                 # 后端依赖（type: "module"）
│   ├── config/
│   │   └── db.js                    # MongoDB 连接管理（connectDB / getDB / getCollection）
│   ├── models/
│   │   └── Goods.js                 # 商品数据模型（CRUD 操作封装）
│   ├── controllers/
│   │   └── goodsController.js       # 商品接口控制器（请求校验、业务逻辑）
│   └── routes/
│       └── goods.js                 # 商品路由定义
├── src/                             # 前端源码
│   ├── api/
│   │   └── request.js               # Axios 实例，封装请求/响应拦截器
│   ├── store/
│   │   ├── Goods.ts                 # 商品 Pinia Store（API 调用 + 本地状态）
│   │   ├── Order.ts                 # 订单 Store
│   │   ├── User.ts                  # 用户 Store
│   │   ├── Merchant.ts              # 商家 Store
│   │   ├── Login.ts                 # 登录 Store
│   │   └── break.ts                 # 面包屑/导航 Store
│   ├── routers/
│   │   └── index.ts                 # Vue Router 路由配置
│   ├── view/
│   │   ├── Login/Login.vue          # 登录页面
│   │   ├── Home/Home.vue            # 首页布局
│   │   ├── Navside/index.vue        # 侧边导航栏
│   │   └── Component/
│   │       ├── GoodsMange.vue       # ★ 商品管理（增删改查、搜索、统计）
│   │       ├── GoodsHouse.vue       # 库存管理
│   │       ├── GoodsOrder.vue       # 订单管理
│   │       ├── UserMange.vue        # 用户管理
│   │       ├── MerchantMessage.vue  # 商家信息
│   │       ├── SalesReport.vue      # 销售报表
│   │       ├── SumAll.vue           # 数据总览
│   │       └── Setting.vue          # 系统设置
│   ├── navlead/comdata.ts           # 导航数据
│   ├── locales/                     # 国际化（中/英文）
│   ├── data/                        # 静态资源和模拟数据
│   └── main.ts                      # 应用入口
├── package.json                     # 前端依赖
├── vite.config.ts                   # Vite 构建配置
├── tsconfig.json                    # TypeScript 配置
└── README.md                        # 项目说明文档
```

---

## 环境要求

- **Node.js** >= 18.x
- **MongoDB** >= 6.x（本地运行，默认端口 27017）
- **npm** >= 9.x

---

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖（项目根目录）
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 2. 配置数据库

确保本地 MongoDB 服务已启动（默认 `mongodb://localhost:27017`）。

如需修改数据库连接，编辑 `server/.env`：

```env
PORT = 3300
MONGO_URI = mongodb://localhost:27017
DB_NAME = Goods
```

> **注意**：数据库名称 `Goods` 会在首次写入数据时自动创建，无需手动建库。

### 3. 启动后端服务

```bash
cd server
npm run dev
```

控制台输出：

```
✅ MongoDB 连接成功，数据库: Goods
🚀 服务器正在运行，端口号: 3300
📦 API 地址: http://localhost:3300/api
```

### 4. 启动前端开发服务器

```bash
# 项目根目录
npm run dev
```

默认访问地址：`http://localhost:5173`

---

## 后端 API 接口文档

所有接口基础路径：`http://localhost:3300/api`

### 商品管理接口 `/api/goods`

#### 1. 获取商品列表

```
GET /api/goods/list
```

**查询参数（可选）：**

| 参数 | 类型 | 说明 |
|------|------|------|
| name | string | 商品名称（模糊搜索） |
| category | string | 商品分类（精确匹配） |
| status | string | 商品状态（精确匹配） |
| keyword | string | 关键字搜索（匹配名称或分类） |

**响应示例：**
```json
{
  "code": 200,
  "data": [
    {
      "_id": "60f7e5c8a1b2c3d4e5f6a7b8",
      "name": "笔记本电脑",
      "category": "电子产品",
      "price": 5999,
      "stock": 50,
      "sales": 120,
      "status": "在售",
      "image": "...",
      "description": "高性能办公笔记本",
      "updateTime": "2026-07-14T08:00:00.000Z",
      "createTime": "2026-07-01T08:00:00.000Z"
    }
  ],
  "message": "获取成功"
}
```

#### 2. 获取商品详情

```
GET /api/goods/detail/:id
```

#### 3. 添加商品

```
POST /api/goods/add
```

**请求体（JSON）：**
```json
{
  "name": "商品名称",
  "category": "电子产品",
  "price": 1999,
  "stock": 100,
  "status": "在售",
  "image": "https://example.com/image.png",
  "description": "商品描述（可选）"
}
```

**必填字段：** `name`、`category`、`price`、`stock`

#### 4. 更新商品

```
PUT /api/goods/update/:id
```

**请求体：** 只需传递需要更新的字段（部分更新）。

> 库存更新时，系统会自动判断状态：`stock < 10` → `库存不足`，否则 → `在售`

#### 5. 删除商品

```
DELETE /api/goods/delete/:id
```

#### 6. 批量删除

```
POST /api/goods/batch-delete
```

**请求体：**
```json
{
  "ids": ["60f7...a7b8", "60f7...c9d0"]
}
```

#### 7. 健康检查

```
GET /api/health
```

---

## 数据库设计

### 商品集合（goods）

MongoDB 会在首次写入时自动创建 `Goods` 数据库和 `goods` 集合。

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | ObjectId | MongoDB 自动生成的唯一标识 |
| `name` | String | 商品名称（必填） |
| `category` | String | 商品分类（电子产品/服装鞋帽/食品饮料/家居用品） |
| `price` | Number | 商品价格（必填，≥0） |
| `stock` | Number | 库存数量（必填，≥0 整数） |
| `sales` | Number | 累计销量（默认 0） |
| `status` | String | 商品状态（在售/下架/库存不足） |
| `image` | String | 商品图片（Base64 或 URL） |
| `description` | String | 商品描述（可选） |
| `createTime` | ISODate | 创建时间（自动生成） |
| `updateTime` | ISODate | 最后更新时间（自动更新） |

### 手动初始化测试数据

可以通过 API 添加测试数据，或者使用 MongoDB Shell：

```js
// 在 server 目录下启动 Node.js REPL
// node -e "
const { connectDB, getCollection } = require('./config/db.js');
(async () => {
  await connectDB();
  const col = getCollection('goods');
  await col.insertMany([
    { name: '笔记本电脑 Pro', category: '电子产品', price: 6999, stock: 50, sales: 230, status: '在售', updateTime: new Date(), createTime: new Date() },
    { name: '无线蓝牙耳机', category: '电子产品', price: 299, stock: 200, sales: 1560, status: '在售', updateTime: new Date(), createTime: new Date() },
    { name: '男士休闲T恤', category: '服装鞋帽', price: 159, stock: 5, sales: 420, status: '库存不足', updateTime: new Date(), createTime: new Date() },
    { name: '有机坚果礼盒', category: '食品饮料', price: 89, stock: 300, sales: 890, status: '在售', updateTime: new Date(), createTime: new Date() },
    { name: '北欧简约台灯', category: '家居用品', price: 259, stock: 0, sales: 150, status: '库存不足', updateTime: new Date(), createTime: new Date() }
  ]);
  console.log('测试数据插入成功');
  process.exit();
})();
// "
```

---

## 前端核心功能

### 商品管理页面（GoodsMange.vue）

- **数据展示**：以表格形式展示所有商品，支持排序、分页
- **搜索筛选**：按名称（模糊）、分类、状态筛选商品
- **统计卡片**：总商品数、在售商品数/占比、库存预警数、总库存量
- **新增商品**：弹窗表单，包含名称、分类、价格、库存、状态、图片上传
- **编辑商品**：回填表单数据，支持修改所有字段
- **删除商品**：单条删除（含确认弹窗）和批量删除
- **库存预警**：库存低于 10 自动标记为"库存不足"，红色高亮显示
- **数据持久化**：所有操作通过 API 与 MongoDB 同步

---

## 关键修复说明

本次更新对项目进行了以下重要修复和优化：

### 后端修复

1. **数据库连接重构**（`server/config/db.js`）
   - 统一使用 ES Module 语法（`import`/`export`）
   - 数据库名称改为 `Goods`
   - 添加连接状态缓存和自动重连机制

2. **商品模型完善**（`server/models/Goods.js`）
   - 补全 CRUD 全部方法：`getGoods`、`getGoodsById`、`addGoods`、`updateGoods`、`deleteGoods`、`deleteManyGoods`
   - 使用 MongoDB 原生 `ObjectId` 进行文档定位
   - 支持 `findOneAndUpdate` 返回更新后的文档

3. **控制器重写**（`server/controllers/goodsController.js`）
   - 移除所有 Sequelize/MySQL 语法（`findByPk`、`destroy` 等）
   - 添加完善的参数校验（价格、库存合法性检查）
   - 统一响应格式：`{ code, data, message }`
   - 新增搜索筛选功能（名称模糊、分类/状态精确）
   - 新增批量删除接口

4. **路由优化**（`server/routes/goods.js`）
   - 统一 ES Module 导入导出
   - 增加详情查询和批量删除路由

5. **配置清理**
   - `.env`：移除 MySQL 相关配置，改为 MongoDB 连接
   - `package.json`：移除 `mysql2` 和 `sequelize` 依赖

### 前端修复

1. **API 对接修复**（`src/api/request.js`）
   - baseURL 从 `localhost:3000` 改为 `localhost:3300/api`
   - 添加响应拦截器统一处理错误

2. **商品 Store 重写**（`src/store/Goods.ts`）
   - 所有方法对接后端 `/api/goods/*` 接口
   - 保留 `handleStock`、`updateGoodsStock` 等兼容方法
   - 添加 `normalizeProduct` 处理 MongoDB `_id` 映射
   - 添加后端不可用时的 localStorage 降级策略

3. **商品管理页面优化**（`src/view/Component/GoodsMange.vue`）
   - 修复搜索选项中 `'家居用品'` 的中文引号 bug
   - 移除模拟数据生成逻辑，改为 API 实时获取
   - 新增批量删除功能
   - 优化统计卡片（动态计算在售占比、总库存等）
   - M​​ongoDB `_id` 字段显示适配
   - 新增商品描述字段
   - 优化 UI 样式，更接近企业级后台风格

---

## 开发命令

```bash
# 前端开发
npm run dev              # 启动 Vite 开发服务器
npm run build            # 构建生产版本
npm run preview          # 预览构建结果

# 后端开发
cd server
npm run dev              # nodemon 热重载启动
npm start                # 直接启动
```

---

## 常见问题

### Q: 后端启动时报 "MongoDB 连接失败"？
A: 请确认 MongoDB 服务已启动。Windows 上可通过服务管理器或 `mongod` 命令启动。

### Q: 前端页面提示"无法连接后端服务"？
A: 确认后端已启动在 3300 端口，且 `src/api/request.js` 中 `baseURL` 配置正确。

### Q: 商品列表为空？
A: 新初始化的数据库没有数据，请通过前端"新增商品"功能添加数据，或使用上方"数据库设计"章节的脚本插入测试数据。

### Q: 如何修改后端端口？
A: 编辑 `server/.env` 中的 `PORT` 值，同时需要同步修改前端 `src/api/request.js` 中的 `baseURL`。
