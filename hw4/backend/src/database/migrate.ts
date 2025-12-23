// 資料庫遷移腳本
import { db } from './connection';

export async function runMigrations(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 建立 users 表
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('建立 users 表失敗:', err);
          reject(err);
          return;
        }
        console.log('✓ users 表已建立');
      });

      // 建立 routes 表
      db.run(`
        CREATE TABLE IF NOT EXISTS routes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          startLat REAL NOT NULL,
          startLng REAL NOT NULL,
          endLat REAL NOT NULL,
          endLng REAL NOT NULL,
          distance REAL NOT NULL,
          date TEXT NOT NULL,
          createdBy INTEGER NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          FOREIGN KEY (createdBy) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('建立 routes 表失敗:', err);
          reject(err);
          return;
        }
        console.log('✓ routes 表已建立');
      });

      // 建立索引以提高查詢效能
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_routes_createdBy 
        ON routes(createdBy)
      `, (err) => {
        if (err) {
          console.error('建立索引失敗:', err);
        } else {
          console.log('✓ 索引已建立');
        }
      });

      console.log('✓ 資料庫遷移完成');
      resolve();
    });
  });
}



