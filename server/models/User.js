import { getCollection, connectDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'users';

// 确保数据库已连接并获取 users 集合
async function getUsersCollection() {
  await connectDB();
  return getCollection(COLLECTION_NAME);
}

// 获取所有用户（支持可选筛选条件）
async function getUsers(filter = {}) {
  const col = await getUsersCollection();
  return await col.find(filter).sort({ updateTime: -1 }).toArray();
}

// 根据 ID 获取单个用户
async function getUserById(id) {
  const col = await getUsersCollection();
  return await col.findOne({ _id: new ObjectId(id) });
}

// 添加用户
async function addUser(user) {
  const col = await getUsersCollection();
  const doc = {
    ...user,
    status: user.status || '正常',
    updateTime: new Date().toISOString(),
    createTime: new Date().toISOString()
  };
  // 移除 id 字段（MongoDB 使用 _id）
  delete doc._id;
  delete doc.id;
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// 更新用户
async function updateUser(id, updates) {
  const col = await getUsersCollection();
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

// 根据用户名查找用户（用于登录验证）
async function findUserByUsername(username) {
  const col = await getUsersCollection();
  return await col.findOne({ username });
}

// 删除用户
async function deleteUser(id) {
  const col = await getUsersCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export { getUsers, getUserById, addUser, updateUser, deleteUser, findUserByUsername };
