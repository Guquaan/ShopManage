import { getCollection, connectDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'orders';

// 确保数据库已连接并获取 orders 集合
async function getOrdersCollection() {
  await connectDB();
  return getCollection(COLLECTION_NAME);
}

// 获取所有订单（支持可选筛选条件）
async function getOrders(filter = {}) {
  const col = await getOrdersCollection();
  return await col.find(filter).sort({ createTime: -1 }).toArray();
}

// 根据 ID 获取单个订单
async function getOrderById(id) {
  const col = await getOrdersCollection();
  return await col.findOne({ _id: new ObjectId(id) });
}

// 添加订单
async function addOrder(order) {
  const col = await getOrdersCollection();
  const doc = {
    ...order,
    quantity: order.quantity || 1,
    amount: order.amount || 0,
    status: order.status || '待付款',
    updateTime: new Date().toISOString(),
    createTime: new Date().toISOString()
  };
  // 移除 id 字段（MongoDB 使用 _id）
  delete doc._id;
  delete doc.id;
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// 更新订单
async function updateOrder(id, updates) {
  const col = await getOrdersCollection();
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

// 取消订单
async function cancelOrder(id) {
  const col = await getOrdersCollection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status: '已取消', updateTime: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  return result;
}

// 删除订单
async function deleteOrder(id) {
  const col = await getOrdersCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export { getOrders, getOrderById, addOrder, updateOrder, cancelOrder, deleteOrder };
