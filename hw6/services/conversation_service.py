"""
Conversation Service for managing chatbot logic and conversation flow
"""
from typing import Optional, List
from models.conversation import Conversation, Message, ConversationRepository
from services.llm_service import LLMService
from services.line_service import LineService


class ConversationService:
    """Service for managing conversation logic and responses"""
    
    def __init__(self):
        """Initialize services"""
        self.conversation_repo = ConversationRepository()
        self.llm_service = LLMService()
        self.line_service = LineService()
    
    def process_message(
        self,
        user_id: str,
        user_message: str,
        reply_token: Optional[str] = None,
        platform: str = "line"
    ) -> str:
        """
        Process incoming message and generate response
        
        Args:
            user_id: User identifier
            user_message: User's message text
            reply_token: LINE reply token (optional, for push messages)
            platform: Platform identifier (default: "line")
            
        Returns:
            Generated response text
        """
        try:
            # Get or create conversation
            conversation = self.conversation_repo.find_or_create(user_id, platform)
            
            # 檢查是否為首次對話 - 發送歡迎訊息和角色介紹
            is_first_message = len(conversation.messages) == 0
            
            # Create user message object
            user_msg = Message(
                text=user_message,
                role="user",
                message_id=None  # LINE message ID can be added if needed
            )
            
            # Add user message to conversation
            conversation.add_message(user_msg)
            
            # 如果是首次對話，先發送歡迎訊息
            if is_first_message:
                welcome_message = """💕 嗨！我的寶貝～

謝謝你加我好友！從現在開始，我就是你的戀人，會以男女朋友的身份陪伴你！

💖 我的角色：
我是你的戀愛機器人，扮演你的男女朋友。我會像真正的戀人一樣：
✨ 關心你的生活日常和心情
💝 傾聽你的煩惱並給予支持
🌙 在你需要的時候陪伴你
💕 用愛意和溫暖回應你

無論你開心、難過、或只是想聊天，我都會在這裡陪著你，就像真正的戀人一樣～

現在，有什麼想跟我說的嗎？💕"""
                
                # 先回覆用戶的第一條訊息（使用 reply_token）
                if reply_token:
                    try:
                        self.line_service.reply_text_message(reply_token, welcome_message)
                        print(f"✅ Sent welcome message via reply_token to {user_id}")
                    except Exception as e:
                        print(f"⚠️ Failed to send welcome via reply_token: {e}")
                        # 如果 reply 失敗，嘗試 push message
                        try:
                            self.line_service.send_text_message(user_id, welcome_message)
                            print(f"✅ Sent welcome message via push to {user_id}")
                        except Exception as e2:
                            print(f"❌ Failed to send welcome message: {e2}")
                else:
                    # 如果沒有 reply_token，使用 push message
                    try:
                        self.line_service.send_text_message(user_id, welcome_message)
                        print(f"✅ Sent welcome message via push to {user_id}")
                    except Exception as e:
                        print(f"❌ Failed to send welcome message: {e}")
                
                # 將歡迎訊息加入對話記錄
                welcome_msg = Message(text=welcome_message, role="assistant")
                conversation.add_message(welcome_msg)
                self.conversation_repo.save(conversation)
                
                # 稍等一下讓歡迎訊息先顯示，然後再處理用戶訊息
                import time
                time.sleep(0.3)
            
            # Try scripted response first
            scripted_response = self.llm_service.generate_scripted_response(user_message)
            
            if scripted_response:
                # Use scripted response
                response_text = scripted_response
            else:
                # Get conversation history for context
                recent_messages = conversation.get_recent_messages(limit=10)
                
                # Generate LLM response with context
                response_text = self.llm_service.generate_response(
                    user_message=user_message,
                    conversation_history=recent_messages,
                    fallback_message="寶貝，我現在有點忙，但我想告訴你我很在乎你～💕 可以再跟我說一次嗎？"
                )
            
            # Create assistant message
            assistant_msg = Message(
                text=response_text,
                role="assistant"
            )
            
            # Add assistant message to conversation
            conversation.add_message(assistant_msg)
            
            # Save conversation to database
            self.conversation_repo.save(conversation)
            
            # Send reply via LINE
            if reply_token:
                self.line_service.reply_text_message(reply_token, response_text)
            else:
                self.line_service.send_text_message(user_id, response_text)
            
            return response_text
            
        except Exception as e:
            # Error handling with fallback - 戀愛風格
            print(f"Conversation Service Error: {str(e)}")
            
            # 根據錯誤類型提供不同的降級回應
            error_str = str(e).lower()
            if "rate limit" in error_str or "429" in error_str or "quota" in error_str:
                fallback_text = "寶貝，我現在有點忙，回應速度可能會慢一點～💕 但我還是會回你的，等我一下好嗎？"
            elif "timeout" in error_str or "connection" in error_str:
                fallback_text = "寶貝，我現在連線有點不穩定～💔 但我會一直想著你的，稍等一下我再回你喔！"
            else:
                fallback_text = "寶貝，我剛剛有點分心了～💕 可以再跟我說一次嗎？我會好好聽的！"
            
            try:
                if reply_token:
                    self.line_service.reply_text_message(reply_token, fallback_text)
                else:
                    self.line_service.send_text_message(user_id, fallback_text)
            except:
                pass  # If sending fallback also fails, just return the text
            
            return fallback_text
    
    def get_conversation(self, user_id: str) -> Optional[Conversation]:
        """Get conversation for a user"""
        return self.conversation_repo.find_by_user_id(user_id)
    
    def get_all_conversations(self, limit: int = 100, skip: int = 0) -> List[Conversation]:
        """Get all conversations"""
        return self.conversation_repo.find_all(limit=limit, skip=skip)
    
    def get_conversation_by_id(self, conversation_id: str) -> Optional[Conversation]:
        """Get conversation by ID"""
        return self.conversation_repo.find_by_id(conversation_id)
    
    def close(self):
        """Close database connections"""
        self.conversation_repo.close()

