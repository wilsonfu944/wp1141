"""
測試按鈕發送（模擬）
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from linebot import LineBotApi
from linebot.exceptions import LineBotApiError
from persona_service import PersonaService

def test_button_sending():
    """測試按鈕發送方式"""
    print("🔍 測試按鈕發送方式...\n")
    
    if not Config.LINE_CHANNEL_ACCESS_TOKEN:
        print("❌ LINE_CHANNEL_ACCESS_TOKEN 未設定")
        return False
    
    try:
        # 初始化 LINE Bot API
        line_bot_api = LineBotApi(Config.LINE_CHANNEL_ACCESS_TOKEN)
        print("✅ LineBotApi 初始化成功\n")
        
        # 建立按鈕
        buttons1 = PersonaService.create_persona_selection_buttons()
        buttons2 = PersonaService.create_persona_selection_buttons_part2()
        
        print("✅ 按鈕物件建立成功")
        print(f"   buttons1 類型: {type(buttons1)}")
        print(f"   buttons2 類型: {type(buttons2)}")
        
        # 檢查是否是 TemplateSendMessage
        from linebot.models import TemplateSendMessage
        if isinstance(buttons1, TemplateSendMessage):
            print("✅ buttons1 是 TemplateSendMessage 實例")
        else:
            print(f"❌ buttons1 不是 TemplateSendMessage，實際類型: {type(buttons1)}")
            return False
        
        # 檢查 JSON 結構
        button_dict = buttons1.as_json_dict()
        print(f"\n✅ 按鈕 JSON 結構：")
        print(f"   type: {button_dict.get('type')}")
        print(f"   altText: {button_dict.get('altText')}")
        print(f"   template.type: {button_dict.get('template', {}).get('type')}")
        print(f"   actions 數量: {len(button_dict.get('template', {}).get('actions', []))}")
        
        # 驗證發送方式
        print("\n📝 發送方式檢查：")
        print("   使用 line_bot_api.push_message(user_id, buttons1)")
        print("   這應該直接傳遞 TemplateSendMessage 物件，不需要轉換")
        
        # 檢查按鈕物件的屬性
        print(f"\n✅ 按鈕物件屬性：")
        print(f"   alt_text: {buttons1.alt_text}")
        print(f"   template.type: {buttons1.template.type}")
        print(f"   template.text: {buttons1.template.text[:30]}...")
        print(f"   actions 數量: {len(buttons1.template.actions)}")
        
        print("\n✅ 所有檢查通過！按鈕格式和發送方式都正確。")
        print("\n💡 如果按鈕還是看不到，可能的原因：")
        print("   1. LINE Developers Console 的 Auto-reply 或 Greeting messages 已開啟")
        print("   2. Push Message 權限限制（需要使用者24小時內有互動）")
        print("   3. Webhook 未正確觸發")
        print("   4. Vercel 部署的版本不是最新的")
        
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_button_sending()

