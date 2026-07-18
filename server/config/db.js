import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'Goods';

const client = new MongoClient(url);

let db = null;

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db(dbName);
    console.log(`✅ MongoDB 连接成功，数据库: ${dbName}`);
    return db;
  } catch (err) {
    console.error('❌ MongoDB 连接失败:', err.message);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error('数据库未连接，请先调用 connectDB()');
  }
  return db;
}

function getCollection(name) {
  return getDB().collection(name);
}

export { connectDB, getDB, getCollection };
