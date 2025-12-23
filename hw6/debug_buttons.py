"""
調試按鈕發送問題
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from linebot import LineBotApi
from linebot.exceptions import LineBotApiError
from persona_service import PersonaService

def test_button_sending():
    """測試按鈕發送"""
    print("🔍 測試按鈕發送功能...")
    
    # 檢查環境變數
    if not Config.LINE_CHANNEL_ACCESS_TOKEN:
        print("❌ LINE_CHANNEL_ACCESS_TOKEN 未設定")
        return False
    
    print(f"✅ LINE_CHANNEL_ACCESS_TOKEN: {Config.LINE_CHANNEL_ACCESS_TOKEN[:20]}...")
    
    try:
        # 初始化 LINE Bot API
        line_bot_api = LineBotApi(Config.LINE_CHANNEL_ACCESS_TOKEN)
        print("✅ LineBotApi 初始化成功")
        
        # 建立按鈕
        buttons1 = PersonaService.create_persona_selection_buttons()
        print(f"✅ 按鈕建立成功: {type(buttons1)}")
        
        # 檢查按鈕結構
        button_dict = buttons1.as_json_dict()
        print(f"✅ 按鈕 JSON 結構正確")
        print(f"   類型: {button_dict.get('type')}")
        print(f"   Template 類型: {button_dict.get('template', {}).get('type')}")
        print(f"   Actions 數量: {len(button_dict.get('template', {}).get('actions', []))}")
        
        # 測試發送（需要真實的 user_id，這裡只是檢查格式）
        print("\n📝 注意：")
        print("1. 按鈕需要使用 push_message 發送（需要使用者先加好友）")
        print("2. 或者使用 reply_message（需要 reply_token）")
        print("3. 確認 LINE 官方帳號有發送訊息的權限")
        print("4. 確認 webhook 已正確設定")
        
        return True
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_button_sending()

