// JWT 認證中介軟體
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

// 擴展 Request 介面以包含使用者資訊
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

// JWT 認證中介軟體
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '存取權杖遺失'
      });
    }

    // 驗證 JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    
    // 查找使用者
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '無效的存取權杖'
      });
    }

    // 將使用者資訊附加到請求物件
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('JWT 驗證錯誤:', error);
    return res.status(401).json({
      success: false,
      error: '無效的存取權杖'
    });
  }
};

// 可選的認證中介軟體（用於某些不需要強制登入的端點）
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
      const user = await UserModel.findById(decoded.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email
        };
      }
    }

    next();
  } catch (error) {
    // 可選認證失敗時不中斷請求
    next();
  }
};





