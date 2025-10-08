import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, DollarSign, Star, Users, Package, BarChart3, MapPin, Clock, Eye, Check, X, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiService, { type Service, type Event } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import ServiceManagement from '@/components/services/ServiceManagement';
import PackageManagement from '@/components/services/PackageManagement';
import { autoTranslate } from '@/utils/autoTranslate';

const EVENT_TYPES = [
  'birthday',
  'wedding',
  'corporate',
  'conference',
  'workshop',
  'concert',
  'festival',
  'graduation',
  'anniversary',
  'babyShower',
  'networking',
  'charity',
  'other'
];


interface Order {
  _id: string;
  eventName: string;
  serviceName: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
}

interface DashboardStats {
  totalServices?: number;
  activeServices?: number;
  totalOrders?: number;
  pendingOrders?: number;
  completedOrders?: number;
  totalRevenue?: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export default function SupplierDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  
  // Events filtering and pagination state
  const [eventFilters, setEventFilters] = useState({
    search: '',
    category: '',
    city: '',
    status: '', // Event status
    page: 1,
    limit: 10
  });
  const [eventsPagination, setEventsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch events when Events tab is active
  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    }
  }, [activeTab, eventFilters]);

  const fetchEvents = async () => {
    if (!user?._id) {
      console.error('User ID not available');
      return;
    }

    setIsEventsLoading(true);
    try {
      // Prepare filters - only include non-empty values and exclude "all" values
      const filters: any = {
        page: eventFilters.page,
        limit: eventFilters.limit,
        sortBy: 'startDate' // Default sort by start date
      };

      // Only add filters if they have actual values (not empty or "all")
      if (eventFilters.search && eventFilters.search.trim() !== '') {
        filters.search = eventFilters.search.trim();
      }
      
      if (eventFilters.category && eventFilters.category !== '' && eventFilters.category !== 'all') {
        filters.category = eventFilters.category;
      }
      
      if (eventFilters.city && eventFilters.city.trim() !== '') {
        filters.city = eventFilters.city.trim();
      }
      
      // Event status filter
      if (eventFilters.status && eventFilters.status !== '' && eventFilters.status !== 'all') {
        filters.status = eventFilters.status;
      }

      console.log('🔍 Frontend - Sending filters to API:', {
        userId: user._id,
        filters,
        originalEventFilters: eventFilters
      });

      // Use the updated getEventsForSupplier method with user ID
      const response = await apiService.getEventsForSupplier(user._id, filters);

      console.log('🔍 Events API Response:', response);

      if (response.success && response.data) {
        // Ensure response.data is an array of events
        const eventsArray = Array.isArray(response.data) ? response.data : [];
        setEvents(eventsArray as Event[]);
        
        console.log('🔍 Events loaded:', eventsArray.length, 'events');
        
        // Handle pagination with proper type checking
        if (response.pagination) {
          const pagination = response.pagination as any;
          setEventsPagination({
            currentPage: pagination.currentPage || pagination.page || 1,
            totalPages: pagination.totalPages || pagination.pages || 1,
            totalEvents: pagination.totalEvents || pagination.total || 0,
            hasNextPage: pagination.hasNextPage || pagination.hasMore || false,
            hasPrevPage: pagination.hasPrevPage || (pagination.page ? pagination.page > 1 : false)
          });
        }
      } else {
        console.warn('🔍 API Response not successful or no data:', response);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events for supplier:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('events.fetchError', 'Failed to load events. Please try again.'),
        variant: "destructive"
      });
      setEvents([]); // Clear events on error
    } finally {
      setIsEventsLoading(false);
    }
  };

  const handleEventFilterChange = (key: string, value: string) => {
    setEventFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleEventPageChange = (page: number) => {
    setEventFilters(prev => ({
      ...prev,
      page
    }));
  };

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">{t('events.draft', 'Draft')}</Badge>;
      case 'approved': return <Badge variant="default" className="bg-green-100 text-green-800">{t('events.approved', 'Approved')}</Badge>;
      case 'rejected': return <Badge variant="destructive">{t('events.rejected', 'Rejected')}</Badge>;
      case 'completed': return <Badge variant="outline">{t('events.completed', 'Completed')}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch current user's services and orders
      const [servicesData, ordersData, statsData] = await Promise.all([
        apiService.getMyServices(),
        apiService.getOrders(),
        apiService.getMyOrderStats()
      ]);

      console.log('🔍 Dashboard - Services data:', servicesData);
      console.log('🔍 Dashboard - Orders data:', ordersData);
      console.log('🔍 Dashboard - Stats data:', statsData);

      // Extract data from responses with proper typing
      const servicesArray = Array.isArray(servicesData.data) 
        ? servicesData.data 
        : (servicesData.data as { services: Service[] })?.services || [];
      const ordersArray = Array.isArray(ordersData.data) 
        ? ordersData.data 
        : (ordersData.data as { orders: Order[] })?.orders || [];
      const statsObj = (statsData as ApiResponse<DashboardStats>).data || {};

      setServices(servicesArray);
      setOrders(ordersArray);
      setStats({
        totalServices: statsObj.totalServices || servicesArray.length,
        activeServices: statsObj.activeServices || servicesArray.filter((s: Service) => s.available).length,
        totalOrders: statsObj.totalOrders || ordersArray.length,
        pendingOrders: statsObj.pendingOrders || ordersArray.filter((o: Order) => o.status === 'pending').length,
        completedOrders: statsObj.completedOrders || ordersArray.filter((o: Order) => o.status === 'completed').length,
        totalRevenue: statsObj.totalRevenue || ordersArray.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('dashboard.fetchError', 'Failed to load dashboard data. Please try again.'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManagePackages = (service: Service) => {
    setSelectedService(service);
    setIsPackageModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // State for loading buttons
  const [loadingButtons, setLoadingButtons] = useState<Record<string, boolean>>({});

  // Helper function to find supplier info for current user
  const findSupplierInfo = (event: Event) => {
    if (!user?._id || !event.suppliers) return null;
    
    return event.suppliers.find(supplier => {
      const supplierId = typeof supplier.supplierId === 'object' 
        ? supplier.supplierId._id 
        : supplier.supplierId;
      return supplierId === user._id;
    });
  };

  // Handlers for approve and reject buttons
  const handleApproveEvent = async (eventId: string) => {
    if (!user?._id) {
      toast({
        title: t('common.error', 'Error'),
        description: t('events.userNotFound', 'User not found. Please log in again.'),
        variant: "destructive"
      });
      return;
    }

    setLoadingButtons(prev => ({ ...prev, [`approve-${eventId}`]: true }));

    // Find the event and supplier info
    const event = events.find(e => e._id === eventId);
    if (!event) {
      toast({
        title: t('common.error', 'Error'),
        description: t('events.eventNotFound', 'Event not found.'),
        variant: "destructive"
      });
      setLoadingButtons(prev => ({ ...prev, [`approve-${eventId}`]: false }));
      return;
    }

    const supplierInfo = findSupplierInfo(event);
    if (!supplierInfo) {
      toast({
        title: t('common.error', 'Error'),
        description: t('events.supplierNotFound', 'Supplier information not found for this event.'),
        variant: "destructive"
      });
      setLoadingButtons(prev => ({ ...prev, [`approve-${eventId}`]: false }));
      return;
    }

    const supplierId = typeof supplierInfo.supplierId === 'object' 
      ? supplierInfo.supplierId._id 
      : supplierInfo.supplierId;

    try {
      const response = await apiService.updateSupplierEventStatus(
        eventId, 
        supplierId, 
        supplierInfo.serviceId, 
        'approved'
      );

      console.log('Approve event response:', response);
      
      if (response.success) {
        toast({
          title: t('common.success', 'Success'),
          description: t('events.approveSuccess', 'Event approved successfully!'),
        });
        
        // Refresh events list
        fetchEvents();
      } else {
        throw new Error(response.message || 'Failed to approve event');
      }
    } catch (error) {
      console.error('Error approving event:', error);
      let errorMessage = t('events.approveError', 'Failed to approve event. Please try again.');
      
      try {
        const errorData = JSON.parse((error as Error).message);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Use default error message
      }
      
      toast({
        title: t('common.error', 'Error'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`approve-${eventId}`]: false }));
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    if (!user?._id) {
      toast({
        title: t('common.error', 'Error'),
        description: t('events.userNotFound', 'User not found. Please log in again.'),
        variant: "destructive"
      });
      return;
    }

    setLoadingButtons(prev => ({ ...prev, [`reject-${eventId}`]: true }));

    // Find the event and supplier info
    const event = events.find(e => e._id === eventId);
    if (!event) {
      toast({
        title: t('common.error', 'Error'),
        description: t('events.eventNotFound', 'Event not found.'),
        variant: "destructive"
      });
      setLoadingButtons(prev => ({ ...prev, [`reject-${eventId}`]: false }));
      return;
    }

    const supplierInfo = findSupplierInfo(event);
    if (!supplierInfo) {
      toast({
        title: t('common.error', 'Error'),
        description: t('events.supplierNotFound', 'Supplier information not found for this event.'),
        variant: "destructive"
      });
      setLoadingButtons(prev => ({ ...prev, [`reject-${eventId}`]: false }));
      return;
    }

    const supplierId = typeof supplierInfo.supplierId === 'object' 
      ? supplierInfo.supplierId._id 
      : supplierInfo.supplierId;

    try {
      const response = await apiService.updateSupplierEventStatus(
        eventId, 
        supplierId, 
        supplierInfo.serviceId, 
        'rejected'
      );
      
      if (response.success) {
        toast({
          title: t('common.success', 'Success'),
          description: t('events.rejectSuccess', 'Event rejected successfully!'),
        });
        
        // Refresh events list
        fetchEvents();
      } else {
        throw new Error(response.message || 'Failed to reject event');
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
      let errorMessage = t('events.rejectError', 'Failed to reject event. Please try again.');
      
      try {
        const errorData = JSON.parse((error as Error).message);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Use default error message
      }
      
      toast({
        title: t('common.error', 'Error'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`reject-${eventId}`]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
          {t('dashboard.supplier.title', 'Supplier Dashboard')}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.supplier.subtitle', 'Manage your services and track orders')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('dashboard.overview', 'Overview')}
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('dashboard.services', 'Services')}
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('dashboard.orders', 'Orders')}
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('dashboard.events', 'Events')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.totalServices', 'Total Services')}
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalServices}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeServices} {t('dashboard.active', 'active')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.totalOrders', 'Total Orders')}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.allTime', 'All time')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.pendingOrders', 'Pending Orders')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.awaitingConfirmation', 'Awaiting confirmation')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.totalRevenue', 'Total Revenue')}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.allTime', 'All time')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('dashboard.recentOrders', 'Recent Orders')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{order.eventName}</h4>
                        <p className="text-sm text-muted-foreground">{order.serviceName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          {autoTranslate(order.status, i18n.language)}
                        </Badge>
                        <p className="text-sm font-medium mt-1">${order.totalAmount}</p>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      {t('dashboard.noOrders', 'No orders yet')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t('dashboard.activeServices', 'Active Services')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.filter(service => service.available).slice(0, 5).map((service) => (
                    <div key={service._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{autoTranslate(service.title, i18n.language)}</h4>
                        <p className="text-sm text-muted-foreground">{t(`categories.${service.category}`, service.category)}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{t(`categories.${service.category}`, service.category)}</Badge>
                        <p className="text-sm font-medium mt-1">
                          {service.price.currency} {service.price.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                  {services.filter(service => service.available).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      {t('dashboard.noServices', 'No active services')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          {/* <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions', 'Quick Actions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setActiveTab('services')}
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  {t('dashboard.manageServices', 'Manage Services')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {t('dashboard.viewAllOrders', 'View All Orders')}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {t('dashboard.manageReviews', 'Manage Reviews')}
                </Button>
              </div>
            </CardContent>
          </Card> */}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <ServiceManagement onDataUpdated={fetchDashboardData} />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.allOrders', 'All Orders')}</CardTitle>
              <CardDescription>
                {t('dashboard.ordersDescription', 'View and manage all your service orders')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{order.eventName}</h4>
                      <p className="text-sm text-muted-foreground">{order.serviceName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {autoTranslate(order.status, i18n.language)}
                      </Badge>
                      <p className="text-sm font-medium mt-1">${order.totalAmount}</p>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t('dashboard.noOrders', 'No orders yet')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('dashboard.noOrdersDescription', 'Orders will appear here when clients book your services')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('events.allEvents', 'All Events')}
              </CardTitle>
              <CardDescription>
                {t('events.browseAllEvents', 'Browse all events on the platform')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder={t('events.searchEvents', 'Search events...')}
                    value={eventFilters.search}
                    onChange={(e) => handleEventFilterChange('search', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={eventFilters.category || "all"}
                    onValueChange={(value) => handleEventFilterChange('category', value === "all" ? "" : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('events.filterByCategory', 'Filter by category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('events.allCategories', 'All Categories')}</SelectItem>
                      {EVENT_TYPES.map((eventType) => (
                        <SelectItem key={eventType} value={eventType}>
                          {t(`createEvent.eventTypes.${eventType}`, eventType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={eventFilters.status || "all"}
                    onValueChange={(value) => handleEventFilterChange('status', value === "all" ? "" : value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder={t('events.filterByStatus', 'Filter by status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('events.allStatuses', 'All Statuses')}</SelectItem>
                      <SelectItem value="draft">{t('events.draft', 'Draft')}</SelectItem>
                      <SelectItem value="approved">{t('events.approved', 'Approved')}</SelectItem>
                      <SelectItem value="rejected">{t('events.rejected', 'Rejected')}</SelectItem>
                      <SelectItem value="completed">{t('events.completed', 'Completed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Events Table */}
              {isEventsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">{t('events.eventName', 'Event Name')}</TableHead>
                        <TableHead>{t('events.category', 'Category')}</TableHead>
                        <TableHead>{t('events.date', 'Date')}</TableHead>
                        <TableHead>{t('events.location', 'Location')}</TableHead>
                        <TableHead>{t('events.status', 'Status')}</TableHead>
                        <TableHead>{t('events.tickets', 'Tickets')}</TableHead>
                        <TableHead className="text-right">{t('events.actions', 'Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event._id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold text-gray-900">{event.name}</div>
                              {event.description && (
                                <div className="text-sm text-gray-600 line-clamp-1 mt-1">
                                  {event.description}
                                </div>
                              )}
                              {event.producerId && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {t('events.eventsByProducer', 'by {{producer}}', { 
                                    producer: typeof event.producerId === 'object' ? event.producerId.name : 'Producer' 
                                  })}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant="secondary" className="w-fit">
                                {autoTranslate(event.category, i18n.language)}
                              </Badge>
                              {event.featured && (
                                <Badge variant="default" className="bg-yellow-100 text-yellow-800 w-fit">
                                  {t('events.featured', 'Featured')}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {new Date(event.startDate).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {event.location?.city || 'Location TBD'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getEventStatusBadge(event.status)}
                          </TableCell>
                          <TableCell>
                            {event.ticketInfo ? (
                              <div className="text-sm">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-gray-500" />
                                  <span>
                                    {event.ticketInfo.availableTickets - (event.ticketInfo.soldTickets || 0)} / {event.ticketInfo.availableTickets}
                                  </span>
                                </div>
                                {event.ticketInfo.priceRange && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    ${event.ticketInfo.priceRange.min} - ${event.ticketInfo.priceRange.max}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {event.status === 'draft' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-500"
                                    onClick={() => handleApproveEvent(event._id)}
                                    disabled={loadingButtons[`approve-${event._id}`] || loadingButtons[`reject-${event._id}`]}
                                  >
                                    {loadingButtons[`approve-${event._id}`] ? (
                                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                                    ) : (
                                    <Check className="h-3 w-3" />
                                    )}
                                    {t('events.approve', 'Approve')}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-500"
                                    onClick={() => handleRejectEvent(event._id)}
                                    disabled={loadingButtons[`approve-${event._id}`] || loadingButtons[`reject-${event._id}`]}
                                  >
                                    {loadingButtons[`reject-${event._id}`] ? (
                                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                    ) : (
                                      <X className="h-3 w-3" />
                                    )}
                                    {t('events.reject', 'Reject')}
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-500"
                                onClick={() => navigate("/event-chat/select")}
                              >
                                <MessageCircle className="h-3 w-3" />
                                {t('events.chat', 'Chat')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('events.noEvents', 'No events found')}
                  </h3>
                  <p className="text-gray-600">
                    {t('events.noEventsDescription', 'No events match your current filters. Try adjusting your search criteria.')}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {eventsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    {t('dashboard.showing', 'Showing')} {((eventsPagination.currentPage - 1) * eventFilters.limit) + 1} {t('dashboard.to', 'to')} {Math.min(eventsPagination.currentPage * eventFilters.limit, eventsPagination.totalEvents)} {t('dashboard.of', 'of')} {eventsPagination.totalEvents} {t('dashboard.events', 'events')}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEventPageChange(eventsPagination.currentPage - 1)}
                      disabled={!eventsPagination.hasPrevPage}
                    >
                      {t('common.back', 'Previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEventPageChange(eventsPagination.currentPage + 1)}
                      disabled={!eventsPagination.hasNextPage}
                    >
                      {t('common.next', 'Next')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Package Management Modal */}
      <PackageManagement
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        service={selectedService}
        onPackagesUpdated={fetchDashboardData}
      />
    </div>
  );
}
