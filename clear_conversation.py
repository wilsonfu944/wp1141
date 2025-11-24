#!/usr/bin/env python3
"""
清除對話記錄腳本
用於重置特定用戶或所有用戶的對話記錄，方便重新測試
"""
import sys
from config import Config
from models.conversation import ConversationRepository

def clear_all_conversations():
    """清除所有對話記錄"""
    try:
        repo = ConversationRepository()
        count = repo.collection.count_documents({})
        repo.collection.delete_many({})
        repo.close()
        print(f"✅ 已清除 {count} 個對話記錄")
        return True
    except Exception as e:
        print(f"❌ 清除失敗: {e}")
        return False

def clear_user_conversation(user_id: str):
    """清除特定用戶的對話記錄"""
    try:
        repo = ConversationRepository()
        result = repo.collection.delete_many({"user_id": user_id})
        repo.close()
        print(f"✅ 已清除用戶 {user_id} 的 {result.deleted_count} 個對話記錄")
        return True
    except Exception as e:
        print(f"❌ 清除失敗: {e}")
        return False

def list_conversations():
    """列出所有對話記錄"""
    try:
        repo = ConversationRepository()
        conversations = repo.find_all(limit=100)
        repo.close()
        
        if not conversations:
            print("📭 目前沒有對話記錄")
            return
        
        print(f"\n📋 共有 {len(conversations)} 個對話記錄：\n")
        for i, conv in enumerate(conversations, 1):
            print(f"{i}. 用戶 ID: {conv.user_id}")
            print(f"   訊息數: {len(conv.messages)}")
            print(f"   最後更新: {conv.updated_at}")
            print()
    except Exception as e:
        print(f"❌ 列出失敗: {e}")

def main():
    """主函數"""
    if len(sys.argv) < 2:
        print("""
使用方法：
  python3 clear_conversation.py list                    # 列出所有對話
  python3 clear_conversation.py clear-all               # 清除所有對話
  python3 clear_conversation.py clear-user <user_id>    # 清除特定用戶的對話
  
範例：
  python3 clear_conversation.py list
  python3 clear_conversation.py clear-all
  python3 clear_conversation.py clear-user U1234567890abcdef
        """)
        return
    
    command = sys.argv[1].lower()
    
    if command == "list":
        list_conversations()
    elif command == "clear-all":
        confirm = input("⚠️  確定要清除所有對話記錄嗎？(yes/no): ")
        if confirm.lower() == "yes":
            clear_all_conversations()
        else:
            print("❌ 已取消")
    elif command == "clear-user":
        if len(sys.argv) < 3:
            print("❌ 請提供用戶 ID")
            print("   用法: python3 clear_conversation.py clear-user <user_id>")
            return
        user_id = sys.argv[2]
        confirm = input(f"⚠️  確定要清除用戶 {user_id} 的對話記錄嗎？(yes/no): ")
        if confirm.lower() == "yes":
            clear_user_conversation(user_id)
        else:
            print("❌ 已取消")
    else:
        print(f"❌ 未知指令: {command}")
        print("   使用 'python3 clear_conversation.py' 查看使用說明")

if __name__ == "__main__":
    main()



