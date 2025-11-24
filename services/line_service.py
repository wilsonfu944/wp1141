"""
LINE Service for sending messages via LINE Messaging API
"""
from linebot import LineBotApi
from linebot.exceptions import LineBotApiError
from linebot.models import TextSendMessage, TemplateSendMessage
from config import Config
from typing import Optional


class LineService:
    """Service for interacting with LINE Messaging API"""
    
    def __init__(self):
        """Initialize LINE Bot API client"""
        self.line_bot_api = LineBotApi(Config.LINE_CHANNEL_ACCESS_TOKEN)
        self.channel_secret = Config.LINE_CHANNEL_SECRET
    
    def send_text_message(self, user_id: str, text: str) -> bool:
        """
        Send text message to LINE user
        
        Args:
            user_id: LINE user ID
            text: Message text to send
            
        Returns:
            True if successful, False otherwise
        """
        try:
            message = TextSendMessage(text=text)
            self.line_bot_api.push_message(user_id, message)
            return True
        except LineBotApiError as e:
            print(f"LINE API Error: {str(e)}")
            return False
        except Exception as e:
            print(f"Unexpected error sending LINE message: {str(e)}")
            return False
    
    def reply_text_message(self, reply_token: str, text: str) -> bool:
        """
        Reply to a LINE message using reply token
        
        Args:
            reply_token: LINE reply token from webhook event
            text: Message text to send
            
        Returns:
            True if successful, False otherwise
        """
        try:
            message = TextSendMessage(text=text)
            self.line_bot_api.reply_message(reply_token, message)
            return True
        except LineBotApiError as e:
            print(f"LINE API Error: {str(e)}")
            return False
        except Exception as e:
            print(f"Unexpected error replying LINE message: {str(e)}")
            return False



