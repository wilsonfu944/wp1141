// SQLite 資料庫連接設定
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL || 'file:./dev.db';
const dbFilePath = dbPath.replace('file:', '');

// 建立資料庫連接
export const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('資料庫連接失敗:', err.message);
  } else {
    console.log('SQLite 資料庫連接成功');
  }
});

// 關閉資料庫連接
export const closeDatabase = () => {
  db.close((err) => {
    if (err) {
      console.error('關閉資料庫失敗:', err.message);
    } else {
      console.log('資料庫連接已關閉');
    }
  });
};



