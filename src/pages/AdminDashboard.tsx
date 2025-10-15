import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Calendar, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Settings,
  BarChart3,
  UserCheck,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import UserManagement from '@/components/admin/UserManagement';
import CreateUserModal from '@/components/admin/CreateUserModal';
import OrdersManagement from '@/components/admin/OrdersManagement';
import { ChatList } from '@/components/chat/ChatList';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { useChat, Chat } from '@/hooks/use-chat';

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalServices: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  verificationStatus: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  language: string;
  profileImage?: string;
  producerDetails?: {
    companyName?: string;
    specializations: string[];
  };
  supplierDetails?: {
    companyName?: string;
    categories: string[];
    rating: {
      average: number;
      count: number;
    };
  };
}

interface Event {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  producer: {
    name: string;
  };
}

interface Order {
  _id: string;
  eventName: string;
  eventDate: string;
  services: Array<{
    name: string;
    category: string;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  clientName: string;
  location: string;
  createdAt: string;
  supplier?: {
    _id: string;
    name: string;
    email: string;
  };
  producer?: {
    _id: string;
    name: string;
    email: string;
  };
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    activeUsers: 0,
    newUsersThisMonth: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Chat functionality
  const {
    chats,
    currentChat,
    messages,
    loading: chatLoading,
    error: chatError,
    typingUsers,
    isConnected,
    fetchChats,
    sendMessage,
    joinChat,
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

  // Fetch chats when Chats tab is active
  useEffect(() => {
    if (activeTab === 'chats') {
      console.log('🔍 Admin Dashboard - Fetching all chats');
      fetchChats();
    }
  }, [activeTab, fetchChats]);

  // Auto-refresh chat list every 5 seconds when on chats tab
  useEffect(() => {
    if (activeTab !== 'chats') return;
    
    console.log('🔄 Starting chat list auto-refresh for admin');
    
    const refreshInterval = setInterval(() => {
      console.log('📡 Auto-refreshing admin chat list...');
      fetchChats();
    }, 5000);
    
    return () => {
      console.log('🛑 Stopping admin chat list auto-refresh');
      clearInterval(refreshInterval);
    };
  }, [activeTab, fetchChats]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch admin dashboard data
      const [statsData, usersData, eventsData, ordersData, pendingData] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getUsers({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
        apiService.getEvents({ limit: 10, sort: '-createdAt' }),
        apiService.getAllOrders({ limit: 10, sort: '-createdAt' }),
        apiService.getPendingVerifications()
      ]);

      // Set stats
      if (statsData?.data) {
        const dashboardData = statsData.data as { overview: DashboardStats };
        const overview = dashboardData.overview;
        setStats({
          totalUsers: overview.totalUsers || 0,
          totalEvents: overview.totalEvents || 0,
          totalServices: overview.totalServices || 0,
          totalOrders: overview.totalOrders || 0,
          totalRevenue: overview.totalRevenue || 0,
          pendingVerifications: Array.isArray(pendingData?.data) ? pendingData.data.length : 0,
          activeUsers: overview.totalUsers || 0,
          newUsersThisMonth: 0 // This would need to be calculated separately
        });
      }

      // Set recent users
      if (usersData?.data) {
        const usersResponse = usersData.data as User[];
        setRecentUsers(usersResponse);
      }

      // Set recent events
      if (eventsData?.data) {
        const eventsResponse = eventsData.data as { events: Event[] };
        if (eventsResponse.events) {
          setRecentEvents(eventsResponse.events);
        }
      }

      // Set recent orders
      if (ordersData?.data) {
        const ordersResponse = ordersData.data as { orders: Order[] } | Order[];
        if (Array.isArray(ordersResponse)) {
          setRecentOrders(ordersResponse);
        } else if (ordersResponse.orders) {
          setRecentOrders(ordersResponse.orders);
        }
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleVerifyUser = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      await apiService.updateUserVerification(userId, status);
      toast({
        title: "Success",
        description: `User verification ${status} successfully`,
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating user verification:', error);
      toast({
        title: "Error",
        description: "Failed to update user verification",
        variant: "destructive"
      });
    }
  };

  // Chat handlers
  const handleSelectChat = async (chat: Chat) => {
    console.log('🎯 Admin selecting chat:', chat._id);
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
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive"
      });
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient-primary mb-2">
          {t('dashboard.admin.title', 'Admin Dashboard')}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.admin.subtitle', 'Manage the platform and oversee all activities')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.admin.totalUsers', 'Total Users')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} {t('dashboard.admin.thisMonth', 'this month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.admin.totalEvents', 'Total Events')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.admin.allTime', 'All time')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.admin.totalRevenue', 'Total Revenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.admin.platformRevenue', 'Platform revenue')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.admin.pendingVerifications', 'Pending Verifications')}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.admin.awaitingApproval', 'Awaiting approval')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('dashboard.admin.overview', 'Overview')}</TabsTrigger>
          <TabsTrigger value="users">{t('dashboard.admin.users', 'Users')}</TabsTrigger>
          <TabsTrigger value="orders">{t('dashboard.admin.orders', 'Orders')}</TabsTrigger>
          <TabsTrigger value="events">{t('dashboard.admin.events', 'Events')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('dashboard.admin.analytics', 'Analytics')}</TabsTrigger>
          <TabsTrigger value="chats">{t('dashboard.admin.chats', 'Chats')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  {t('dashboard.admin.recentUsers', 'Recent Users')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.admin.newlyRegistered', 'Newly registered users')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        {user.verificationStatus === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyUser(user._id, 'approved')}
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyUser(user._id, 'rejected')}
                            >
                              ✗
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('dashboard.admin.recentEvents', 'Recent Events')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.admin.latestCreated', 'Latest created events')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('dashboard.admin.by', 'by')} {event.producer.name}
                        </p>
                      </div>
                      <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage all platform users and their verification status
              </p>
            </div>
            <Button onClick={() => setIsCreateUserModalOpen(true)}>
              Create New User
            </Button>
          </div>
          <UserManagement 
            users={recentUsers} 
            onRefresh={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersManagement 
            orders={recentOrders} 
            onRefresh={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.admin.eventManagement', 'Event Management')}</CardTitle>
              <CardDescription>
                {t('dashboard.admin.manageAllEvents', 'Manage all platform events')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('dashboard.admin.eventManagementComingSoon', 'Event management features coming soon...')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.admin.analytics', 'Analytics')}</CardTitle>
              <CardDescription>
                {t('dashboard.admin.platformAnalytics', 'Platform analytics and insights')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('dashboard.admin.analyticsComingSoon', 'Analytics features coming soon...')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chats" className="space-y-6">
          {/* Connection Status */}
          {!isConnected && (
            <Card className="glass-card border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-sm">{t('chat.connecting', 'Connecting to chat server...')}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-350px)] max-h-[700px]">
            {/* Conversations List */}
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  {t('dashboard.admin.allChats', 'All Platform Chats')}
                </h2>
              </div>
              <ChatList
                chats={localChats}
                selectedChatId={currentChat?._id}
                onSelectChat={handleSelectChat}
                loading={chatLoading}
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
                loading={chatLoading}
                messagesEndRef={messagesEndRef}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default AdminDashboard;
