"""
LLM Service for generating AI responses using Groq API
"""
import openai
from typing import List, Optional, Dict, Any
from config import Config
from models.conversation import Message


class LLMService:
    """Service for interacting with LLM API (Groq)"""
    
    def __init__(self):
        """Initialize LLM client"""
        self.api_key = Config.LLM_API_KEY
        self.api_base = Config.LLM_API_BASE
        self.client = openai.OpenAI(
            api_key=self.api_key,
            base_url=self.api_base
        )
        # Updated to use currently available Groq models
        # Try llama-3.3-70b-versatile first, fallback to mixtral-8x7b-32768
        self.model = "llama-3.3-70b-versatile"  # Groq's current fast model
    
    def build_prompt(self, messages: List[Message], user_message: str, persona: str = "default") -> List[Dict[str, str]]:
        """
        Build prompt for LLM with conversation context and persona
        
        Args:
            messages: Previous messages in the conversation
            user_message: Current user message
            persona: Bot personality type (default, 傻白甜, 正直, etc.)
            
        Returns:
            List of message dictionaries for OpenAI API
        """
        prompt_messages = []
        
        # 根據選擇的人格取得對應的 prompt
        from services.persona_service import PersonaService
        system_prompt = PersonaService.get_persona_prompt(persona)
        
        prompt_messages.append({
            "role": "system",
            "content": system_prompt
        })
        
        # Add conversation history (recent messages for context)
        for msg in messages[-10:]:  # Last 10 messages for context
            role = "user" if msg.role == "user" else "assistant"
            prompt_messages.append({
                "role": role,
                "content": msg.text
            })
        
        # Add current user message
        prompt_messages.append({
            "role": "user",
            "content": user_message
        })
        
        return prompt_messages
    
    def generate_response(
        self,
        user_message: str,
        conversation_history: Optional[List[Message]] = None,
        fallback_message: str = "抱歉，我現在無法處理您的訊息。請稍後再試。",
        persona: str = "default"
    ) -> str:
        """
        Generate AI response using LLM
        
        Args:
            user_message: User's input message
            conversation_history: Previous messages for context
            fallback_message: Message to return if LLM fails
            
        Returns:
            Generated response text
        """
        # List of models to try (fallback chain)
        models_to_try = [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
            "gemma2-9b-it"
        ]
        
        # Build prompt with context and persona
        messages = self.build_prompt(
            conversation_history or [],
            user_message,
            persona=persona
        )
        
        last_error = None
        for model in models_to_try:
            try:
                # Call LLM API with timeout and error handling
                import time
                start_time = time.time()
                
                response = self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500,
                    timeout=30  # 30 second timeout
                )
                
                elapsed_time = time.time() - start_time
                print(f"⏱️ LLM API call took {elapsed_time:.2f}s")
                
                # Extract response text
                reply_text = response.choices[0].message.content.strip()
                
                # Validate response
                if not reply_text:
                    continue  # Try next model
                
                # Update self.model to the working model
                self.model = model
                print(f"✅ Using LLM model: {model}")
                return reply_text
                
            except Exception as e:
                # Log error and try next model
                last_error = str(e)
                error_str = last_error.lower()
                
                # 檢查是否為速率限制或配額錯誤
                if "rate limit" in error_str or "429" in error_str:
                    print(f"⚠️ Rate limit hit for model {model}")
                    # 如果是速率限制，等待一下再試下一個模型
                    time.sleep(1)
                elif "quota" in error_str or "insufficient" in error_str:
                    print(f"⚠️ Quota exceeded for model {model}")
                else:
                    print(f"⚠️ Model {model} failed: {last_error[:100]}")
                continue
        
        # All models failed - 提供更詳細的錯誤資訊
        if last_error:
            if "rate limit" in last_error.lower() or "429" in last_error.lower():
                print(f"❌ Rate limit error: {last_error[:200]}")
            elif "quota" in last_error.lower():
                print(f"❌ Quota exceeded: {last_error[:200]}")
            else:
                print(f"❌ All LLM models failed. Last error: {last_error[:200]}")
        else:
            print(f"❌ All LLM models failed with unknown error")
        
        return fallback_message
    
    def generate_scripted_response(self, user_message: str) -> Optional[str]:
        """
        Generate scripted responses for specific keywords - 戀愛機器人版本
        
        Args:
            user_message: User's input message
            
        Returns:
            Scripted response or None if no match
        """
        user_message_lower = user_message.lower().strip()
        
        # 問候/打招呼 - 戀愛風格
        if any(word in user_message_lower for word in ["你好", "嗨", "hello", "hi", "哈囉", "在嗎", "在不在"]):
            return "寶貝～你來啦！我好想你喔 💕 今天過得怎麼樣？有沒有想我？"
        
        # 表達想念
        if any(word in user_message_lower for word in ["想你", "想你了", "miss you", "想念"]):
            return "我也好想你！💕 每分每秒都在想你，你現在在做什麼呢？"
        
        # 表達愛意
        if any(word in user_message_lower for word in ["愛你", "love you", "喜歡你", "我愛你"]):
            return "我也愛你！💖 你是我最重要的人，我會一直陪在你身邊的～"
        
        # 感謝
        if any(word in user_message_lower for word in ["謝謝", "thank", "感謝", "謝啦"]):
            return "不客氣～能幫到你我很開心！💕 還有什麼需要我的嗎？"
        
        # 道別
        if any(word in user_message_lower for word in ["再見", "bye", "拜拜", "再會", "晚安", "睡覺"]):
            return "晚安我的寶貝～💤 好好休息，我會想你的！明天見～"
        
        # 關心吃飯
        if any(word in user_message_lower for word in ["吃飯", "餓", "午餐", "晚餐", "早餐"]):
            return "寶貝要記得吃飯喔！💕 不要餓到自己，我會心疼的～你吃了什麼？"
        
        # 表達不開心/煩惱
        if any(word in user_message_lower for word in ["不開心", "難過", "煩", "累", "壓力", "sad", "tired"]):
            return "怎麼了寶貝？💔 發生什麼事了嗎？我在這裡，你可以跟我說，我會陪著你的～"
        
        # 表達開心
        if any(word in user_message_lower for word in ["開心", "高興", "快樂", "happy", "好棒"]):
            return "看到你開心我也好開心！💖 你開心的樣子最可愛了～"
        
        # 問候/關心（已移除，避免重複）
        # if any(word in user_message_lower for word in ["還好嗎", "怎麼樣", "如何", "如何", "過得"]):
        #     return "我很好～但更關心你過得怎麼樣 💕 今天有什麼特別的事想跟我分享嗎？"
        
        return None

