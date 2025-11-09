// 認證相關路由
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { validateRegister, validateLogin } from '../middleware/validation';
import { RegisterRequest, LoginRequest, AuthResponse, ApiResponse } from '../types';

const router = Router();

// 註冊
router.post('/register', validateRegister, async (req: Request, res: Response) => {
  try {
    const { email, password }: RegisterRequest = req.body;

    // 檢查 email 是否已存在
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: '此電子郵件已被註冊'
      } as ApiResponse);
    }

    // 建立新使用者
    const newUser = await UserModel.create({ email, password });

    // 產生 JWT token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const response: AuthResponse = {
      token,
      user: {
        id: newUser.id,
        email: newUser.email
      }
    };

    res.status(201).json({
      success: true,
      data: response,
      message: '註冊成功'
    } as ApiResponse<AuthResponse>);

  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      success: false,
      error: '註冊失敗，請稍後再試'
    } as ApiResponse);
  }
});

// 登入
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // 查找使用者
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '電子郵件或密碼錯誤'
      } as ApiResponse);
    }

    // 驗證密碼
    const isValidPassword = await UserModel.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '電子郵件或密碼錯誤'
      } as ApiResponse);
    }

    // 產生 JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email
      }
    };

    res.json({
      success: true,
      data: response,
      message: '登入成功'
    } as ApiResponse<AuthResponse>);

  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({
      success: false,
      error: '登入失敗，請稍後再試'
    } as ApiResponse);
  }
});

// 登出（客戶端需要刪除 token）
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '登出成功'
  } as ApiResponse);
});

// 驗證 token 有效性
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未提供存取權杖'
      } as ApiResponse);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '無效的存取權杖'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email
      },
      message: '權杖有效'
    } as ApiResponse);

  } catch (error) {
    res.status(401).json({
      success: false,
      error: '無效的存取權杖'
    } as ApiResponse);
  }
});

export default router;





