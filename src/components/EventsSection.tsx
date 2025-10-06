import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Tag, SortAsc, SortDesc, Calendar, Clock, Pencil, User, Trash2, MessageCircle, Ticket, CheckCircle, XCircle, AlertCircle, Pause, DollarSign, Users as UsersIcon, Lock, Gift, Link2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { type EnhancedEvent, type SupplierStats, type FinancialSummary, type StatusIndicators } from '@/services/api';
import { autoTranslate } from '@/utils/autoTranslate';

interface Event {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  startDate: string | Date;
  endDate?: string | Date;
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  } | string; // Support both new and old format
  category?: string;
  status?: string;
  ticketInfo?: {
    availableTickets: number;
    soldTickets: number;
    priceRange?: {
      min: number;
      max: number;
    };
  };
  requiredServices?: string[];
  suppliers?: Array<{
    supplierId: string;
    serviceId: string;
    status: string;
  }>;
  // Enhanced event properties (optional for backward compatibility)
  supplierStats?: SupplierStats;
  financialSummary?: FinancialSummary;
  statusIndicators?: StatusIndicators;
  budget?: {
    total: number;
    allocated?: Record<string, number>;
    spent?: number;
  };
  // Legacy fields for backward compatibility
  date?: Date;
  time?: string;
  tickets?: {
    type: string;
    price: number;
    quantity: number;
  }[];
  services?: string[];
}

interface EventsSectionProps {
  events: Event[];
  onEditEvent: (eventId: string) => void;
  onViewEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onManageAttendees?: (eventId: string) => void;
  onChatEvent?: (eventId: string) => void;
  onManageTickets?: (eventId: string) => void;
}

type SortOrder = 'asc' | 'desc';

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  onEditEvent,
  onViewEvent,
  onDeleteEvent,
  onManageAttendees,
  onChatEvent,
  onManageTickets
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  // Get current date for filtering
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Split events into upcoming and past
  const { upcomingEvents, pastEvents } = useMemo(() => {
    return events.reduce((acc, event) => {
      // Use startDate if available, otherwise fall back to date
      const eventDate = new Date(event.startDate || event.date || new Date());
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate >= currentDate) {
        acc.upcomingEvents.push(event);
      } else {
        acc.pastEvents.push(event);
      }
      return acc;
    }, { upcomingEvents: [] as Event[], pastEvents: [] as Event[] });
  }, [events, currentDate]);

  // Get unique locations and event types for filters
  const uniqueLocations = useMemo(() => {
    const locations = events.map(event => {
      if (typeof event.location === 'string') {
        return event.location;
      }
      return `${event.location.address}, ${event.location.city}`;
    });
    return Array.from(new Set(locations)).sort();
  }, [events]);

  const uniqueEventTypes = useMemo(() => {
    // Extract event types from requiredServices or legacy services
    const types = events.flatMap(event => 
      event.requiredServices || (event as any).services || []
    );
    return Array.from(new Set(types)).sort();
  }, [events]);

  // Filter and sort events
  const filterAndSortEvents = (eventsList: Event[]) => {
    return eventsList
      .filter(event => {
        // Get location string for filtering
        const locationString = typeof event.location === 'string' 
          ? event.location 
          : `${event.location.address}, ${event.location.city}`;
        
        // Get services array for filtering
        const services = event.requiredServices || (event as any).services || [];
        
        // Search filter
        const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            locationString.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Location filter
        const matchesLocation = locationFilter === 'all' || locationString === locationFilter;
        
        // Event type filter
        const matchesEventType = eventTypeFilter === 'all' || services.includes(eventTypeFilter);
        
        return matchesSearch && matchesLocation && matchesEventType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.startDate || (a as any).date || new Date());
        const dateB = new Date(b.startDate || (b as any).date || new Date());
        return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      });
  };

  const filteredUpcomingEvents = filterAndSortEvents(upcomingEvents);
  const filteredPastEvents = filterAndSortEvents(pastEvents);

  const handleCopyLink = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const eventUrl = `${window.location.origin}/event/${eventId}`;
    navigator.clipboard.writeText(eventUrl).then(() => {
      setCopiedEventId(eventId);
      toast({
        title: "Link Copied!",
        description: "Event link has been copied to clipboard",
      });
      setTimeout(() => setCopiedEventId(null), 2000);
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive"
      });
    });
  };

  const EventCard: React.FC<{ event: Event; isPastEvent?: boolean }> = ({ event, isPastEvent = false }) => {
    // Get event ID (support both _id and id)
    const eventId = event._id || event.id;
    
    // Get services array
    const services = event.requiredServices || (event as any).services || [];
    
    // Get location string
    const locationString = typeof event.location === 'string' 
      ? event.location 
      : `${event.location.address}, ${event.location.city}`;
    
    // Get event date and time
    const eventDate = new Date(event.startDate || (event as any).date || new Date());
    const timeString = (event as any).time || format(eventDate, 'HH:mm');
    
    // Determine event type badges
    const isPrivate = !(event as any).isPublic;
    const isFreeEvent = (event.ticketInfo?.isFree === true) || 
                       (event.ticketInfo?.priceRange?.min === 0) ||
                       (!event.ticketInfo?.priceRange?.min && !((event as any).tickets?.some((t: any) => t.price > 0)));
    const isPaidEvent = !isFreeEvent;
    const isCopied = copiedEventId === eventId;
    
    return (
      <Card 
        className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/20 cursor-pointer"
        onClick={() => navigate(`/event/${eventId}`)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold group-hover:text-primary transition-all duration-300 text-foreground mb-2">
                {event.name}
              </h3>
              {/* Event Type Badges */}
              <div className="flex flex-wrap gap-1 mb-2">
                {isPrivate && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-300">
                    <Lock className="w-3 h-3" />
                    Private
                  </Badge>
                )}
                {isFreeEvent ? (
                  <Badge variant="outline" className="text-xs flex items-center gap-1 bg-green-50 text-green-700 border-green-300">
                    <Gift className="w-3 h-3" />
                    Free Event
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-300">
                    <DollarSign className="w-3 h-3" />
                    Paid Event
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 ml-2">
              {services.slice(0, 2).map((service) => (
                <Badge key={service} variant="secondary" className="text-xs">
                  {autoTranslate(service, i18n.language)}
                </Badge>
              ))}
              {services.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{services.length - 2}
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {event.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{format(eventDate, 'PPP')} - {timeString}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{locationString}</span>
            </div>
            {event.status && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                  {autoTranslate(event.status, i18n.language)}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {!isPastEvent && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-10 h-10 p-0" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditEvent(eventId);
                }}
                title="Edit Event"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-10 h-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onChatEvent?.(eventId);
              }}
              title="Chat"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button 
              variant={isCopied ? "default" : "outline"}
              size="sm" 
              className="w-10 h-10 p-0"
              onClick={(e) => handleCopyLink(eventId, e)}
              title="Copy Event Link"
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-10 h-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteEvent?.(eventId);
              }}
              title="Delete Event"
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
        <h2 className="text-2xl font-bold text-foreground">{t('events.myEvents')}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2"
        >
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          {t('dashboard.sortByDate')}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('events.searchEvents')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <SelectValue placeholder={t('events.location')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('events.allLocations')}</SelectItem>
            {uniqueLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <SelectValue placeholder={t('createEvent.step2.eventType')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('events.allCategories')}</SelectItem>
            {uniqueEventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {autoTranslate(type, i18n.language)}
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
            {t('dashboard.upcomingEvents')} ({filteredUpcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('dashboard.pastEvents')} ({filteredPastEvents.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {filteredUpcomingEvents.length === 0 ? (
            <EmptyState message={t('dashboard.noUpcomingEvents')} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredUpcomingEvents.map((event) => (
                <EventCard key={event._id || event.id} event={event} isPastEvent={false} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {filteredPastEvents.length === 0 ? (
            <EmptyState message={t('dashboard.noPastEvents')} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPastEvents.map((event) => (
                <EventCard key={event._id || event.id} event={event} isPastEvent={true} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};