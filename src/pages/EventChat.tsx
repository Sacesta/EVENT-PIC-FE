import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChat, Chat } from '@/hooks/use-chat';
import { ChatList } from '@/components/chat/ChatList';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { StartChatModal } from '@/components/chat/StartChatModal';
import { useAuth } from '@/hooks/use-auth';
import { apiService } from '@/services/api';

interface Event {
  _id: string;
  name: string;
  date: string;
  location: string;
  category?: string;
}

const EventChat = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(
    eventId && eventId !== 'select' ? eventId : null
  );
  const { user } = useAuth();
  const [producerEvents, setProducerEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('all'); // 'all' or specific eventId

  // Use the chat hook
  const {
    chats,
    currentChat,
    messages,
    loading,
    error,
    typingUsers,
    isConnected,
    fetchChats,
    fetchEventChats,
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
    messagesEndRef
  } = useChat();

  // Local state for managing chats to update unread counts
  const [localChats, setLocalChats] = useState<Chat[]>([]);

  // Sync local chats with hook chats and filter by selected event or event filter
  useEffect(() => {
    if (selectedEvent && selectedEvent !== 'select') {
      // Filter chats to only show those belonging to the selected event
      const filteredChats = chats.filter(chat => chat.event?._id === selectedEvent);
      console.log('🎯 Filtering chats for event:', selectedEvent, 'Found:', filteredChats.length);
      setLocalChats(filteredChats);
    } else if (eventId === 'select' && eventFilter !== 'all') {
      // On select page, filter by dropdown selection
      const filteredChats = chats.filter(chat => chat.event?._id === eventFilter);
      console.log('🎯 Filtering chats by filter:', eventFilter, 'Found:', filteredChats.length);
      setLocalChats(filteredChats);
    } else {
      // Show all chats
      setLocalChats(chats);
    }
  }, [chats, selectedEvent, eventId, eventFilter]);
  
  // Update selectedEvent when eventId changes
  useEffect(() => {
    if (eventId && eventId !== 'select') {
      setSelectedEvent(eventId);
    }
  }, [eventId]);
  
  // Auto-refresh chat list every 5 seconds to detect new chats
  useEffect(() => {
    if (!selectedEvent || selectedEvent === 'select') return;
    
    console.log('🔄 Starting chat list auto-refresh');
    
    const refreshInterval = setInterval(() => {
      console.log('📡 Auto-refreshing chat list...');
      fetchChats();
    }, 5000); // Refresh every 5 seconds
    
    return () => {
      console.log('🛑 Stopping chat list auto-refresh');
      clearInterval(refreshInterval);
    };
  }, [selectedEvent, fetchChats]);

  // Fetch producer's events
  useEffect(() => {
    const loadProducerEvents = async () => {
      if (user?.role !== 'producer') return;

      try {
        setLoadingEvents(true);
        console.log('📅 Fetching producer events...');
        const response = await apiService.getMyEvents({ limit: 100 });

        if (response.success && response.data?.events) {
          setProducerEvents(response.data.events);
          console.log('✅ Loaded producer events:', response.data.events.length);
        }
      } catch (error) {
        console.error('❌ Error fetching producer events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadProducerEvents();
  }, [user?.role]);

  // Determine the correct dashboard based on user role
  const getDashboardPath = () => {
    if (!user) return '/';

    switch (user.role) {
      case 'producer':
        return '/producer-dashboard';
      case 'supplier':
        return '/supplier-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  // Get current event details
  const getCurrentEvent = () => {
    if (!selectedEvent) return null;
    return producerEvents.find(e => e._id === selectedEvent);
  };

  const currentEvent = getCurrentEvent();

  // Fetch all chats (no longer filtering by event on backend)
  useEffect(() => {
    console.log('🔍 Fetching all chats');
    fetchChats();
  }, [fetchChats]);

  const handleSelectChat = async (chat: Chat) => {
    console.log('🎯 Selecting chat:', chat._id);
    try {
      // Join the chat (this will also fetch messages)
      await joinChat(chat._id, chat);
      
      // Mark as read
      await markAsRead(chat._id);
      
      // Update the chat's unread count to 0 in local state immediately
      setLocalChats(prev => prev.map(c => 
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      ));
      
      console.log('✅ Chat marked as read, unread count reset to 0');
    } catch (error) {
      console.error('Error selecting chat:', error);
    }
  };

  const handleChatCreated = async (newChat: Chat) => {
    console.log('📨 Chat created, handling in EventChat:', newChat);
    
    try {
      // The chat is already added to the list by the createChat function in the hook
      // Just join it and fetch messages
      if (newChat?._id) {
        console.log('🔗 Joining newly created chat:', newChat._id);
        await joinChat(newChat._id, newChat);
        await markAsRead(newChat._id);
      }
    } catch (error) {
      console.error('Error handling created chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link to={getDashboardPath()}>
            <BackButton>
              Back to Dashboard
            </BackButton>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary">
              {eventId === 'select' ? 'All Chats' : 'Event Chat'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {eventId === 'select' ? 'View and manage all your conversations' : `${currentEvent?.name || 'Event'} - Communications Hub`}
            </p>
          </div>

          {/* Event Filter - Show on select page */}
          {eventId === 'select' && user?.role === 'producer' && producerEvents.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {producerEvents.map((event) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* View All Chats Button - Only show when on a specific event page */}
          {eventId !== 'select' && user?.role === 'producer' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/event-chat/select')}
              className="whitespace-nowrap"
            >
              View All Chats
            </Button>
          )}
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <Card className="glass-card mb-4 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm">Connecting to chat server...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="glass-card mb-4 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="text-sm">Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show conversations always (on both select page and specific event pages) */}
        {eventId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] max-h-[700px]">
            {/* Conversations List - Hidden on mobile when chat is selected */}
            <div className={`space-y-4 h-full flex flex-col ${currentChat ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chats</h2>
                <StartChatModal
                  eventId={eventId === 'select' ? undefined : (selectedEvent || eventId || undefined)}
                  onChatCreated={handleChatCreated}
                  trigger={
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Chat
                    </Button>
                  }
                />
              </div>
              <ChatList
                chats={localChats}
                selectedChatId={currentChat?._id}
                onSelectChat={handleSelectChat}
                loading={loading}
              />
            </div>

            {/* Chat Messages - Hidden on mobile when no chat selected */}
            <div className={`lg:col-span-2 ${currentChat ? 'flex flex-col' : 'hidden lg:flex'}`}>
              {currentChat && (
                <div className="flex items-center gap-2 mb-4 lg:hidden">
                  <BackButton
                    variant="ghost"
                    onClick={() => leaveChat(currentChat._id)}
                  >
                    Back to Chats
                  </BackButton>
                </div>
              )}
              <div className="flex-1 min-h-0">
                <ChatMessages
                  chat={currentChat}
                  messages={messages}
                  onSendMessage={sendMessage}
                  onStartTyping={startTyping}
                  onStopTyping={stopTyping}
                  onEditMessage={editMessage}
                  onDeleteMessage={deleteMessage}
                  onAddReaction={addReaction}
                  typingUsers={typingUsers}
                  loading={loading}
                  messagesEndRef={messagesEndRef}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventChat;
