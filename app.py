"""
Main Flask application for LINE Bot webhook
"""
from flask import Flask, request, jsonify, render_template
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError, LineBotApiError
from linebot.models import MessageEvent, TextMessage, FollowEvent, PostbackEvent
from models.conversation import Message
from config import Config
from services.conversation_service import ConversationService
import traceback

# Initialize Flask app
# Set template folder explicitly for Vercel deployment
app = Flask(__name__, template_folder='templates', static_folder=None)

# Initialize LINE Bot (with error handling for missing env vars)
try:
    line_bot_api = LineBotApi(Config.LINE_CHANNEL_ACCESS_TOKEN)
    handler = WebhookHandler(Config.LINE_CHANNEL_SECRET)
except Exception as e:
    print(f"Warning: Failed to initialize LINE Bot: {e}")
    # Create dummy objects to prevent import errors
    line_bot_api = None
    handler = None

# Initialize services (lazy initialization to avoid errors during import)
_conversation_service = None

def get_conversation_service():
    """Lazy initialization of conversation service"""
    global _conversation_service
    if _conversation_service is None:
        try:
            _conversation_service = ConversationService()
        except Exception as e:
            print(f"Warning: Failed to initialize ConversationService: {e}")
            # Return a mock service that will fail gracefully
            raise
    return _conversation_service


@app.route("/", methods=["GET"])
def index():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "message": "LINE Bot webhook is running"
    }), 200


@app.route("/webhook", methods=["GET", "POST"])
def webhook():
    """
    LINE webhook endpoint for receiving messages
    
    GET: Test endpoint to verify webhook is accessible
    POST: Handle LINE webhook events
    
    This endpoint:
    1. Validates LINE signature
    2. Handles incoming events
    3. Processes messages
    4. Sends replies
    """
    # Handle GET request for testing
    if request.method == "GET":
        return jsonify({
            "status": "ok",
            "message": "Webhook endpoint is accessible",
            "method": "GET",
            "note": "LINE Platform will send POST requests to this endpoint"
        }), 200
    
    # Handle POST request from LINE Platform
    # Get signature from header
    signature = request.headers.get("X-Line-Signature", "")
    
    # Get request body
    body = request.get_data(as_text=True)
    
    # Log incoming request for debugging
    print(f"Received webhook request: {len(body)} bytes, signature: {signature[:20]}...")
    
    # Debug: 打印收到的 event 類型
    import json
    try:
        events_data = json.loads(body)
        if 'events' in events_data:
            for event in events_data['events']:
                event_type = event.get('type', 'unknown')
                print(f"📥 Received event type: {event_type}")
                if event_type == 'follow':
                    print(f"   👤 User ID: {event.get('source', {}).get('userId', 'unknown')}")
    except:
        pass
    
    try:
        # Handle webhook events
        if handler is None:
            return jsonify({"error": "LINE Bot handler not initialized. Check environment variables."}), 500
        handler.handle(body, signature)
        print("Webhook handled successfully")
    except InvalidSignatureError:
        # Invalid signature - return 400
        print("Invalid signature. Check your channel secret.")
        return jsonify({"error": "Invalid signature"}), 400
    except Exception as e:
        # Other errors
        print(f"Webhook error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"status": "ok"}), 200


@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    """
    Handle text message events from LINE
    
    This handler:
    1. Extracts user ID and message text
    2. Processes message through conversation service
    3. Sends reply automatically (handled by service)
    """
    try:
        # Extract event data
        user_id = event.source.user_id
        message_text = event.message.text
        reply_token = event.reply_token
        
        print(f"Received message from {user_id}: {message_text}")
        
        # Process message and generate reply
        get_conversation_service().process_message(
            user_id=user_id,
            user_message=message_text,
            reply_token=reply_token,
            platform="line"
        )
        
    except Exception as e:
        print(f"Error handling message: {str(e)}")
        traceback.print_exc()
        
        # Try to send error message
        try:
            if hasattr(event, 'reply_token'):
                line_bot_api.reply_message(
                    event.reply_token,
                    TextMessage(text="寶貝，我剛剛有點分心了～💕 可以再跟我說一次嗎？")
                )
        except:
            pass


@handler.add(FollowEvent)
def handle_follow(event):
    """
    Handle Follow Event - 當使用者加入好友時觸發
    發送歡迎訊息，清楚說明機器人的角色
    """
    try:
        user_id = event.source.user_id
        print(f"✅ Follow Event triggered! New user followed: {user_id}")
        
        # 發送歡迎訊息，清楚說明角色
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
        
        # 使用 push message 發送歡迎訊息
        try:
            line_bot_api.push_message(
                user_id,
                TextMessage(text=welcome_message)
            )
            print(f"✅ Welcome message sent to {user_id}")
        except Exception as e:
            print(f"❌ Failed to send push message: {e}")
            # 如果 push message 失敗，嘗試使用 reply（但 Follow Event 通常沒有 reply_token）
            try:
                if hasattr(event, 'reply_token') and event.reply_token:
                    line_bot_api.reply_message(
                        event.reply_token,
                        TextMessage(text=welcome_message)
                    )
                    print(f"✅ Welcome message sent via reply to {user_id}")
            except:
                pass
        
        # 將歡迎訊息存入資料庫
        try:
            conversation = get_conversation_service().conversation_repo.find_or_create(user_id, "line")
            welcome_msg = Message(
                text=welcome_message,
                role="assistant"
            )
            conversation.add_message(welcome_msg)
            get_conversation_service().conversation_repo.save(conversation)
            print(f"✅ Welcome message saved to database for {user_id}")
            
            # 發送人格選擇按鈕
            from services.persona_service import PersonaService
            import time
            time.sleep(0.5)
            buttons1 = PersonaService.create_persona_selection_buttons()
            line_bot_api.push_message(user_id, buttons1)
            time.sleep(0.3)
            buttons2 = PersonaService.create_persona_selection_buttons_part2()
            line_bot_api.push_message(user_id, buttons2)
            print(f"✅ Persona selection buttons sent to {user_id}")
        except Exception as e:
            print(f"⚠️ Failed to save welcome message: {e}")
        
    except Exception as e:
        print(f"❌ Error handling follow event: {str(e)}")
        traceback.print_exc()


@handler.add(PostbackEvent)
def handle_postback(event):
    """
    Handle Postback Event - 處理按鈕點選事件
    當使用者點選按鈕時觸發
    """
    try:
        user_id = event.source.user_id
        postback_data = event.postback.data
        reply_token = event.reply_token
        
        print(f"📥 Postback event from {user_id}: {postback_data}")
        
        # 處理人格選擇
        if postback_data.startswith("persona="):
            persona = postback_data.replace("persona=", "")
            conversation = get_conversation_service().conversation_repo.find_or_create(user_id, "line")
            conversation.persona = persona
            get_conversation_service().conversation_repo.save(conversation)
            
            from services.persona_service import PersonaService
            response_text = PersonaService.get_persona_response(persona)
            
            line_bot_api.reply_message(reply_token, TextMessage(text=response_text))
        
    except Exception as e:
        print(f"❌ Error handling postback: {str(e)}")
        traceback.print_exc()


@app.route("/admin", methods=["GET"])
def admin_dashboard():
    """
    Admin dashboard to view conversations
    
    Query parameters:
    - page: Page number (default: 1)
    - limit: Items per page (default: 20)
    - user_id: Filter by user ID (optional)
    """
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        user_id_filter = request.args.get("user_id", "")
        
        skip = (page - 1) * limit
        
        # Get conversations
        if user_id_filter:
            conversation = get_conversation_service().get_conversation(user_id_filter)
            conversations = [conversation] if conversation else []
        else:
            conversations = get_conversation_service().get_all_conversations(limit=limit, skip=skip)
        
        # Convert to JSON-serializable format
        conversations_data = []
        for conv in conversations:
            conv_dict = {
                "conversation_id": conv.conversation_id,
                "user_id": conv.user_id,
                "platform": conv.platform,
                "message_count": len(conv.messages),
                "created_at": conv.created_at.isoformat() if conv.created_at else None,
                "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
                "last_message": conv.messages[-1].text if conv.messages else None
            }
            conversations_data.append(conv_dict)
        
        return render_template("admin.html", conversations=conversations_data, page=page)
        
    except Exception as e:
        print(f"Admin dashboard error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/admin/conversation/<conversation_id>", methods=["GET"])
def view_conversation(conversation_id: str):
    """View detailed conversation with all messages"""
    try:
        conversation = get_conversation_service().get_conversation_by_id(conversation_id)
        
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404
        
        # Convert messages to JSON-serializable format
        messages_data = []
        for msg in conversation.messages:
            msg_dict = {
                "text": msg.text,
                "role": msg.role,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None,
                "message_id": msg.message_id
            }
            messages_data.append(msg_dict)
        
        conversation_data = {
            "conversation_id": conversation.conversation_id,
            "user_id": conversation.user_id,
            "platform": conversation.platform,
            "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
            "updated_at": conversation.updated_at.isoformat() if conversation.updated_at else None,
            "messages": messages_data
        }
        
        return render_template("conversation_detail.html", conversation=conversation_data)
        
    except Exception as e:
        print(f"View conversation error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/conversations", methods=["GET"])
def api_conversations():
    """API endpoint to get conversations (JSON)"""
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        user_id_filter = request.args.get("user_id", "")
        
        skip = (page - 1) * limit
        
        if user_id_filter:
            conversation = get_conversation_service().get_conversation(user_id_filter)
            conversations = [conversation] if conversation else []
        else:
            conversations = get_conversation_service().get_all_conversations(limit=limit, skip=skip)
        
        conversations_data = []
        for conv in conversations:
            conv_dict = {
                "conversation_id": conv.conversation_id,
                "user_id": conv.user_id,
                "platform": conv.platform,
                "message_count": len(conv.messages),
                "created_at": conv.created_at.isoformat() if conv.created_at else None,
                "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
                "messages": [
                    {
                        "text": msg.text,
                        "role": msg.role,
                        "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
                    }
                    for msg in conv.messages
                ]
            }
            conversations_data.append(conv_dict)
        
        return jsonify({
            "conversations": conversations_data,
            "page": page,
            "limit": limit
        }), 200
        
    except Exception as e:
        print(f"API conversations error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/admin/clear-conversation/<user_id>", methods=["POST"])
def clear_user_conversation(user_id: str):
    """清除特定用戶的對話記錄（用於測試）"""
    try:
        repo = get_conversation_service().conversation_repo
        result = repo.collection.delete_many({"user_id": user_id})
        
        return jsonify({
            "status": "success",
            "message": f"已清除用戶 {user_id} 的 {result.deleted_count} 個對話記錄"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/admin/clear-all", methods=["POST"])
def clear_all_conversations():
    """清除所有對話記錄（用於測試）"""
    try:
        repo = get_conversation_service().conversation_repo
        count = repo.collection.count_documents({})
        repo.collection.delete_many({})
        
        return jsonify({
            "status": "success",
            "message": f"已清除 {count} 個對話記錄"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Validate configuration
    try:
        Config.validate()
        print("Configuration validated successfully")
    except ValueError as e:
        print(f"Configuration error: {e}")
        exit(1)
    
    # Run Flask app
    import os
    port = int(os.getenv("PORT", 5001))  # 使用 5001 避免與 AirPlay 衝突
    app.run(
        host="0.0.0.0",
        port=port,
        debug=Config.DEBUG
    )

