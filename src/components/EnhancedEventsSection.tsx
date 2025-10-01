import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Tag, 
  SortAsc, 
  SortDesc, 
  Calendar, 
  Clock, 
  Pencil, 
  User, 
  Trash2, 
  MessageCircle, 
  Ticket,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { type EnhancedEvent } from '@/services/api';

interface EnhancedEventsSectionProps {
  events: EnhancedEvent[];
  onEditEvent: (eventId: string) => void;
  onViewEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onManageAttendees?: (eventId: string) => void;
  onChatEvent?: (eventId: string) => void;
  onManageTickets?: (eventId: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
}

type SortOrder = 'asc' | 'desc';

export const EnhancedEventsSection: React.FC<EnhancedEventsSectionProps> = ({
  events,
  onEditEvent,
  onViewEvent,
  onDeleteEvent,
  onManageAttendees,
  onChatEvent,
  onManageTickets,
  pagination,
  onPageChange
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Get current date for filtering
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Split events into upcoming and past
  const { upcomingEvents, pastEvents } = useMemo(() => {
    return events.reduce((acc, event) => {
      const eventDate = new Date(event.startDate);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate >= currentDate) {
        acc.upcomingEvents.push(event);
      } else {
        acc.pastEvents.push(event);
      }
      return acc;
    }, { upcomingEvents: [] as EnhancedEvent[], pastEvents: [] as EnhancedEvent[] });
  }, [events, currentDate]);

  // Get unique categories and statuses for filters
  const uniqueCategories = useMemo(() => {
    const categories = events.map(event => event.category).filter(Boolean);
    return Array.from(new Set(categories)).sort();
  }, [events]);

  const uniqueStatuses = useMemo(() => {
    const statuses = events.map(event => event.status).filter(Boolean);
    return Array.from(new Set(statuses)).sort();
  }, [events]);

  // Filter and sort events
  const filterAndSortEvents = (eventsList: EnhancedEvent[]) => {
    return eventsList
      .filter(event => {
        // Search filter
        const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (event.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            `${event.location.address}, ${event.location.city}`.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
        
        // Category filter
        const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
        
        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      });
  };

  const filteredUpcomingEvents = filterAndSortEvents(upcomingEvents);
  const filteredPastEvents = filterAndSortEvents(pastEvents);

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: Pencil, color: 'text-gray-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      completed: { variant: 'outline' as const, icon: CheckCircle, color: 'text-blue-600' },
      cancelled: { variant: 'secondary' as const, icon: Pause, color: 'text-gray-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Enhanced Event Card component
  const EnhancedEventCard: React.FC<{ event: EnhancedEvent }> = ({ event }) => {
    const eventDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    return (
      <Card 
        className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/20 cursor-pointer"
        onClick={() => navigate(`/event/${event._id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="group-hover:text-primary transition-all duration-300 text-lg">
                {event.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={event.status} />
                {event.category && (
                  <Badge variant="outline" className="text-xs">
                    {event.category}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {event.statusIndicators.daysUntilEvent > 0 
                  ? `${event.statusIndicators.daysUntilEvent} days to go`
                  : event.statusIndicators.daysUntilEvent === 0 
                    ? 'Today'
                    : 'Past event'
                }
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Event Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{format(eventDate, 'PPP')} - {format(endDate, 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{event.location.address}, {event.location.city}</span>
            </div>
          </div>

          {/* Supplier Statistics */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">{event.supplierStats.totalSuppliers}</div>
              <div className="text-xs text-muted-foreground">Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{event.supplierStats.approvedServices}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Budget Utilization</span>
              <span className="text-sm text-muted-foreground">
                {event.financialSummary.budgetUtilization.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(event.financialSummary.budgetUtilization, 100)} 
              className="h-2"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Estimated: ${event.financialSummary.estimatedCost.toLocaleString()}</span>
              {event.budget?.total && (
                <span>Budget: ${event.budget.total.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1" 
              onClick={(e) => {
                e.stopPropagation();
                onEditEvent(event._id);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-10 h-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onChatEvent?.(event._id);
              }}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-10 h-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteEvent?.(event._id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center py-12">
      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <div className="rounded-2xl p-8 glass-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">My Events</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2"
        >
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          Sort by Date
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {uniqueStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <SelectValue placeholder="Category" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming Events ({filteredUpcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Past Events ({filteredPastEvents.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {filteredUpcomingEvents.length === 0 ? (
            <EmptyState message="No upcoming events found" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUpcomingEvents.map((event) => (
                <EnhancedEventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {filteredPastEvents.length === 0 ? (
            <EmptyState message="No past events found" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPastEvents.map((event) => (
                <EnhancedEventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalEvents)} of {pagination.totalEvents} events
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
