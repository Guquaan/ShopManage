import { getCollection, connectDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'goods';

// 确保数据库已连接并获取 goods 集合
async function getGoodsCollection() {
  await connectDB();
  return getCollection(COLLECTION_NAME);
}

// 获取所有商品（支持可选筛选条件）
async function getGoods(filter = {}) {
  const col = await getGoodsCollection();
  return await col.find(filter).sort({ updateTime: -1 }).toArray();
}

// 根据 ID 获取单个商品
async function getGoodsById(id) {
  const col = await getGoodsCollection();
  return await col.findOne({ _id: new ObjectId(id) });
}

// 添加商品
async function addGoods(good) {
  const col = await getGoodsCollection();
  const doc = {
    ...good,
    sales: good.sales || 0,
    updateTime: new Date().toISOString(),
    createTime: new Date().toISOString()
  };
  // 移除 id 字段（MongoDB 使用 _id）
  delete doc._id;
  delete doc.id;
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// 更新商品
async function updateGoods(id, updates) {
  const col = await getGoodsCollection();
  // 不允许直接修改 _id
  delete updates._id;
  delete updates.id;
  updates.updateTime = new Date().toISOString();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result;
}

// 删除商品
async function deleteGoods(id) {
  const col = await getGoodsCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// 批量删除
async function deleteManyGoods(ids) {
  const col = await getGoodsCollection();
  const objectIds = ids.map(id => new ObjectId(id));
  const result = await col.deleteMany({ _id: { $in: objectIds } });
  return result.deletedCount;
}

export { getGoods, getGoodsById, addGoods, updateGoods, deleteGoods, deleteManyGoods };
