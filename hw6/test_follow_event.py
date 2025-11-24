#!/usr/bin/env python3
"""
測試 Follow Event 是否正常工作
"""
from config import Config
from linebot import LineBotApi
from linebot.models import TextMessage

def test_push_message():
    """測試是否可以發送 push message"""
    try:
        line_bot_api = LineBotApi(Config.LINE_CHANNEL_ACCESS_TOKEN)
        
        # 這裡需要你的用戶 ID
        user_id = input("請輸入你的 LINE 用戶 ID（或按 Enter 跳過）: ").strip()
        
        if not user_id:
            print("❌ 需要用戶 ID 才能測試")
            print("\n如何取得用戶 ID：")
            print("1. 在 LINE 中發送訊息給 Bot")
            print("2. 查看應用程式日誌，會顯示用戶 ID")
            print("3. 或查看管理後台：http://localhost:5001/admin")
            return
        
        test_message = """💕 測試訊息

如果你收到這條訊息，表示 push message 功能正常！

現在請重新加入 Bot 好友，應該會自動收到歡迎訊息。"""
        
        line_bot_api.push_message(user_id, TextMessage(text=test_message))
        print(f"✅ 已發送測試訊息給用戶 {user_id}")
        print("請檢查你的 LINE，應該會收到測試訊息")
        
    except Exception as e:
        print(f"❌ 發送失敗: {e}")

if __name__ == "__main__":
    test_push_message()

