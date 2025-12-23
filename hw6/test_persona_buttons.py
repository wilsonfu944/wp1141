"""
測試人格選擇按鈕功能
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from persona_service import PersonaService
from linebot.models import TemplateSendMessage

def test_buttons():
    """測試按鈕建立"""
    print("🔍 測試人格選擇按鈕...")
    
    try:
        # 測試第一組按鈕
        buttons1 = PersonaService.create_persona_selection_buttons()
        print(f"✅ 第一組按鈕建立成功")
        print(f"   類型: {type(buttons1)}")
        print(f"   標題: {buttons1.template.title}")
        print(f"   文字: {buttons1.template.text}")
        print(f"   按鈕數: {len(buttons1.template.actions)}")
        for i, action in enumerate(buttons1.template.actions):
            print(f"   按鈕 {i+1}: {action.label} -> {action.text}")
        
        # 測試第二組按鈕
        buttons2 = PersonaService.create_persona_selection_buttons_part2()
        print(f"\n✅ 第二組按鈕建立成功")
        print(f"   類型: {type(buttons2)}")
        print(f"   標題: {buttons2.template.title}")
        print(f"   文字: {buttons2.template.text}")
        print(f"   按鈕數: {len(buttons2.template.actions)}")
        for i, action in enumerate(buttons2.template.actions):
            print(f"   按鈕 {i+1}: {action.label} -> {action.text}")
        
        print("\n✅ 所有測試通過！按鈕功能正常。")
        return True
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_buttons()

