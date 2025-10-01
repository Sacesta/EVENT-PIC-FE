import React, { useState, useMemo } from 'react';
import { Search, MapPin, Tag, Calendar, Check, X, Eye, MessageCircle, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  eventName: string;
  eventDate: Date;
  services: string[];
  totalAmount: number;
  status: 'pending' | 'accepted';
  clientName: string;
  location: string;
  createdAt: Date;
}

interface OrdersSectionProps {
  orders: Order[];
  onAcceptOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
  onViewOrder: (orderId: string) => void;
  onChatWithClient: (orderId: string) => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  onAcceptOrder,
  onRejectOrder,
  onViewOrder,
  onChatWithClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'amount-asc' | 'amount-desc'>('date-desc');

  // Get unique locations and service types for filters
  const uniqueLocations = useMemo(() => {
    const locations = orders.map(order => order.location);
    return [...new Set(locations)].sort();
  }, [orders]);

  const uniqueServiceTypes = useMemo(() => {
    const services = orders.flatMap(order => order.services);
    return [...new Set(services)].sort();
  }, [orders]);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = order.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = locationFilter === 'all' || order.location === locationFilter;
      const matchesServiceType = serviceTypeFilter === 'all' || 
                                order.services.some(service => service === serviceTypeFilter);
      
      return matchesSearch && matchesLocation && matchesServiceType;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return a.eventDate.getTime() - b.eventDate.getTime();
        case 'date-desc':
          return b.eventDate.getTime() - a.eventDate.getTime();
        case 'amount-asc':
          return a.totalAmount - b.totalAmount;
        case 'amount-desc':
          return b.totalAmount - a.totalAmount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, searchTerm, locationFilter, serviceTypeFilter, sortBy]);

  const pendingOrders = filteredAndSortedOrders.filter(order => order.status === 'pending');
  const acceptedOrders = filteredAndSortedOrders.filter(order => order.status === 'accepted');

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <Card className="glass-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">{order.eventName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Client: {order.clientName}</p>
          </div>
          <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{order.eventDate.toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{order.location}</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {order.services.map((service, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {service}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="text-lg font-bold text-gradient-primary">
            ${order.totalAmount.toLocaleString()}
          </div>
          
          <div className="flex gap-2">
            {order.status === 'pending' ? (
              <>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onRejectOrder(order.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onAcceptOrder(order.id)}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewOrder(order.id)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => onChatWithClient(order.id)}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gradient-primary mb-2">
          Orders Management
        </h2>
        <p className="text-muted-foreground">
          Review and manage your service orders
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-xl glass-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <SelectValue placeholder="Location" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {uniqueLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <SelectValue placeholder="Service Type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {uniqueServiceTypes.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              {sortBy.includes('desc') ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date (Newest)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
            <SelectItem value="amount-desc">Amount (Highest)</SelectItem>
            <SelectItem value="amount-asc">Amount (Lowest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Orders ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted Orders ({acceptedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-xl">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Pending Orders</h3>
              <p className="text-muted-foreground">
                {searchTerm || locationFilter !== 'all' || serviceTypeFilter !== 'all' 
                  ? 'No orders match your current filters.' 
                  : 'All caught up! No pending orders at the moment.'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4 mt-6">
          {acceptedOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {acceptedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-xl">
              <Check className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Accepted Orders</h3>
              <p className="text-muted-foreground">
                {searchTerm || locationFilter !== 'all' || serviceTypeFilter !== 'all' 
                  ? 'No orders match your current filters.' 
                  : 'No accepted orders yet.'
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};