import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MessageCircle,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import apiService, { Event as ApiEvent } from '@/services/api';
import UserManagement from '@/components/admin/UserManagement';
import CreateUserModal from '@/components/admin/CreateUserModal';
import OrdersManagement from '@/components/admin/OrdersManagement';
import ProducerSelectionModal from '@/components/admin/ProducerSelectionModal';
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

interface AdminEvent {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  producer?: {
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
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if current language is RTL (Hebrew)
  const isRTL = i18n.language === 'he';
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
  const [recentEvents, setRecentEvents] = useState<AdminEvent[]>([]);
  const [allEvents, setAllEvents] = useState<AdminEvent[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isProducerSelectionModalOpen, setIsProducerSelectionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [eventsLoading, setEventsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Cache management
  const [dataCache, setDataCache] = useState<{
    events: { data: AdminEvent[]; timestamp: number };
    orders: { data: Order[]; timestamp: number };
    users: { data: User[]; timestamp: number };
  }>({
    events: { data: [], timestamp: 0 },
    orders: { data: [], timestamp: 0 },
    users: { data: [], timestamp: 0 }
  });

  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Cache helper functions
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_TTL;
  }, [CACHE_TTL]);

  const updateCache = useCallback(<T extends AdminEvent[] | Order[] | User[]>(key: 'events' | 'orders' | 'users', data: T) => {
    setDataCache(prev => ({
      ...prev,
      [key]: { data, timestamp: Date.now() }
    }));
  }, []);

  const getCachedData = useCallback(<T extends AdminEvent[] | Order[] | User[]>(key: 'events' | 'orders' | 'users'): T | null => {
    const cached = dataCache[key];
    if (isCacheValid(cached.timestamp)) {
      return cached.data as T;
    }
    return null;
  }, [dataCache, isCacheValid]);

  // Helper to map API Event to AdminEvent
  const mapApiEventToAdminEvent = useCallback((apiEvent: ApiEvent): AdminEvent => {
    return {
      _id: apiEvent._id,
      title: apiEvent.name || 'Untitled Event',
      status: apiEvent.status,
      createdAt: apiEvent.createdAt || apiEvent.startDate,
      producer: apiEvent.producerId ? { name: apiEvent.producerId.name } : undefined
    };
  }, []);

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
    reconnectSocket,
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

  // Manual refresh for chat list - no auto-refresh
  const handleRefreshChats = useCallback(() => {
    console.log('📡 Manually refreshing admin chat list...');
    fetchChats();
  }, [fetchChats]);

  // Handle WebSocket reconnection
  const handleReconnect = useCallback(() => {
    console.log('🔄 Attempting to reconnect to WebSocket...');
    reconnectSocket();
  }, [reconnectSocket]);

  const handleProducerSelect = useCallback((producer: { _id: string; name: string; email: string; role: string; producerDetails?: { companyName?: string; specializations: string[] } }) => {
    // Store the selected producer in localStorage for the create event page
    localStorage.setItem('adminSelectedProducer', JSON.stringify(producer));
    // Navigate to create event page
    window.location.href = '/create-event';
  }, []);

  // Fetch events function with caching
  const fetchEvents = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
      const cachedEvents = getCachedData<AdminEvent[]>('events');
      if (cachedEvents) {
        setAllEvents(cachedEvents);
        setRecentEvents(cachedEvents.slice(0, 10));
        return;
      }
    }

    setEventsLoading(true);
    try {
      const eventsData = await apiService.getAllEvents({
        limit: 50,
        page: 1,
        includePastEvents: true  // Admin dashboard shows all events including past ones
      });

      if (eventsData?.data) {
        // Map API Events to AdminEvents
        const mappedEvents = eventsData.data.map(mapApiEventToAdminEvent);
        setAllEvents(mappedEvents);
        setRecentEvents(mappedEvents.slice(0, 10));
        updateCache('events', mappedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setEventsLoading(false);
    }
  }, [toast, getCachedData, updateCache, mapApiEventToAdminEvent]);

  // Fetch orders function with caching
  const fetchOrders = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
      const cachedOrders = getCachedData<Order[]>('orders');
      if (cachedOrders) {
        setAllOrders(cachedOrders);
        setRecentOrders(cachedOrders.slice(0, 10));
        return;
      }
    }

    setOrdersLoading(true);
    try {
      const ordersData = await apiService.getAllOrders({ limit: 100, sort: '-createdAt' });
      
      if (ordersData?.data) {
        const ordersResponse = ordersData.data as { orders: Order[] } | Order[];
        let orders: Order[] = [];
        
        if (Array.isArray(ordersResponse)) {
          orders = ordersResponse;
        } else if (ordersResponse.orders) {
          orders = ordersResponse.orders;
        }
        
        setAllOrders(orders);
        setRecentOrders(orders.slice(0, 10));
        updateCache('orders', orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setOrdersLoading(false);
    }
  }, [toast, getCachedData, updateCache]);

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
        const eventsResponse = eventsData.data as { events: ApiEvent[] };
        if (eventsResponse.events) {
          const mappedEvents = eventsResponse.events.map(mapApiEventToAdminEvent);
          setRecentEvents(mappedEvents);
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
  }, [toast, mapApiEventToAdminEvent]);

  useEffect(() => {
    fetchDashboardData();
    fetchEvents(); // Fetch events on component mount
    fetchOrders(); // Fetch orders on component mount
  }, [fetchDashboardData, fetchEvents, fetchOrders]);

  // Fetch data when specific tabs are active (with caching)
  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchEvents, fetchOrders]);

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

      // Admin should NOT mark messages as read - they're just monitoring
      // Do not call markAsRead() for admins

      console.log('✅ Admin viewing chat (read-only monitoring mode)');
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
    <div className={`container mx-auto px-2 sm:px-4 py-4 sm:py-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-2">
          {t('dashboard.admin.title', 'Admin Dashboard')}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t('dashboard.admin.subtitle', 'Manage the platform and oversee all activities')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className={`space-y-4 sm:space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <BarChart3 className="h-4 w-4 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('dashboard.admin.overview', 'Overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <Users className="h-4 w-4 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('dashboard.admin.users', 'Users')}</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <Package className="h-4 w-4 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('dashboard.admin.orders', 'Orders')}</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <Calendar className="h-4 w-4 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('dashboard.admin.events', 'Events')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <TrendingUp className="h-4 w-4 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('dashboard.admin.analytics', 'Analytics')}</span>
          </TabsTrigger>
          <TabsTrigger value="chats" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <MessageCircle className="h-4 w-4 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('dashboard.admin.chats', 'Chats')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className={`space-y-4 sm:space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                  {recentUsers.length > 0 ? recentUsers.map((user) => (
                    <div key={user._id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : 'space-x-3'} flex-1 min-w-0`}>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm sm:text-base font-medium">
                            {user.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <p className="text-sm font-medium truncate">{user.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="flex-shrink-0">
                          {user.role}
                        </Badge>
                        {user.verificationStatus === 'pending' && (
                          <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyUser(user._id, 'approved')}
                              className="h-8 w-8 p-0"
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyUser(user._id, 'rejected')}
                              className="h-8 w-8 p-0"
                            >
                              ✗
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent users found
                    </p>
                  )}
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
                  {recentEvents.length > 0 ? recentEvents.map((event) => (
                    <div key={event._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('dashboard.admin.by', 'by')} {event.producer?.name || 'Unknown'}
                        </p>
                      </div>
                      <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent events found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className={`space-y-4 sm:space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-start sm:items-center gap-4`}>
            <div>
              <h3 className="text-lg font-semibold">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage all platform users and their verification status
              </p>
            </div>
            <Button onClick={() => setIsCreateUserModalOpen(true)} className="w-full sm:w-auto">
              Create New User
            </Button>
          </div>
          <UserManagement 
            users={recentUsers} 
            onRefresh={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="orders" className={`space-y-4 sm:space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-start sm:items-center gap-4`}>
            <div>
              <h3 className="text-lg font-semibold">{t('dashboard.admin.orderManagement', 'Order Management')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.admin.manageAllOrders', 'Manage all platform orders')}
              </p>
            </div>
            <Button onClick={() => fetchOrders(true)} disabled={ordersLoading} className="gap-2 w-full sm:w-auto">
              <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
              {ordersLoading ? 'Loading...' : 'Refresh Orders'}
            </Button>
          </div>

          {ordersLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allOrders.length > 0 ? (
            <div className="space-y-4">
              {allOrders.map((order) => (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className={`flex ${isRTL ? 'lg:flex-row-reverse' : 'lg:flex-row'} justify-between items-start gap-4`}>
                      <div className="flex-1 w-full">
                        <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-start sm:items-center gap-2 mb-3`}>
                          <h4 className="font-semibold text-lg">{order.eventName}</h4>
                          <Badge 
                            variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'accepted' ? 'secondary' :
                              order.status === 'pending' ? 'outline' : 'destructive'
                            }
                            className="self-start sm:self-auto"
                          >
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Client:</span> {order.clientName}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {order.location}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(order.eventDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Total:</span> ₪{order.totalAmount.toLocaleString()}
                          </div>
                        </div>

                        {order.supplier && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Supplier:</span> {order.supplier.name}
                          </div>
                        )}

                        {order.producer && (
                          <div className="mt-1 text-sm">
                            <span className="font-medium">Producer:</span> {order.producer.name}
                          </div>
                        )}

                        <div className="mt-3">
                          <span className="font-medium text-sm">Services:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {order.services.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service.name} - ₪{service.price}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-muted-foreground">
                          Order ID: {order._id.slice(-8)} | Created: {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2 w-full lg:w-auto`}>
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground">
                  There are no orders on the platform yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events" className={`space-y-4 sm:space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-start sm:items-center gap-4`}>
            <div>
              <h3 className="text-lg font-semibold">{t('dashboard.admin.eventManagement', 'Event Management')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.admin.manageAllEvents', 'Manage all platform events')}
              </p>
            </div>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2 w-full sm:w-auto`}>
              <Button
                onClick={() => setIsProducerSelectionModalOpen(true)}
                className="gap-2 w-full sm:w-auto"
              >
                Create Event
              </Button>
              <Button onClick={() => fetchEvents(true)} disabled={eventsLoading} variant="outline" className="gap-2 w-full sm:w-auto">
                <RefreshCw className={`w-4 h-4 ${eventsLoading ? 'animate-spin' : ''}`} />
                {eventsLoading ? 'Loading...' : 'Refresh Events'}
              </Button>
            </div>
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {allEvents.map((event) => (
                <Card key={event._id} className="group p-6 rounded-2xl glass-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xl font-bold mb-1 line-clamp-2 group-hover:text-gradient-primary transition-all duration-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {event.title}
                      </h3>
                      <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('dashboard.admin.by', 'by')} {event.producer?.name || 'Unknown'}
                      </p>
                    </div>
                    <Badge
                      variant={event.status === 'active' ? 'default' : 'secondary'}
                      className={`${isRTL ? 'mr-2' : 'ml-2'} flex-shrink-0`}
                    >
                      {event.status}
                    </Badge>
                  </div>

                  <div className={`space-y-2 text-sm text-muted-foreground mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Users className="w-4 h-4" />
                      <span>Event ID: {event._id.slice(-8)}</span>
                    </div>
                  </div>

                  <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/event/${event._id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/edit-event/${event._id}`)}
                    >
                      Edit Event
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground">
                  There are no events on the platform yet.
                </p>
              </CardContent>
            </Card>
          )}
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

        <TabsContent value="chats" className={`space-y-4 sm:space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Connection Status and Controls */}
          <Card>
            <CardContent className="p-4">
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {isConnected ? (
                    <>
                      <Wifi className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-700">
                        {t('chat.connected', 'Connected to chat server')}
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-700">
                        {t('chat.disconnected', 'Disconnected from chat server')}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  {!isConnected && (
                    <Button
                      onClick={handleReconnect}
                      variant="outline"
                      size="sm"
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Wifi className="w-4 h-4" />
                      Connect
                    </Button>
                  )}
                  <Button
                    onClick={handleRefreshChats}
                    variant="outline"
                    size="sm"
                    className="gap-2 w-full sm:w-auto"
                    disabled={chatLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${chatLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-300px)] sm:h-[calc(100vh-350px)] max-h-[500px] sm:max-h-[700px]">
            {/* Conversations List */}
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <ChatList
                  chats={localChats}
                  selectedChatId={currentChat?._id}
                  onSelectChat={handleSelectChat}
                  loading={chatLoading}
                />
              </div>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
              {!isConnected && (
                <Card className="mb-4 flex-shrink-0">
                  <CardContent className="p-4 flex items-center gap-3">
                    <WifiOff className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-700">
                        {t('chat.limitedMode', 'Limited Mode - Real-time updates unavailable')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('chat.reconnectForRealtime', 'Reconnect for live messaging')}
                      </p>
                    </div>
                    <Button onClick={handleReconnect} size="sm" variant="outline" className="flex-shrink-0">
                      <Wifi className="w-4 h-4 mr-2" />
                      Reconnect
                    </Button>
                  </CardContent>
                </Card>
              )}
              <div className="flex-1 overflow-hidden">
                {!currentChat ? (
                  <Card className="h-full">
                    <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {t('chat.selectChat', 'Select a conversation')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('chat.selectChatDescription', 'Choose a chat from the list to view messages')}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
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
                )}
              </div>
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

      {/* Producer Selection Modal */}
      <ProducerSelectionModal
        isOpen={isProducerSelectionModalOpen}
        onClose={() => setIsProducerSelectionModalOpen(false)}
        onProducerSelect={handleProducerSelect}
      />
    </div>
  );
};

export default AdminDashboard;
