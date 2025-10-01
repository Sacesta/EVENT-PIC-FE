import React from 'react';
import { MessageCircle, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/hooks/use-chat';

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

  const getChatTitle = (chat: Chat) => {
    if (chat.title) return chat.title;
    
    // Get other participants (excluding current user)
    const otherParticipants = chat.participants.filter(p => p.user._id !== chat.participants[0]?.user._id);
    
    if (otherParticipants.length === 1) {
      return otherParticipants[0].user.name;
    } else if (otherParticipants.length > 1) {
      return `${otherParticipants[0].user.name} +${otherParticipants.length - 1}`;
    }
    
    return 'Chat';
  };

  const getChatAvatar = (chat: Chat) => {
    const otherParticipants = chat.participants.filter(p => p.user._id !== chat.participants[0]?.user._id);
    
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return participant.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    return 'GC'; // Group Chat
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
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
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Conversations ({chats.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="space-y-2 p-4">
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                <p className="text-muted-foreground text-sm">
                  Start a conversation with a supplier or producer
                </p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedChatId === chat._id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {getChatAvatar(chat)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {getChatTitle(chat)}
                        </h4>
                        <div className="flex items-center gap-2">
                          {chat.unreadCount && chat.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              {chat.unreadCount}
                            </Badge>
                          )}
                          {chat.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(chat.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                      {chat.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {chat.lastMessage.sender.name}: {chat.lastMessage.content}
                        </p>
                      )}
                      {chat.event && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span className="truncate">{chat.event.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
