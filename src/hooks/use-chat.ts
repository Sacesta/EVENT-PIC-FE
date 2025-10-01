import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './use-socket';
import { useAuth } from './use-auth';
import apiService from '@/services/api';

interface ApiResponse<T> {
  data: {
    data: T;
    pagination?: {
      hasMore?: boolean;
    };
  };
}

export interface ChatMessage {
  _id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  replyTo?: {
    _id: string;
    content: string;
    sender: {
      _id: string;
      name: string;
      role: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  reactions?: Array<{
    user: string;
    emoji: string;
    createdAt: string;
  }>;
}

export interface Chat {
  _id: string;
  participants: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      profileImage?: string;
    };
    role: string;
    lastReadAt: string;
    isActive: boolean;
  }>;
  event?: {
    _id: string;
    name: string;
    date: string;
    location: string;
  };
  title?: string;
  status: 'active' | 'archived' | 'blocked';
  lastMessage?: {
    content: string;
    sender: {
      _id: string;
      name: string;
      role: string;
      profileImage?: string;
    };
    timestamp: string;
  };
  unreadCounts: Array<{
    user: string;
    count: number;
  }>;
  unreadCount?: number;
  settings: {
    allowFileSharing: boolean;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseChatOptions {
  chatId?: string;
  autoConnect?: boolean;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { chatId, autoConnect = true } = options;
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; userName: string }>>([]);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch chats
  const fetchChats = useCallback(async (eventId?: string) => {
    try {
      setLoading(true);
      const response = await apiService.getChats(eventId) as ApiResponse<Chat[]>;
      setChats(response.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a specific chat
  const fetchMessages = useCallback(async (chatId: string, page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getChatMessages(chatId, page, 25) as ApiResponse<ChatMessage[]>;
      const newMessages = response.data.data;
      
      if (page === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }
      
      return response.data.pagination?.hasMore || false;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch messages');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create or find chat
  const createChat = useCallback(async (participants: Array<{ userId: string; role: string }>, eventId?: string, title?: string) => {
    try {
      setLoading(true);
      const response = await apiService.createChat(participants, eventId, title) as ApiResponse<Chat>;
      const newChat = response.data.data;
      
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create chat');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback((content: string, type: 'text' | 'image' | 'file' = 'text', replyTo?: string) => {
    if (!socket || !currentChat || !content.trim()) return;

    socket.emit('send_message', {
      chatId: currentChat._id,
      content: content.trim(),
      type,
      replyTo
    });
  }, [socket, currentChat]);

  // Join chat room
  const joinChat = useCallback((chatId: string) => {
    if (!socket) return;
    
    socket.emit('join_chat', { chatId });
    setCurrentChat(chats.find(chat => chat._id === chatId) || null);
  }, [socket, chats]);

  // Leave chat room
  const leaveChat = useCallback((chatId: string) => {
    if (!socket) return;
    
    socket.emit('leave_chat', { chatId });
    if (currentChat?._id === chatId) {
      setCurrentChat(null);
      setMessages([]);
    }
  }, [socket, currentChat]);

  // Mark messages as read
  const markAsRead = useCallback(async (chatId: string) => {
    try {
      await apiService.markChatAsRead(chatId);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, []);

  // Typing indicators
  const stopTyping = useCallback(() => {
    if (!socket || !currentChat) return;
    
    socket.emit('typing_stop', { chatId: currentChat._id });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [socket, currentChat]);

  const startTyping = useCallback(() => {
    if (!socket || !currentChat) return;
    
    socket.emit('typing_start', { chatId: currentChat._id });
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [socket, currentChat, stopTyping]);

  // Add reaction to message
  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!socket) return;
    
    socket.emit('add_reaction', { messageId, emoji });
  }, [socket]);

  // Edit message
  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (!socket) return;
    
    socket.emit('edit_message', { messageId, newContent });
  }, [socket]);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    if (!socket) return;
    
    socket.emit('delete_message', { messageId });
  }, [socket]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: { message: ChatMessage; chatId: string }) => {
      if (data.chatId === currentChat?._id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
      
      // Update chat list with new message
      setChats(prev => prev.map(chat => {
        if (chat._id === data.chatId) {
          return {
            ...chat,
            lastMessage: {
              content: data.message.content,
              sender: data.message.sender,
              timestamp: data.message.createdAt
            }
          };
        }
        return chat;
      }));
    };

    const handleUnreadCountUpdate = (data: { chatId: string; unreadCount: number }) => {
      setChats(prev => prev.map(chat => {
        if (chat._id === data.chatId) {
          return { ...chat, unreadCount: data.unreadCount };
        }
        return chat;
      }));
    };

    const handleUserTyping = (data: { userId: string; userName: string; chatId: string }) => {
      if (data.chatId === currentChat?._id && data.userId !== user?._id) {
        setTypingUsers(prev => {
          const exists = prev.find(u => u.userId === data.userId);
          if (!exists) {
            return [...prev, { userId: data.userId, userName: data.userName }];
          }
          return prev;
        });
      }
    };

    const handleUserStoppedTyping = (data: { userId: string; userName: string; chatId: string }) => {
      if (data.chatId === currentChat?._id) {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    };

    const handleMessageEdited = (data: { messageId: string; newContent: string; editedAt: string }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, content: data.newContent, editedAt: data.editedAt }
          : msg
      ));
    };

    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, content: 'This message was deleted', deletedAt: new Date().toISOString() }
          : msg
      ));
    };

    const handleReactionAdded = (data: { messageId: string; userId: string; userName: string; emoji: string; reactions: ChatMessage['reactions'] }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
    };

    // Register event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('unread_count_update', handleUnreadCountUpdate);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('reaction_added', handleReactionAdded);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('unread_count_update', handleUnreadCountUpdate);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('reaction_added', handleReactionAdded);
    };
  }, [socket, currentChat, user, scrollToBottom]);

  // Auto-connect to chat if provided
  useEffect(() => {
    if (autoConnect && chatId && isConnected) {
      joinChat(chatId);
    }
  }, [autoConnect, chatId, isConnected, joinChat]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    chats,
    currentChat,
    messages,
    loading,
    error,
    typingUsers,
    isConnected,
    
    // Actions
    fetchChats,
    fetchMessages,
    createChat,
    sendMessage,
    joinChat,
    leaveChat,
    markAsRead,
    startTyping,
    stopTyping,
    addReaction,
    editMessage,
    deleteMessage,
    
    // Refs
    messagesEndRef
  };
};
