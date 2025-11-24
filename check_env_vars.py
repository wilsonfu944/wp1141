#!/usr/bin/env python3
"""檢查環境變數名稱是否正確"""
from config import Config

# 檢查所有需要的環境變數
required_vars = {
    "LINE_CHANNEL_ID": Config.LINE_CHANNEL_ID,
    "LINE_CHANNEL_SECRET": Config.LINE_CHANNEL_SECRET,
    "LINE_CHANNEL_ACCESS_TOKEN": Config.LINE_CHANNEL_ACCESS_TOKEN,
    "LLM_API_KEY": Config.LLM_API_KEY,
    "LLM_API_BASE": Config.LLM_API_BASE,
    "MONGODB_URI": Config.MONGODB_URI,
}

print("📋 環境變數檢查：\n")
print("程式碼中使用的變數名稱：")
for var_name in required_vars.keys():
    print(f"  ✅ {var_name}")

print("\n你設定的 Vercel 環境變數：")
vercel_vars = [
    "LINE_CHANNEL_ID",
    "LINE_CHANNEL_SECRET", 
    "LINE_CHANNEL_ACCESS_TOKEN",
    "LLM_API_KEY",
    "LLM_API_BASE",
    "MONGODB_URI"
]

for var in vercel_vars:
    if var in required_vars:
        print(f"  ✅ {var} - 正確")
    else:
        print(f"  ❌ {var} - 未在程式碼中找到")

print("\n比對結果：")
all_match = all(var in required_vars for var in vercel_vars)
if all_match:
    print("  ✅ 所有環境變數名稱都正確！")
else:
    print("  ❌ 有環境變數名稱不匹配")
