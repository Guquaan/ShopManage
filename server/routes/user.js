import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';

// 获取所有用户（支持 ?username=&realName=&status=&phone= 筛选）
router.get('/list', userController.getUsers);

// 获取单个用户详情
router.get('/detail/:id', userController.getUserById);

// 添加用户
router.post('/add', userController.addUser);

// 更新用户
router.put('/update/:id', userController.updateUser);

// 删除用户
router.delete('/delete/:id', userController.deleteUser);

export default router;
