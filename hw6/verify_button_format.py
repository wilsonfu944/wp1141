"""
驗證按鈕格式是否符合 LINE Buttons Template 規範
"""
import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from persona_service import PersonaService

def verify_button_format():
    """驗證按鈕格式"""
    print("🔍 驗證按鈕格式是否符合 LINE Buttons Template 規範...\n")
    
    # LINE Buttons Template 的正確格式
    required_structure = {
        "type": "template",  # 最外層必須是 "template"
        "altText": "string",  # 必須有 altText
        "template": {
            "type": "buttons",  # template.type 必須是 "buttons"
            "title": "string (optional)",  # 可選
            "text": "string",  # 必須有 text
            "actions": [  # 必須有 actions 陣列
                {
                    "type": "message",  # action.type 必須是 "message", "uri", "postback", "datetimepicker" 等
                    "label": "string",  # 按鈕標籤
                    "text": "string"  # 點擊後發送的訊息（如果是 message type）
                }
            ]
        }
    }
    
    print("📋 LINE Buttons Template 規範：")
    print(json.dumps(required_structure, indent=2, ensure_ascii=False))
    print("\n" + "="*60 + "\n")
    
    try:
        # 建立按鈕
        buttons1 = PersonaService.create_persona_selection_buttons()
        button_dict = buttons1.as_json_dict()
        
        print("✅ 我們產生的按鈕 JSON：")
        print(json.dumps(button_dict, indent=2, ensure_ascii=False))
        print("\n" + "="*60 + "\n")
        
        # 驗證結構
        errors = []
        warnings = []
        
        # 檢查最外層
        if button_dict.get("type") != "template":
            errors.append(f"❌ 最外層 type 應該是 'template'，實際是: {button_dict.get('type')}")
        else:
            print("✅ 最外層 type: template")
        
        if not button_dict.get("altText"):
            errors.append("❌ 缺少 altText 欄位")
        else:
            print(f"✅ altText: {button_dict.get('altText')}")
        
        # 檢查 template
        template = button_dict.get("template", {})
        if not template:
            errors.append("❌ 缺少 template 欄位")
        else:
            print("✅ 有 template 欄位")
            
            if template.get("type") != "buttons":
                errors.append(f"❌ template.type 應該是 'buttons'，實際是: {template.get('type')}")
            else:
                print("✅ template.type: buttons")
            
            if not template.get("text"):
                errors.append("❌ template 缺少 text 欄位")
            else:
                print(f"✅ template.text: {template.get('text')[:30]}...")
            
            # 檢查 actions
            actions = template.get("actions", [])
            if not actions:
                errors.append("❌ template 缺少 actions 陣列")
            elif len(actions) == 0:
                errors.append("❌ actions 陣列為空")
            else:
                print(f"✅ actions 數量: {len(actions)}")
                
                for i, action in enumerate(actions):
                    if action.get("type") != "message":
                        errors.append(f"❌ action[{i}].type 應該是 'message'，實際是: {action.get('type')}")
                    if not action.get("label"):
                        errors.append(f"❌ action[{i}] 缺少 label")
                    if not action.get("text"):
                        errors.append(f"❌ action[{i}] 缺少 text")
        
        # 檢查 title（可選）
        if template.get("title"):
            print(f"✅ template.title: {template.get('title')}")
        else:
            warnings.append("⚠️ template.title 是可選的，但建議加上")
        
        print("\n" + "="*60 + "\n")
        
        if errors:
            print("❌ 發現錯誤：")
            for error in errors:
                print(f"  {error}")
            return False
        else:
            print("✅ 所有必要欄位都正確！")
            if warnings:
                print("\n⚠️ 警告：")
                for warning in warnings:
                    print(f"  {warning}")
            return True
        
    except Exception as e:
        print(f"❌ 驗證過程出錯: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = verify_button_format()
    if success:
        print("\n✅ 按鈕格式驗證通過！")
    else:
        print("\n❌ 按鈕格式有問題，需要修正！")

