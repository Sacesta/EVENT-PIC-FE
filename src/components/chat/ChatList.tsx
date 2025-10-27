import React from 'react';
import { MessageCircle, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chat: Chat) => void;
  loading?: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  loading = false
}) => {
  const { user } = useAuth();
  console.log('🔍 ChatList - Received chats:', chats);
  console.log('🔍 ChatList - Chats count:', chats?.length || 0);
  console.log('🔍 ChatList - Loading:', loading);
  console.log('🔍 ChatList - Current user ID:', user?._id);
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getChatTitle = (chat: Chat, currentUserId?: string) => {
    if (chat.title) return chat.title;
    
    // Get other participants (excluding current user)
    const otherParticipants = chat.participants?.filter(p => p.user?._id !== currentUserId) || [];
    
    if (otherParticipants.length === 1) {
      return otherParticipants[0]?.user?.name || 'User';
    } else if (otherParticipants.length > 1) {
      return `${otherParticipants[0]?.user?.name || 'User'} +${otherParticipants.length - 1}`;
    }
    
    return 'Chat';
  };

  const getChatSubtitle = (chat: Chat) => {
    if (chat.event) {
      return chat.event.name;
    }
    
    const participantCount = chat.participants?.length || 0;
    return `${participantCount} participant${participantCount > 1 ? 's' : ''}`;
  };

  const getChatAvatar = (chat: Chat, currentUserId?: string) => {
    const otherParticipants = chat.participants?.filter(p => p.user?._id !== currentUserId) || [];
    
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return participant.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    }
    
    return 'GC'; // Group Chat
  };

  const getLastMessagePreview = (chat: Chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    
    const senderName = chat.lastMessage.sender?.name?.split(' ')[0] || 'User';
    const content = chat.lastMessage.content || '';
    
    // Truncate long messages
    const maxLength = 40;
    const truncated = content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
    
    return `${senderName}: ${truncated}`;
  };

  if (loading) {
    return (
      <Card className="glass-card h-full flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="w-5 h-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col space-y-2 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-12" />
                      </div>
                      <div className="h-3 bg-muted rounded w-4/5" />
                      <div className="flex items-center justify-between gap-2">
                        <div className="h-3 bg-muted rounded w-1/3" />
                        <div className="h-5 w-8 bg-muted rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="w-5 h-5" />
          Conversations ({chats?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col space-y-2 p-4">
            {chats?.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                <p className="text-muted-foreground text-sm">
                  Start a conversation with a supplier or producer
                </p>
              </div>
            ) : (
              chats?.map((chat) => {
                const isArchived = chat.status === 'archived';

                return (
                  <div
                    key={chat._id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedChatId === chat._id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    } ${isArchived ? 'opacity-60' : ''}`}
                    onClick={() => onSelectChat(chat)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {getChatAvatar(chat, user?._id)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {getChatTitle(chat, user?._id)}
                            </h4>
                            {isArchived && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                Archived
                              </Badge>
                            )}
                          </div>
                          {chat.lastMessage && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                              {formatTime(chat.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {getLastMessagePreview(chat)}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-1 min-w-0">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{getChatSubtitle(chat)}</span>
                          </div>
                          {/* Only show unread badge if count is greater than 0 */}
                          {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs bg-blue-600 flex-shrink-0">
                              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
