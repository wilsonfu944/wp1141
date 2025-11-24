#!/usr/bin/env python3
"""
啟動腳本 - 用於啟動 LINE Bot 應用程式
"""
import sys
import os

# 確保專案根目錄在 Python 路徑中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from config import Config

if __name__ == "__main__":
    # 驗證配置
    try:
        Config.validate()
        print("✅ 配置驗證成功")
        print(f"📱 LINE Channel ID: {Config.LINE_CHANNEL_ID}")
        print(f"🤖 LLM API Base: {Config.LLM_API_BASE}")
        print(f"💾 MongoDB URI: {Config.MONGODB_URI[:30]}..." if Config.MONGODB_URI else "❌ MongoDB URI 未設定")
        print("\n🚀 啟動 Flask 應用程式...")
        import os
        port = int(os.getenv("PORT", 5001))
        print(f"📍 Webhook URL: http://localhost:{port}/webhook")
        print(f"🔧 管理後台: http://localhost:{port}/admin")
        print(f"\n💡 使用 ngrok 建立公開 URL:")
        print(f"   ngrok http {port}")
    except ValueError as e:
        print(f"❌ 配置錯誤: {e}")
        print("\n請確認 .env 檔案已建立且包含所有必要的環境變數。")
        sys.exit(1)
    
    # 啟動應用程式
    import os
    port = int(os.getenv("PORT", 5001))  # 使用 5001 避免與 AirPlay 衝突
    app.run(
        host="0.0.0.0",
        port=port,
        debug=Config.DEBUG
    )

