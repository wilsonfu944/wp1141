"""
Conversation and Message models for MongoDB
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from config import Config


class Message:
    """Message model representing a single message in a conversation"""
    
    def __init__(
        self,
        text: str,
        role: str,  # 'user' or 'assistant'
        timestamp: Optional[datetime] = None,
        message_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.text = text
        self.role = role
        self.timestamp = timestamp or datetime.utcnow()
        self.message_id = message_id
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary for MongoDB storage"""
        return {
            "text": self.text,
            "role": self.role,
            "timestamp": self.timestamp,
            "message_id": self.message_id,
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Message":
        """Create Message instance from dictionary"""
        return cls(
            text=data.get("text", ""),
            role=data.get("role", "user"),
            timestamp=data.get("timestamp"),
            message_id=data.get("message_id"),
            metadata=data.get("metadata", {})
        )


class Conversation:
    """Conversation model for storing chat history"""
    
    def __init__(
        self,
        user_id: str,
        platform: str = "line",
        messages: Optional[List[Message]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None,
        conversation_id: Optional[str] = None,
        persona: Optional[str] = None
    ):
        self.conversation_id = conversation_id
        self.user_id = user_id
        self.platform = platform
        self.messages = messages or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.metadata = metadata or {}
        self.persona = persona or "default"  # 預設人格
    
    def add_message(self, message: Message):
        """Add a message to the conversation"""
        self.messages.append(message)
        self.updated_at = datetime.utcnow()
    
    def get_recent_messages(self, limit: int = 10) -> List[Message]:
        """Get recent messages for context"""
        return self.messages[-limit:] if len(self.messages) > limit else self.messages
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert conversation to dictionary for MongoDB storage"""
        return {
            "conversation_id": self.conversation_id,
            "user_id": self.user_id,
            "platform": self.platform,
            "messages": [msg.to_dict() for msg in self.messages],
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "metadata": self.metadata,
            "persona": self.persona
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Conversation":
        """Create Conversation instance from dictionary"""
        messages = [Message.from_dict(msg) for msg in data.get("messages", [])]
        return cls(
            conversation_id=data.get("conversation_id"),
            user_id=data.get("user_id", ""),
            platform=data.get("platform", "line"),
            messages=messages,
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            metadata=data.get("metadata", {}),
            persona=data.get("persona", "default")
        )


class ConversationRepository:
    """Repository layer for Conversation database operations"""
    
    def __init__(self):
        """Initialize MongoDB connection"""
        # Configure MongoDB connection with SSL options
        import ssl
        import certifi
        
        # Parse URI to extract database name
        db_name = "linebot"  # Default database name
        try:
            from urllib.parse import urlparse
            parsed = urlparse(Config.MONGODB_URI)
            if parsed.path and parsed.path != "/":
                db_name = parsed.path.strip("/").split("/")[0] or db_name
        except:
            pass
        
        # Create MongoDB client with SSL certificate verification
        # Handle both local development and Vercel deployment
        try:
            # Try with certifi first (for local development)
            self.client = MongoClient(
                Config.MONGODB_URI,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=10000,  # Increased timeout for Vercel
                connectTimeoutMS=10000
            )
        except Exception as e:
            # Fallback: try without strict SSL verification
            # This works better in serverless environments like Vercel
            print(f"Warning: SSL certificate verification failed, using fallback: {e}")
            try:
                self.client = MongoClient(
                    Config.MONGODB_URI,
                    tlsAllowInvalidCertificates=True,
                    serverSelectionTimeoutMS=10000,
                    connectTimeoutMS=10000
                )
            except Exception as e2:
                # Last resort: try without SSL options
                print(f"Warning: MongoDB connection failed with SSL, trying without: {e2}")
                self.client = MongoClient(
                    Config.MONGODB_URI,
                    serverSelectionTimeoutMS=10000,
                    connectTimeoutMS=10000
                )
        
        self.db: Database = self.client.get_database(db_name)
        self.collection: Collection = self.db.conversations
    
    def find_by_user_id(self, user_id: str) -> Optional[Conversation]:
        """Find the most recent conversation for a user"""
        doc = self.collection.find_one(
            {"user_id": user_id},
            sort=[("updated_at", -1)]
        )
        if doc:
            doc["_id"] = str(doc["_id"])
            if not doc.get("conversation_id"):
                doc["conversation_id"] = str(doc["_id"])
            return Conversation.from_dict(doc)
        return None
    
    def find_or_create(self, user_id: str, platform: str = "line") -> Conversation:
        """Find existing conversation or create a new one"""
        conversation = self.find_by_user_id(user_id)
        if not conversation:
            conversation = Conversation(user_id=user_id, platform=platform)
            self.save(conversation)
        return conversation
    
    def save(self, conversation: Conversation) -> str:
        """Save or update a conversation"""
        data = conversation.to_dict()
        
        if conversation.conversation_id:
            # Update existing conversation
            # Try to update by conversation_id first
            result = self.collection.update_one(
                {"conversation_id": conversation.conversation_id},
                {"$set": data}
            )
            # If not found, try to update by _id
            if result.matched_count == 0:
                try:
                    from bson import ObjectId
                    self.collection.update_one(
                        {"_id": ObjectId(conversation.conversation_id)},
                        {"$set": data}
                    )
                except:
                    pass
            return conversation.conversation_id
        else:
            # Insert new conversation
            result = self.collection.insert_one(data)
            conversation.conversation_id = str(result.inserted_id)
            # Update the document with conversation_id
            self.collection.update_one(
                {"_id": result.inserted_id},
                {"$set": {"conversation_id": conversation.conversation_id}}
            )
            return conversation.conversation_id
    
    def find_all(self, limit: int = 100, skip: int = 0) -> List[Conversation]:
        """Get all conversations with pagination"""
        cursor = self.collection.find().sort("updated_at", -1).skip(skip).limit(limit)
        conversations = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            if not doc.get("conversation_id"):
                doc["conversation_id"] = str(doc["_id"])
            conversations.append(Conversation.from_dict(doc))
        return conversations
    
    def find_by_id(self, conversation_id: str) -> Optional[Conversation]:
        """Find conversation by ID"""
        doc = self.collection.find_one({"conversation_id": conversation_id})
        if doc:
            doc["_id"] = str(doc["_id"])
            if not doc.get("conversation_id"):
                doc["conversation_id"] = str(doc["_id"])
            return Conversation.from_dict(doc)
        return None
    
    def count(self) -> int:
        """Get total number of conversations"""
        return self.collection.count_documents({})
    
    def close(self):
        """Close MongoDB connection"""
        self.client.close()

