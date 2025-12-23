// 使用者模型
import bcrypt from 'bcryptjs';
import { db } from '../database/connection';
import { User } from '../types';

export interface CreateUserRequest {
  email: string;
  password: string;
}

export class UserModel {
  // 根據 ID 查找使用者
  static async findById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, email, password, createdAt, updatedAt FROM users WHERE id = ?';
      db.get(sql, [id], (err, row: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // 根據 email 查找使用者
  static async findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, email, password, createdAt, updatedAt FROM users WHERE email = ?';
      db.get(sql, [email], (err, row: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // 建立新使用者（含密碼雜湊）
  static async create(userData: CreateUserRequest): Promise<User> {
    return new Promise(async (resolve, reject) => {
      try {
        // 雜湊密碼
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const sql = `
          INSERT INTO users (email, password, createdAt, updatedAt)
          VALUES (?, ?, datetime('now'), datetime('now'))
        `;
        
        db.run(sql, [userData.email, hashedPassword], function(err) {
          if (err) {
            reject(err);
          } else {
            const newUser: User = {
              id: this.lastID,
              email: userData.email,
              password: hashedPassword,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            resolve(newUser);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // 驗證密碼
  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('密碼驗證錯誤:', error);
      return false;
    }
  }
}



