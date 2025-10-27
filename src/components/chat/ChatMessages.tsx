import React, { useEffect, useRef, useState as useReactState } from 'react';
import { Send, Smile, MoreVertical, Edit, Trash2, Reply, MessageCircle, Image as ImageIcon, BellOff, Bell, Ban, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [showGifPicker, setShowGifPicker] = React.useState(false);
  const [gifSearchTerm, setGifSearchTerm] = React.useState('');
  const [gifs, setGifs] = React.useState<any[]>([]);
  const [loadingGifs, setLoadingGifs] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [showOrderModifyDialog, setShowOrderModifyDialog] = React.useState(false);

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

  // Search GIFs using Giphy API
  const searchGifs = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      // Load trending GIFs if no search term
      searchTerm = 'trending';
    }

    setLoadingGifs(true);
    try {
      // Using Giphy's public beta API key (for demo purposes only)
      // In production, you should use your own API key
      const apiKey = 'sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh';
      const url = searchTerm === 'trending'
        ? `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`
        : `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(searchTerm)}&limit=20&rating=g`;

      const response = await fetch(url);
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      setGifs([]);
    } finally {
      setLoadingGifs(false);
    }
  };

  // Load trending GIFs when picker opens
  useEffect(() => {
    if (showGifPicker && gifs.length === 0) {
      searchGifs('trending');
    }
  }, [showGifPicker]);

  // Send GIF as message
  const handleSendGif = async (gifUrl: string) => {
    try {
      setSending(true);
      // Send the GIF URL as a message with a special prefix
      await onSendMessage(`[GIF] ${gifUrl}`);
      setShowGifPicker(false);
      setGifSearchTerm('');
    } catch (error) {
      console.error('Failed to send GIF:', error);
    } finally {
      setSending(false);
    }
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

  // Get other user(s) in the chat (not the current user)
  const getOtherParticipants = () => {
    if (!chat?.participants) return [];
    return chat.participants.filter(p => p.user?._id !== user?._id);
  };

  const getChatDisplayName = () => {
    if (chat?.title) return chat.title;

    const otherParticipants = getOtherParticipants();
    if (otherParticipants.length === 0) return 'Chat';
    if (otherParticipants.length === 1) {
      return otherParticipants[0]?.user?.name || 'User';
    }
    return `${otherParticipants[0]?.user?.name || 'User'} +${otherParticipants.length - 1}`;
  };

  const getChatDisplayAvatar = () => {
    const otherParticipants = getOtherParticipants();
    if (otherParticipants.length === 0) return 'C';
    if (otherParticipants.length === 1) {
      return otherParticipants[0]?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    }
    return 'GC'; // Group Chat
  };

  const getChatDisplayImage = () => {
    const otherParticipants = getOtherParticipants();
    if (otherParticipants.length === 1) {
      return otherParticipants[0]?.user?.profileImage;
    }
    return null;
  };

  const handleMuteChat = () => {
    setIsMuted(!isMuted);
    // TODO: Call API to mute/unmute chat
    console.log('Chat muted:', !isMuted);
  };

  const handleBlockContact = () => {
    if (confirm('Are you sure you want to block this contact? You will no longer receive messages from them.')) {
      // TODO: Call API to block contact
      console.log('Contact blocked');
    }
  };

  const handleSuggestOrderModification = () => {
    setShowOrderModifyDialog(true);
  };

  // Format date for separator
  const formatDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);

    // Check if same day
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Check if within this week (last 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (messageDate > weekAgo) {
      return messageDate.toLocaleDateString([], { weekday: 'long' });
    }

    // Otherwise show full date
    return messageDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  // Check if we need a date separator between messages
  const shouldShowDateSeparator = (currentMessage: ChatMessage, previousMessage?: ChatMessage) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.createdAt || currentMessage.timestamp);
    const previousDate = new Date(previousMessage.createdAt || previousMessage.timestamp);

    return currentDate.toDateString() !== previousDate.toDateString();
  };

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
        <CardTitle className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            {getChatDisplayImage() ? (
              <AvatarImage src={getChatDisplayImage()} alt={getChatDisplayName()} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getChatDisplayAvatar()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">
              {getChatDisplayName()}
            </h3>
            {chat.event && (
              <p className="text-xs text-muted-foreground truncate">{chat.event.name}</p>
            )}
          </div>

          {/* Chat Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleMuteChat}>
                {isMuted ? (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Unmute Chat
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 mr-2" />
                    Mute Chat
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleSuggestOrderModification}>
                <FileText className="w-4 h-4 mr-2" />
                Suggest Order Modification
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleBlockContact}
                className="text-destructive focus:text-destructive"
              >
                <Ban className="w-4 h-4 mr-2" />
                Block Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            ) : messages?.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No messages yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start the conversation by sending a message below
                  </p>
                </div>
              </div>
            ) : (
              messages?.map((message, index) => {
                const sender = getMessageSender(message);
                const isUser = isCurrentUser(message);
                const isAdmin = user?.role === "admin";
                const previousMessage = index > 0 ? messages[index - 1] : undefined;
                const showDateSeparator = shouldShowDateSeparator(message, previousMessage);

                // For admin: producer messages right, others left
// For others: current user's messages right, others left
let alignRight = false;


if (isAdmin) {
  alignRight = sender?.role === "producer";
} else {
  alignRight = isUser;
}

                return (
                  <React.Fragment key={message._id}>
                    {/* Date Separator */}
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-muted px-3 py-1 rounded-full">
                          <span className="text-xs font-medium text-muted-foreground">
                            {formatDateSeparator(new Date(message.createdAt || message.timestamp))}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] group ${alignRight ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
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

                          {/* Check if message contains a GIF */}
                          {message.content?.startsWith('[GIF] ') ? (
                            <div className="mt-1">
                              <img
                                src={message.content.replace('[GIF] ', '')}
                                alt="GIF"
                                className="max-w-full rounded-lg max-h-64 object-contain"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          )}

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
                        {user?.role !== "admin" && message.reactions && message.reactions.length > 0 && (
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
                  </React.Fragment>
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
          
         {user?.role !== "admin" && (
  editingMessage ? (
    <div className="flex gap-2">
      <Input
        ref={inputRef}
        value={editingMessage.content}
        onChange={(e) =>
          setEditingMessage({ ...editingMessage, content: e.target.value })
        }
        onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
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
    <div className="space-y-2">
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
        {/* GIF Picker Button */}
        <Dialog open={showGifPicker} onOpenChange={setShowGifPicker}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              type="button"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Choose a GIF</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search GIFs..."
                value={gifSearchTerm}
                onChange={(e) => setGifSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchGifs(gifSearchTerm);
                  }
                }}
              />
              <Button
                onClick={() => searchGifs(gifSearchTerm)}
                className="w-full"
                disabled={loadingGifs}
              >
                {loadingGifs ? 'Searching...' : 'Search'}
              </Button>
              <ScrollArea className="h-96">
                {loadingGifs ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {gifs.map((gif) => (
                      <div
                        key={gif.id}
                        className="cursor-pointer hover:opacity-80 transition-opacity rounded-lg overflow-hidden"
                        onClick={() => handleSendGif(gif.images.fixed_height.url)}
                      >
                        <img
                          src={gif.images.fixed_height.url}
                          alt={gif.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {gifs.length === 0 && !loadingGifs && (
                <p className="text-center text-muted-foreground text-sm">
                  No GIFs found. Try a different search term.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
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
    </div>
  )
)}


          {/* Quick emoji picker - Insert emoji into message */}
          {user?.role !== "admin" && !editingMessage && (
            <div className="flex gap-1 mt-2">
              {commonReactions.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    // Insert emoji into message input
                    setNewMessage(prev => prev + emoji);
                    // Focus the input after inserting emoji
                    inputRef.current?.focus();
                  }}
                  type="button"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Order Modification Dialog */}
      <Dialog open={showOrderModifyDialog} onOpenChange={setShowOrderModifyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Suggest Order Modification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Suggest changes to the order. Both parties must approve the modifications.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Modification Type</label>
              <select className="w-full p-2 border rounded-md">
                <option value="price">Price Change</option>
                <option value="quantity">Quantity Change</option>
                <option value="date">Date Change</option>
                <option value="requirements">Custom Requirements</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Value</label>
              <Input placeholder="Enter new value..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Change</label>
              <textarea
                className="w-full p-2 border rounded-md min-h-[80px]"
                placeholder="Explain why you're suggesting this change..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowOrderModifyDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: Send modification suggestion
                  console.log('Order modification suggested');
                  setShowOrderModifyDialog(false);
                }}
              >
                Send Suggestion
              </Button>
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <strong>Note:</strong> The other party will be notified and must approve this modification before it takes effect.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
