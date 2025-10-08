import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat, Chat } from '@/hooks/use-chat';
import { ChatList } from '@/components/chat/ChatList';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { StartChatModal } from '@/components/chat/StartChatModal';
import { useAuth } from '@/hooks/use-auth';

const EventChat = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(
    eventId && eventId !== 'select' ? eventId : null
  );
  const { user } = useAuth();
  
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
  
  // Sync local chats with hook chats
  useEffect(() => {
    setLocalChats(chats);
  }, [chats]);
  
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

  // Mock events data for selection
  const mockEvents = [
    { id: '1', name: 'Summer Music Festival', location: 'Central Park, New York' },
    { id: '2', name: 'Corporate Gala', location: 'Grand Hotel Ballroom' },
    { id: '3', name: 'Tech Conference 2024', location: 'Convention Center' },
    { id: '4', name: 'Wedding Reception', location: 'Seaside Resort' }
  ];

  // Mock event data - in real app this would come from backend  
  const getCurrentEvent = () => {
    if (!selectedEvent) return null;
    return mockEvents.find(e => e.id === selectedEvent) || {
      id: selectedEvent,
      name: 'Summer Music Festival',
      date: new Date('2024-06-15'),
      location: 'Central Park, New York'
    };
  };

  const mockEvent = getCurrentEvent();

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
        <div className="flex items-center gap-4 mb-8">
          <Link to={getDashboardPath()}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gradient-primary">Event Chat</h1>
            <p className="text-muted-foreground">
              {eventId === 'select' ? 'Select an event to view its conversations' : `${mockEvent?.name} - Communications Hub`}
            </p>
          </div>
        </div>

        {/* Event Selection */}
        {eventId === 'select' && !selectedEvent && (
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle>Select an Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockEvents?.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedEvent(event.id)}
                  >
                    <h3 className="font-semibold mb-2">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Show conversations only if we have a selected event */}
        {((eventId !== 'select') || selectedEvent) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] max-h-[700px]">
            {/* Conversations List */}
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chats</h2>
                <StartChatModal
                  eventId={selectedEvent || undefined}
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

            {/* Chat Messages */}
            <div className="lg:col-span-2">
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
        )}
      </div>
    </div>
  );
};

export default EventChat;
