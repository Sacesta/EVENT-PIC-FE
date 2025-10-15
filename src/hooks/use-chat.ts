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
      console.log('🔍 fetchChats called with eventId:', eventId, 'user role:', user?.role);

      let response: ApiResponse<Chat[]>;

      console.log("User role : ",user.role);

      // Use admin endpoint if user is admin and no eventId is specified
      if (user?.role === 'admin' && !eventId) {
        console.log('👑 Admin user detected, using admin chats endpoint');
        response = await apiService.getAllChatsForAdmin() as ApiResponse<Chat[]>;
      } else {
        console.log("normal call")
        response = await apiService.getChats(eventId) as ApiResponse<Chat[]>;
      }

      console.log('📦 fetchChats raw response:', response);

      // Handle different response structures and remove duplicates
      let chatsData: Chat[] = [];
      if (user?.role === 'admin' && !eventId) {
        // Admin endpoint returns data directly in response.data
        if (Array.isArray(response.data)) {
          chatsData = response.data as unknown as Chat[];
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          chatsData = response.data.data;
        }
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        chatsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        chatsData = response.data as unknown as Chat[];
      }

      // Remove duplicates by chatId
      const uniqueChats = chatsData.reduce((acc: Chat[], chat: Chat) => {
        if (!acc.find(c => c._id === chat._id)) {
          acc.push(chat);
        }
        return acc;
      }, []);

      console.log('✅ Unique chats:', uniqueChats.length, uniqueChats);
      setChats(uniqueChats);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.log("error is here : ",error);
      console.error('❌ Error fetching chats:', err);
      setError(error.response?.data?.message || 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  // Fetch chats for a specific event using the dedicated endpoint
  const fetchEventChats = useCallback(async (eventId: string, page = 1, limit = 50) => {
    try {
      setLoading(true);
      console.log('📥 Fetching chats for event:', eventId);
      
      const response = await apiService.getEventChats(eventId, page, limit) as ApiResponse<Chat[]>;
      
      console.log('📥 fetchEventChats response:', response);
      
      // Handle response - backend returns data directly in response.data
      let chatsData: Chat[] = [];
      if (Array.isArray(response.data.data)) {
        chatsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        chatsData = response.data as unknown as Chat[];
      }
      
      setChats(chatsData);
      console.log('✅ Event chats set:', chatsData.length);
      
      return chatsData;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch event chats');
      console.error('❌ Error fetching event chats:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a specific chat
  const fetchMessages = useCallback(async (chatId: string, page = 1) => {
    try {
      setLoading(true);
      console.log('🔍 fetchMessages called for chatId:', chatId, 'page:', page);
      
      const response = await apiService.getChatMessages(chatId, page, 25) as ApiResponse<ChatMessage[]>;
      console.log('📦 Raw API response:', response);
      
      // Handle different response structures
      let newMessages: ChatMessage[] = [];
      
      if (response.data?.data) {
        newMessages = response.data.data;
        console.log('✅ Messages from response.data.data:', newMessages);
      } else if (Array.isArray(response.data)) {
        newMessages = response.data as unknown as ChatMessage[];
        console.log('✅ Messages from response.data (array):', newMessages);
      } else if (response.data) {
        newMessages = response.data as unknown as ChatMessage[];
        console.log('✅ Messages from response.data:', newMessages);
      }
      
      console.log('📊 Total messages fetched:', newMessages.length);
      console.log('📝 Messages array:', newMessages);
      
      if (page === 1) {
        setMessages(newMessages);
        console.log('✅ Set messages (page 1):', newMessages.length, 'messages');
      } else {
        setMessages(prev => [...newMessages, ...(prev || [])]);
        console.log('✅ Appended messages (page', page, ')');
      }
      
      return response.data.pagination?.hasMore || false;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('❌ Error fetching messages:', err);
      console.error('❌ Error details:', error);
      setError(error.response?.data?.message || 'Failed to fetch messages');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get chat details
  const getChatDetails = useCallback(async (chatId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getChatDetails(chatId) as ApiResponse<Chat>;
      return response.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch chat details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create or find chat
  const createChat = useCallback(async (participants: Array<{ userId: string; role: string }>, eventId?: string, title?: string) => {
    try {
      setLoading(true);
      const response = await apiService.createChat(participants, eventId, title) as ApiResponse<Chat>;
      
      // Handle different response structures
      let newChat: Chat;
      if (response.data?.data) {
        newChat = response.data.data;
      } else if (response.data) {
        newChat = response.data as unknown as Chat;
      } else {
        throw new Error('Invalid response structure');
      }
      
      console.log('✅ Chat created successfully:', newChat);
      
      setChats(prev => [newChat, ...(prev || [])]);
      return newChat;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('❌ Failed to create chat:', err);
      setError(error.response?.data?.message || 'Failed to create chat');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update chat settings
  const updateChatSettings = useCallback(async (chatId: string, settings: { allowFileSharing?: boolean; notifications?: boolean; title?: string }) => {
    try {
      setLoading(true);
      const response = await apiService.updateChatSettings(chatId, settings) as ApiResponse<Chat>;
      const updatedChat = response.data.data;
      
      // Update chat in list
      setChats(prev => (prev || []).map(chat => chat._id === chatId ? updatedChat : chat));
      
      // Update current chat if it's the one being updated
      if (currentChat?._id === chatId) {
        setCurrentChat(updatedChat);
      }
      
      return updatedChat;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update chat settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Add participant to chat
  const addChatParticipant = useCallback(async (chatId: string, userId: string, role: string) => {
    try {
      setLoading(true);
      const response = await apiService.addParticipant(chatId, userId, role) as ApiResponse<Chat>;
      const updatedChat = response.data.data;
      
      // Update chat in list
      setChats(prev => (prev || []).map(chat => chat._id === chatId ? updatedChat : chat));
      
      // Update current chat if it's the one being updated
      if (currentChat?._id === chatId) {
        setCurrentChat(updatedChat);
      }
      
      return updatedChat;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to add participant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Remove participant from chat
  const removeChatParticipant = useCallback(async (chatId: string, userId: string) => {
    try {
      setLoading(true);
      const response = await apiService.removeParticipant(chatId, userId) as ApiResponse<Chat>;
      const updatedChat = response.data.data;
      
      // Update chat in list
      setChats(prev => (prev || []).map(chat => chat._id === chatId ? updatedChat : chat));
      
      // Update current chat if it's the one being updated
      if (currentChat?._id === chatId) {
        setCurrentChat(updatedChat);
      }
      
      return updatedChat;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to remove participant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Archive chat
  const archiveChatById = useCallback(async (chatId: string) => {
    try {
      setLoading(true);
      const response = await apiService.archiveChat(chatId) as ApiResponse<Chat>;
      const updatedChat = response.data.data;
      
      // Update chat in list
      setChats(prev => (prev || []).map(chat => chat._id === chatId ? updatedChat : chat));
      
      // Update current chat if it's the one being updated
      if (currentChat?._id === chatId) {
        setCurrentChat(updatedChat);
      }
      
      return updatedChat;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to archive chat');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Upload file
  const uploadFile = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const response = await apiService.uploadChatFile(file, onProgress) as unknown as {
        data: {
          filename: string;
          originalName: string;
          mimeType: string;
          size: number;
          url: string;
          thumbnailUrl?: string;
        };
      };
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to upload file');
      throw err;
    }
  }, []);

  // Send file message
  const sendFileMessage = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    if (!currentChat) {
      setError('No chat selected');
      return;
    }

    try {
      // Upload file first
      const uploadedFile = await uploadFile(file, onProgress);
      
      // Determine message type based on file mime type
      const messageType = uploadedFile.mimeType.startsWith('image/') ? 'image' : 'file';
      
      // Send message with attachment
      await apiService.sendChatMessage(currentChat._id, {
        content: uploadedFile.originalName,
        type: messageType,
        attachments: [uploadedFile]
      });
      
      // The message will be added via socket event
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to send file message');
      throw err;
    }
  }, [currentChat, uploadFile]);

  // Send message via HTTP API (more reliable than socket)
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'file' = 'text', replyTo?: string) => {
    if (!currentChat || !content.trim()) {
      console.warn('Cannot send message: no chat selected or empty content');
      return;
    }

    console.log('✉️ Sending message to chat:', currentChat._id, { content, type, replyTo });

    try {
      console.log('📤 Sending message via HTTP API...');
      const response = await apiService.sendChatMessage(currentChat._id, {
        content: content.trim(),
        type,
        replyTo
      });

      console.log('✅ Message sent successfully:', response);
      
      // DON'T add message optimistically - let socket/polling handle it
      // This prevents duplicate messages
      console.log('⏳ Waiting for socket/polling to add message to UI...');
      
      return response;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      throw error;
    }
  }, [currentChat]);

  // Join chat room
  const joinChat = useCallback(async (chatId: string, chatData?: Chat) => {
    if (!socket) {
      console.warn('Socket not connected, cannot join chat');
      return;
    }
    
    console.log('🔗 Joining chat:', chatId);
    
    // Emit socket event to join the chat room
    socket.emit('join_chat', { chatId });
    
    // Set current chat
    if (chatData) {
      setCurrentChat(chatData);
    } else {
      // Otherwise, find it in the chats array or fetch it
      const existingChat = (chats || []).find(chat => chat._id === chatId);
      if (existingChat) {
        setCurrentChat(existingChat);
      } else {
        // Fetch chat details if not in list
        try {
          const chatDetails = await getChatDetails(chatId);
          setCurrentChat(chatDetails);
        } catch (error) {
          console.error('Failed to fetch chat details:', error);
        }
      }
    }
    
    // Fetch messages for this chat
    try {
      console.log('📥 Fetching messages for chat:', chatId);
      await fetchMessages(chatId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [socket, chats, getChatDetails, fetchMessages]);

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
        setMessages(prev => [...(prev || []), data.message]);
        scrollToBottom();
      }
      
      // Update chat list with new message
      setChats(prev => (prev || []).map(chat => {
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
      setChats(prev => (prev || []).map(chat => {
        if (chat._id === data.chatId) {
          return { ...chat, unreadCount: data.unreadCount };
        }
        return chat;
      }));
    };

    const handleUserTyping = (data: { userId: string; userName: string; chatId: string }) => {
      if (data.chatId === currentChat?._id && data.userId !== user?._id) {
        setTypingUsers(prev => {
          const exists = (prev || []).find(u => u.userId === data.userId);
          if (!exists) {
            return [...(prev || []), { userId: data.userId, userName: data.userName }];
          }
          return prev || [];
        });
      }
    };

    const handleUserStoppedTyping = (data: { userId: string; userName: string; chatId: string }) => {
      if (data.chatId === currentChat?._id) {
        setTypingUsers(prev => (prev || []).filter(u => u.userId !== data.userId));
      }
    };

    const handleMessageEdited = (data: { messageId: string; newContent: string; editedAt: string }) => {
      setMessages(prev => (prev || []).map(msg => 
        msg._id === data.messageId 
          ? { ...msg, content: data.newContent, editedAt: data.editedAt }
          : msg
      ));
    };

    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages(prev => (prev || []).map(msg => 
        msg._id === data.messageId 
          ? { ...msg, content: 'This message was deleted', deletedAt: new Date().toISOString() }
          : msg
      ));
    };

    const handleReactionAdded = (data: { messageId: string; userId: string; userName: string; emoji: string; reactions: ChatMessage['reactions'] }) => {
      setMessages(prev => (prev || []).map(msg => 
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

  // Poll for new messages every 3 seconds when chat is open (fallback for no WebSocket)
  useEffect(() => {
    if (!currentChat) {
      console.log('⚠️ No current chat, skipping polling');
      return;
    }

    console.log('🔄 Starting message polling for chat:', currentChat._id);
    console.log('📊 Current messages count:', messages.length);
    
    const pollInterval = setInterval(async () => {
      try {
        console.log('📡 Polling for new messages at:', new Date().toLocaleTimeString());
        const response = await apiService.getChatMessages(currentChat._id, 1, 25) as ApiResponse<ChatMessage[]>;
        
        console.log('📦 Poll response:', response);
        console.log('📦 Poll response.data:', response.data);
        console.log('📦 Poll response.data.data:', response.data?.data);
        
        let newMessages: ChatMessage[] = [];
        
        // Try multiple response structures
        if (response.data?.data && Array.isArray(response.data.data)) {
          newMessages = response.data.data;
          console.log('✓ Using response.data.data');
        } else if (response.data && Array.isArray(response.data)) {
          newMessages = response.data as unknown as ChatMessage[];
          console.log('✓ Using response.data');
        } else if (response && Array.isArray(response)) {
          newMessages = response as unknown as ChatMessage[];
          console.log('✓ Using response directly');
        } else {
          console.log('❌ Could not parse response structure');
          console.log('📦 Full response object:', JSON.stringify(response, null, 2));
        }
        
        console.log('📊 Fetched messages count:', newMessages.length);
        console.log('📊 Current messages count:', messages.length);
        
        // Only update if we have different messages
        setMessages(prev => {
          const prevIds = new Set((prev || []).map(m => m._id));
          const newIds = new Set(newMessages.map(m => m._id));
          
          console.log('🔍 Previous message IDs:', Array.from(prevIds));
          console.log('🔍 New message IDs:', Array.from(newIds));
          
          const hasNewMessages = newMessages.some(m => !prevIds.has(m._id));
          const hasDifferentCount = newMessages.length !== (prev || []).length;
          
          if (hasNewMessages || hasDifferentCount) {
            console.log('✅ New messages found! Updating UI');
            console.log('📝 New messages:', newMessages);
            scrollToBottom();
            return newMessages;
          }
          
          console.log('ℹ️ No new messages');
          return prev || [];
        });
      } catch (error) {
        console.error('❌ Error polling messages:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      console.log('🛑 Stopping message polling for chat:', currentChat._id);
      clearInterval(pollInterval);
    };
  }, [currentChat, scrollToBottom]);

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
    fetchEventChats,
    fetchMessages,
    getChatDetails,
    createChat,
    updateChatSettings,
    sendMessage,
    sendFileMessage,
    uploadFile,
    joinChat,
    leaveChat,
    markAsRead,
    startTyping,
    stopTyping,
    addReaction,
    editMessage,
    deleteMessage,
    addChatParticipant,
    removeChatParticipant,
    archiveChatById,
    
    // Refs
    messagesEndRef
  };
};
