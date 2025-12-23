#!/usr/bin/env python3
"""
測試腳本 - 驗證所有服務連線是否正常
"""
import sys
from config import Config

def test_config():
    """測試配置是否完整"""
    print("🔍 測試配置...")
    try:
        Config.validate()
        print("✅ 配置驗證成功")
        return True
    except ValueError as e:
        print(f"❌ 配置錯誤: {e}")
        return False

def test_mongodb():
    """測試 MongoDB 連線"""
    print("\n🔍 測試 MongoDB 連線...")
    try:
        from pymongo import MongoClient
        client = MongoClient(Config.MONGODB_URI, serverSelectionTimeoutMS=5000)
        # 嘗試連線
        client.server_info()
        print("✅ MongoDB 連線成功")
        client.close()
        return True
    except Exception as e:
        print(f"❌ MongoDB 連線失敗: {e}")
        return False

def test_line_api():
    """測試 LINE API 連線"""
    print("\n🔍 測試 LINE API...")
    try:
        from linebot import LineBotApi
        line_bot_api = LineBotApi(Config.LINE_CHANNEL_ACCESS_TOKEN)
        # 嘗試取得 Bot 資訊
        profile = line_bot_api.get_bot_info()
        print(f"✅ LINE API 連線成功")
        print(f"   Bot 名稱: {profile.display_name}")
        return True
    except Exception as e:
        print(f"❌ LINE API 連線失敗: {e}")
        return False

def test_llm_api():
    """測試 LLM API 連線"""
    print("\n🔍 測試 LLM (Groq) API...")
    try:
        import openai
        client = openai.OpenAI(
            api_key=Config.LLM_API_KEY,
            base_url=Config.LLM_API_BASE
        )
        # 嘗試簡單的 API 呼叫（使用目前可用的模型）
        models_to_try = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
        response = None
        for model in models_to_try:
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": "Hello"}],
                    max_tokens=10
                )
                break
            except:
                continue
        if not response:
            raise Exception("All models failed")
        print("✅ LLM API 連線成功")
        print(f"   測試回應: {response.choices[0].message.content[:50]}...")
        return True
    except Exception as e:
        print(f"❌ LLM API 連線失敗: {e}")
        return False

def main():
    """執行所有測試"""
    print("=" * 50)
    print("🧪 LINE Bot 連線測試")
    print("=" * 50)
    
    results = []
    results.append(("配置", test_config()))
    
    if results[0][1]:  # 只有配置正確才測試其他服務
        results.append(("MongoDB", test_mongodb()))
        results.append(("LINE API", test_line_api()))
        results.append(("LLM API", test_llm_api()))
    
    print("\n" + "=" * 50)
    print("📊 測試結果摘要")
    print("=" * 50)
    
    for name, result in results:
        status = "✅ 通過" if result else "❌ 失敗"
        print(f"{name}: {status}")
    
    all_passed = all(result for _, result in results)
    
    if all_passed:
        print("\n🎉 所有測試通過！可以開始使用 LINE Bot 了。")
        return 0
    else:
        print("\n⚠️  部分測試失敗，請檢查配置和連線設定。")
        return 1

if __name__ == "__main__":
    sys.exit(main())

