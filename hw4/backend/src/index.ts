// 主應用程式入口
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { runMigrations } from './database/migrate';
import authRoutes from './routes/auth';
import routeRoutes from './routes/routes';
import { closeDatabase } from './database/connection';

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中介軟體
app.use(helmet());

// CORS 設定
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// 解析 JSON 請求
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服務運行正常',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/auth', authRoutes);
app.use('/api/routes', routeRoutes);

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '找不到指定的端點'
  });
});

// 全域錯誤處理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('未處理的錯誤:', err);
  
  res.status(500).json({
    success: false,
    error: '伺服器內部錯誤'
  });
});

// 優雅關閉處理
process.on('SIGINT', () => {
  console.log('\n正在關閉伺服器...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n正在關閉伺服器...');
  closeDatabase();
  process.exit(0);
});

// 啟動伺服器
const startServer = async () => {
  try {
    // 執行資料庫遷移
    await runMigrations();
    
    // 啟動伺服器
    app.listen(PORT, () => {
      console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
      console.log(`📊 健康檢查: http://localhost:${PORT}/health`);
      console.log(`🔐 認證端點: http://localhost:${PORT}/auth`);
      console.log(`🗺️  路線端點: http://localhost:${PORT}/api/routes`);
    });
  } catch (error) {
    console.error('啟動伺服器失敗:', error);
    process.exit(1);
  }
};

startServer();





