"""
測試按鈕 JSON 結構是否正確
"""
import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from persona_service import PersonaService

def test_button_json():
    """測試按鈕的 JSON 結構"""
    print("🔍 測試按鈕 JSON 結構...")
    
    try:
        # 建立按鈕
        buttons1 = PersonaService.create_persona_selection_buttons()
        
        # 轉換為字典（LINE SDK 內部格式）
        button_dict = buttons1.as_json_dict()
        
        print("\n✅ 按鈕 JSON 結構：")
        print(json.dumps(button_dict, indent=2, ensure_ascii=False))
        
        # 檢查必要欄位
        required_fields = ['type', 'altText', 'template']
        template_fields = ['type', 'text', 'actions']
        
        print("\n🔍 檢查必要欄位...")
        for field in required_fields:
            if field in button_dict:
                print(f"  ✅ {field}: {button_dict[field]}")
            else:
                print(f"  ❌ 缺少欄位: {field}")
        
        if 'template' in button_dict:
            template = button_dict['template']
            for field in template_fields:
                if field in template:
                    print(f"  ✅ template.{field}: {template[field]}")
                else:
                    print(f"  ❌ 缺少欄位: template.{field}")
            
            # 檢查 actions
            if 'actions' in template:
                print(f"\n  ✅ Actions 數量: {len(template['actions'])}")
                for i, action in enumerate(template['actions']):
                    print(f"    Action {i+1}:")
                    print(f"      type: {action.get('type', 'N/A')}")
                    print(f"      label: {action.get('label', 'N/A')}")
                    print(f"      text: {action.get('text', 'N/A')}")
        
        print("\n✅ JSON 結構檢查完成！")
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_button_json()

