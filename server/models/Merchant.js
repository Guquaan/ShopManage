import { getCollection, connectDB } from '../config/db.js';

const COLLECTION_NAME = 'merchant';

// 确保数据库已连接并获取 merchant 集合
async function getMerchantCollection() {
  await connectDB();
  return getCollection(COLLECTION_NAME);
}

// 获取商家信息（全局只有一条记录）
async function getMerchant() {
  const col = await getMerchantCollection();
  return await col.findOne({});
}

// 更新或创建商家信息
async function updateMerchant(updates) {
  const col = await getMerchantCollection();
  updates.updateTime = new Date().toISOString();
  const result = await col.findOneAndUpdate(
    {},
    { $set: updates },
    { returnDocument: 'after', upsert: true }
  );
  return result;
}

export { getMerchant, updateMerchant };
