export type VibeType = 'photo' | 'video' | 'audio' | 'text';

export type VibePrivacy = 'public' | 'friends' | 'link';

export type VibeColor = 'purple' | 'cyan' | 'pink' | 'emerald' | 'amber' | 'rose';

export interface RegisteredAccount {
  id: string;
  name: string;
  username: string;
  token: string;
  avatar: string;
  bio: string;
  vibeColor: VibeColor;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  vibeColor: VibeColor;
  location: string;
  activeVibesCount: number;
  totalVibesShared: number;
  isOnline: boolean;
  followersCount?: number;
  followingCount?: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userVibeColor: VibeColor;
  text: string;
  createdAt: number;
  likes: number;
  hasLiked?: boolean;
}

export interface VibeItem {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorVibeColor: VibeColor;
  type: VibeType;
  content: string; // text caption or text message
  mediaUrl?: string; // photo/video url
  audioDuration?: number; // in seconds
  location?: string;
  distance?: string;
  createdAt: number; // timestamp
  expiresAt: number; // timestamp (e.g. created + 24h)
  privacy: VibePrivacy;
  likes: number;
  hasLiked?: boolean;
  commentsCount: number;
  comments: Comment[];
  sharesCount: number;
  viewsCount: number;
  isSponsored?: boolean;
  sponsoredCta?: string;
  sponsoredUrl?: string;
}

export interface EphemeralMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderVibeColor: VibeColor;
  type: 'text' | 'audio' | 'photo';
  content: string;
  mediaUrl?: string;
  audioDuration?: number;
  createdAt: number;
  expiresAt: number;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantUsername: string;
  participantAvatar: string;
  participantVibeColor: VibeColor;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: number;
  expiresAt: number; // conversation TTL
  unreadCount: number;
  messages: EphemeralMessage[];
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  userVibeColor: VibeColor;
  location?: string;
  isUser?: boolean;
  hasUnseen: boolean;
  vibes: VibeItem[];
}
