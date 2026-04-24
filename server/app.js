const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/db')
dotenv.config()
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors()) // 允许跨域请求
app.use(express.json()) // 解析JSON请求体

// 路由注册
app.use('/api/goods', require('./routes/goods'))
// app.use('/api/users', require('./routes/users'))
// app.use('/api/orders', require('./routes/orders'))

// 测试数据库连接
sequelize.authenticate()
    .then(() => {
        console.log('数据库连接成功');
    })
    .catch(err => {
        console.error('无法连接到数据库:', err);
    });

// 启动服务
app.listen(PORT, () => {
    console.log(`服务器正在运行，端口号: ${PORT}`);
});