import React, { useEffect, useRef } from 'react';
import { Send, Smile, MoreVertical, Edit, Trash2, Reply, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChatMessage, Chat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';

interface ChatMessagesProps {
  chat: Chat | null;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  typingUsers: Array<{ userId: string; userName: string }>;
  loading?: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  chat,
  messages,
  onSendMessage,
  onStartTyping,
  onStopTyping,
  onEditMessage,
  onDeleteMessage,
  onAddReaction,
  typingUsers,
  loading = false,
  messagesEndRef
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = React.useState('');
  const [editingMessage, setEditingMessage] = React.useState<{ id: string; content: string } | null>(null);
  const [replyingTo, setReplyingTo] = React.useState<ChatMessage | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [sending, setSending] = React.useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      await onSendMessage(newMessage.trim());
      setNewMessage('');
      setReplyingTo(null);
      onStopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error is already handled in the hook
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (e.target.value.trim()) {
      onStartTyping();
    } else {
      onStopTyping();
    }
  };

  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessage({ id: messageId, content: currentContent });
    setReplyingTo(null);
  };

  const handleSaveEdit = () => {
    if (editingMessage && editingMessage.content.trim()) {
      onEditMessage(editingMessage.id, editingMessage.content.trim());
      setEditingMessage(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageSender = (message: ChatMessage) => {
    return chat?.participants?.find(p => p.user?._id === message.sender?._id)?.user || message.sender;
  };

  // Check if the message sender is the currently logged-in user
  const isCurrentUser = (message: ChatMessage) => {
    if (!user || !message.sender) return false;
    return message.sender._id === user._id;
  };

  const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  if (!chat) {
    return (
      <Card className="glass-card h-[75vh] flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
            <p className="text-muted-foreground">
              Choose a conversation from the list to start chatting
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-[75vh] flex flex-col overflow-hidden">
      <CardHeader className="border-b border-border flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback>
            {chat.participants?.find(p => p.user?._id !== chat.participants?.[0]?.user?._id)?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {chat.title || chat.participants?.find(p => p.user?._id !== chat.participants?.[0]?.user?._id)?.user?.name || 'Chat'}
            </h3>
            {chat.event && (
              <p className="text-sm text-muted-foreground">{chat.event.name}</p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {loading && messages?.length === 0 ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[70%] p-3 rounded-lg bg-muted animate-pulse">
                      <div className="h-4 bg-muted-foreground/20 rounded w-32 mb-2" />
                      <div className="h-3 bg-muted-foreground/20 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              messages?.map((message) => {
                const sender = getMessageSender(message);
                const isUser = isCurrentUser(message);
                
                return (
                  <div key={message._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] group ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                      {!isUser && (
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {sender.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-muted-foreground">
                            {sender.name}
                          </span>
                        </div>
                      )}
                      
                      <div className="relative">
                        <div
                          className={`p-3 rounded-lg ${
                            isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.replyTo && (
                            <div className={`mb-2 p-2 rounded border-l-2 ${
                              isUser ? 'border-primary-foreground/30 bg-primary-foreground/10' : 'border-primary/30 bg-primary/10'
                            }`}>
                              <p className="text-xs font-medium">
                                {message.replyTo.sender.name}
                              </p>
                              <p className="text-xs truncate">
                                {message.replyTo.content}
                              </p>
                            </div>
                          )}
                          
                          <p className="text-sm">{message.content}</p>
                          
                          <div className={`flex items-center justify-between mt-2 ${
                            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            <span className="text-xs">
                              {formatTime(message.createdAt)}
                              {message.editedAt && ' (edited)'}
                            </span>
                            
                            {isUser && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditMessage(message._id, message.content)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => onDeleteMessage(message._id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                        
                        {/* Reactions - Group by emoji and show count */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {(() => {
                              // Group reactions by emoji
                              const reactionGroups = message.reactions.reduce((acc, reaction) => {
                                const emoji = reaction.emoji;
                                if (!acc[emoji]) {
                                  acc[emoji] = {
                                    emoji,
                                    count: 0,
                                    users: []
                                  };
                                }
                                acc[emoji].count++;
                                acc[emoji].users.push(reaction.user);
                                return acc;
                              }, {} as Record<string, { emoji: string; count: number; users: string[] }>);

                              return Object.values(reactionGroups).map((group, idx) => (
                                <Button
                                  key={idx}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs "
                                  onClick={() => onAddReaction(message._id, group.emoji)}
                                  title={`${group.count} reaction${group.count > 1 ? 's' : ''}`}
                                >
                                  {group.emoji} {group.count}
                                </Button>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Message Input */}
        <div className="border-t border-border p-4 flex-shrink-0">
          {replyingTo && (
            <div className="mb-3 p-2 bg-muted rounded-lg border-l-2 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Replying to {replyingTo.sender.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
          
          {editingMessage ? (
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={editingMessage.content}
                onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                placeholder="Edit message..."
                className="flex-1"
              />
              <Button onClick={handleSaveEdit} size="sm">
                Save
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Type your message..."
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={sending}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || sending}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
          
          {/* Quick reactions */}
          <div className="flex gap-1 mt-2">
            {commonReactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  // Add reaction to last message or selected message
                  const lastMessage = messages?.[messages.length - 1];
                  if (lastMessage) {
                    onAddReaction(lastMessage._id, emoji);
                  }
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
