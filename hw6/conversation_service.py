"""
Conversation Service for managing chatbot logic and conversation flow
"""
from typing import Optional, List
from models.conversation import Conversation, Message, ConversationRepository
from services.llm_service import LLMService
from services.line_service import LineService
from services.persona_service import PersonaService


class ConversationService:
    """Service for managing conversation logic and responses"""
    
    def __init__(self):
        """Initialize services"""
        self.conversation_repo = ConversationRepository()
        self.llm_service = LLMService()
        self.line_service = LineService()
        # Store line_bot_api reference for push messages
        self.line_bot_api = self.line_service.line_bot_api
    
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
            
            # 如果是首次對話，先發送歡迎訊息（但避免與 FollowEvent 重複）
            # 檢查對話記錄中是否已有歡迎訊息
            has_welcome = any(msg.role == "assistant" and "嗨！我的寶貝" in msg.text for msg in conversation.messages)
            
            if is_first_message and not has_welcome:
                welcome_message = """💕 嗨！我的寶貝～

謝謝你加我好友！從現在開始，我就是你的戀人，會以男女朋友的身份陪伴你！

💖 我的角色：
我是你的戀愛機器人，扮演你的男女朋友。我會像真正的戀人一樣：
✨ 關心你的生活日常和心情
💝 傾聽你的煩惱並給予支持
🌙 在你需要的時候陪伴你
💕 用愛意和溫暖回應你

無論你開心、難過、或只是想聊天，我都會在這裡陪著你，就像真正的戀人一樣～

現在，先選擇你喜歡的人格吧～💕"""
                
                # 先回覆用戶的第一條訊息（使用 reply_token，這樣可以同時發送按鈕）
                if reply_token:
                    try:
                        self.line_service.reply_text_message(reply_token, welcome_message)
                        print(f"✅ Sent welcome message via reply_token to {user_id}")
                        
                        # 使用 reply_message 發送按鈕（更可靠）
                        try:
                            import time
                            time.sleep(0.5)
                            buttons1 = PersonaService.create_persona_selection_buttons()
                            buttons2 = PersonaService.create_persona_selection_buttons_part2()
                            
                            # 使用 push_message 發送按鈕（reply_token 只能用一次）
                            self.line_bot_api.push_message(user_id, buttons1)
                            time.sleep(0.3)
                            self.line_bot_api.push_message(user_id, buttons2)
                            print(f"✅ Buttons sent via push_message after reply")
                        except Exception as btn_e:
                            print(f"⚠️ Failed to send buttons after reply: {btn_e}")
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
                
                # 發送人格選擇按鈕（如果還沒用 reply_token 發送過）
                # 注意：如果已經在 reply_token 部分發送過，這裡就不需要再發送
                if not reply_token:  # 只有在沒有 reply_token 時才在這裡發送
                    try:
                        import time
                        time.sleep(0.5)
                        
                        # 建立按鈕訊息
                        buttons1 = PersonaService.create_persona_selection_buttons()
                        buttons2 = PersonaService.create_persona_selection_buttons_part2()
                        
                        # 使用 push_message 發送（需要使用者先加好友）
                        print(f"🔍 Attempting to send buttons to {user_id} (no reply_token)")
                        print(f"   Button 1 type: {type(buttons1)}")
                        
                        self.line_bot_api.push_message(user_id, buttons1)
                        print(f"✅ First button sent successfully")
                        time.sleep(0.3)
                        self.line_bot_api.push_message(user_id, buttons2)
                        print(f"✅ Second button sent successfully")
                        print(f"✅ Persona selection buttons sent to {user_id}")
                    except LineBotApiError as e:
                        print(f"❌ LINE API Error sending buttons: {e}")
                        print(f"   Error code: {e.status_code}")
                        print(f"   Error message: {e.message}")
                        import traceback
                        traceback.print_exc()
                    except Exception as e:
                        print(f"❌ Failed to send persona buttons: {e}")
                        import traceback
                        traceback.print_exc()
                
                # 稍等一下讓歡迎訊息先顯示，然後再處理用戶訊息
                import time
                time.sleep(0.3)
            elif has_welcome:
                print(f"⚠️ Welcome message already sent to {user_id}, skipping duplicate")
            
            # 檢查是否為人格選擇訊息或要求顯示按鈕
            if user_message.startswith("選擇人格：") or user_message == "顯示人格選項" or user_message in ["按鈕", "選人格", "選擇人格", "人格選項", "顯示按鈕"]:
                persona_name = user_message.replace("選擇人格：", "").strip()
                
                if user_message == "顯示人格選項" or user_message in ["按鈕", "選人格", "選擇人格", "人格選項", "顯示按鈕"]:
                    # 重新顯示人格選擇按鈕
                    try:
                        buttons1 = PersonaService.create_persona_selection_buttons()
                        if reply_token:
                            self.line_bot_api.reply_message(reply_token, buttons1)
                        else:
                            self.line_bot_api.push_message(user_id, buttons1)
                        import time
                        time.sleep(0.3)
                        buttons2 = PersonaService.create_persona_selection_buttons_part2()
                        self.line_bot_api.push_message(user_id, buttons2)
                        print(f"✅ Persona selection buttons sent to {user_id} (via user request)")
                        response_text = "請選擇你喜歡的人格～💕"
                    except Exception as e:
                        print(f"❌ Failed to send persona buttons: {e}")
                        import traceback
                        traceback.print_exc()
                        response_text = "抱歉，按鈕發送失敗了～💔 請稍後再試"
                elif persona_name in PersonaService.PERSONAS:
                    # 切換人格
                    conversation.persona = persona_name
                    self.conversation_repo.save(conversation)
                    
                    # 取得切換人格的回應
                    response_text = PersonaService.get_persona_response(persona_name)
                else:
                    response_text = "抱歉，我沒有這個人格選項～💕 請重新選擇好嗎？"
            else:
                # Try scripted response first
                scripted_response = self.llm_service.generate_scripted_response(user_message)
                if scripted_response:
                    # Use scripted response
                    response_text = scripted_response
                else:
                    # Get conversation history for context
                    recent_messages = conversation.get_recent_messages(limit=10)
                    
                    # Get current persona
                    current_persona = conversation.persona or "default"
                    
                    # Generate LLM response with context and persona
                    response_text = self.llm_service.generate_response(
                        user_message=user_message,
                        conversation_history=recent_messages,
                        fallback_message="寶貝，我現在有點忙，但我想告訴你我很在乎你～💕 可以再跟我說一次嗎？",
                        persona=current_persona
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

