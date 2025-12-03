export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Anime {
  id: string;
  name: string;
  nameEn?: string;
  year?: number;
  genre?: string;
  description?: string;
  coverImage?: string;
  locations?: Location[];
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  animeId: string;
  anime?: Anime;
  latitude: number;
  longitude: number;
  address: string;
  episode?: string;
  animeImage: string;
  realImage: string;
  description?: string;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  locationId: string;
  location: Location;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Comment {
  id: string;
  locationId: string;
  userId: string;
  user: User;
  content: string;
  rating?: number;
  parentId?: string;
  replies?: Comment[];
  likes?: CommentLike[];
  photos?: CommentPhoto[];
  likeCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentLike {
  id: string;
  commentId: string;
  userId: string;
  createdAt: string;
}

export interface CommentPhoto {
  id: string;
  commentId: string;
  url: string;
  createdAt: string;
}

export interface Itinerary {
  id: string;
  userId: string;
  user?: User;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  transport: string;
  isPublic: boolean;
  items?: ItineraryItem[];
  likes?: ItineraryLike[];
  comments?: ItineraryComment[];
  likeCount?: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryItem {
  id: string;
  itineraryId: string;
  locationId: string;
  location: Location;
  order: number;
  visitDate?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
}

export interface ItineraryLike {
  id: string;
  itineraryId: string;
  userId: string;
  createdAt: string;
}

export interface ItineraryComment {
  id: string;
  itineraryId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface OptimizedRoute {
  order: string[];
  totalDistance: number;
  totalTravelTime: number;
  totalDuration: number;
  segments: {
    from: string;
    to: string;
    distance: number;
    travelTime: number;
  }[];
}

export interface ForumPost {
  id: string;
  userId: string;
  user?: User;
  title: string;
  content: string;
  category?: string;
  viewCount: number;
  likeCount: number;
  replies?: ForumReply[];
  createdAt: string;
  updatedAt: string;
}

export interface ForumReply {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  content: string;
  parentId?: string;
  parent?: ForumReply;
  replies?: ForumReply[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  content: string;
  isRead: boolean;
  itineraryId?: string;
  itinerary?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface Conversation {
  userId: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
  itinerary?: {
    id: string;
    name: string;
  };
}

