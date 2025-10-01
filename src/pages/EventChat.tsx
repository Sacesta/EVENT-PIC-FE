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

// Remove the old interfaces as they're now defined in the hooks

const EventChat = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(eventId !== 'select' ? eventId || null : null);
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

  // Fetch chats when event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchChats(selectedEvent);
    }
  }, [selectedEvent, fetchChats]);

  const handleSelectChat = (chat: Chat) => {
    joinChat(chat._id);
    markAsRead(chat._id);
  };

  const handleChatCreated = (newChat: Chat) => {
    // The chat will be automatically added to the chats list by the hook
    joinChat(newChat._id);
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
                {mockEvents.map((event) => (
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="space-y-4">
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
                chats={chats}
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