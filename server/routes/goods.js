const express = require('express');
const router = express.Router();
const goodsController = require('../controllers/goodsController')

router.get('/', goodsController.getGoods)  // 获取所有商品
router.post('/',goodsController.addGoods)  // 添加商品
router.put('/:id',goodsController.updateGoods) // 更新商品
router.delete('/:id',goodsController.deleteGoods) // 删除商品

module.exports = router;