import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Calendar, Clock, Users, Tag, SortAsc, SortDesc, Loader2, AlertCircle, DollarSign, Star, RotateCcw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';
import { apiService, type Event } from '@/services/api';
import { useTranslation } from 'react-i18next';
import { autoTranslate } from '@/utils/autoTranslate';

// Backend response interface that matches the API exactly
interface BackendEventsResponse {
  success: boolean;
  data: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message?: string;
}

type SortOrder = 'asc' | 'desc';

// Event categories for filtering
const EVENT_CATEGORIES = [
 'birthday',
  'wedding',
  'corporate',
  'conference',
  'workshop',
  'concert',
  'festival',
  'graduation',
  'anniversary',
  'baby-shower',
  'networking',
  'charity',
  'other'
];

export default function BrowseEvents() {
  const { t, i18n } = useTranslation();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [hasAvailableTickets, setHasAvailableTickets] = useState(false);
  
  // State for API data
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationLoading, setPaginationLoading] = useState(false);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, unknown> = {
        page: currentPage,
        limit,
        // Removed status and isPublic filters to show ALL events
      };
      
      // Add filters only if they have values
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      if (featuredOnly) params.featured = true;
      if (hasAvailableTickets) params.hasAvailableTickets = true;
      
      // Removed date filter to show ALL events (past and future)
      
      console.log('🔍 Fetching events with params:', params);
      
      const response = await apiService.getAllEvents(params) as BackendEventsResponse;

      console.log('✅ Backend response:', response);
      
      if (response.success && response.data) {
        setEvents(response.data);
        if (response.pagination) {
          // Map backend pagination to our expected format
          setPagination({
            currentPage: response.pagination.currentPage,
            totalPages: response.pagination.totalPages,
            totalEvents: response.pagination.totalEvents,
            hasNextPage: response.pagination.hasNextPage,
            hasPrevPage: response.pagination.hasPrevPage
          });
        }
      } else {
        setError(response.message || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      
      // Enhanced error handling
      let errorMessage = 'Failed to load events. Please try again.';
      
      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = err.message || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Reset to page 1 when any filter changes (except page and limit)
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, minPrice, maxPrice, featuredOnly, hasAvailableTickets]);

  // Fetch events on component mount and when filters change
  useEffect(() => {
    fetchEvents();
  }, [currentPage, limit, searchQuery, categoryFilter, minPrice, maxPrice, featuredOnly, hasAvailableTickets]);

  // Sort events client-side (since backend doesn't support all sort options)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
  }, [events, sortOrder]);

  const handleJoinEvent = (eventId: string) => {
    // Handle event joining logic here
    console.log('Joining event:', eventId);
    // You can navigate to event details page or open a modal
  };

  // Enhanced page change handler with loading state
  const handlePageChange = useCallback(async (page: number) => {
    if (page >= 1 && page <= pagination.totalPages && page !== currentPage) {
      setPaginationLoading(true);
      setCurrentPage(page);
      
      // Add a small delay to show loading state
      setTimeout(() => {
        setPaginationLoading(false);
      }, 300);
    }
  }, [currentPage, pagination.totalPages]);

  const handleLimitChange = useCallback((newLimit: string) => {
    setLimit(parseInt(newLimit));
    setCurrentPage(1); // Reset to first page when changing limit
    setPaginationLoading(true);
    setTimeout(() => setPaginationLoading(false), 300);
  }, []);

  const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    const availableTickets = event.ticketInfo?.availableTickets || 0;
    const soldTickets = event.ticketInfo?.soldTickets || 0;
    const minPrice = event.ticketInfo?.priceRange?.min || 0;
    const maxPrice = event.ticketInfo?.priceRange?.max || 0;
    const hasAvailableTickets = availableTickets > soldTickets;
    
    // Format date and time
    const eventDate = parseISO(event.startDate);
    const eventEndDate = event.endDate ? parseISO(event.endDate) : null;
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/20">
        <CardContent className="p-5">
          <div className="flex gap-4">
            {event.image && (
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={event.image} 
                  alt={autoTranslate(event.name, i18n.language)} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold group-hover:text-primary transition-all duration-300 text-foreground truncate">
                    {autoTranslate(event.name, i18n.language)}
                  </h3>
                  {event.featured && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1 ml-2">
                  <Badge variant="secondary" className="text-xs">
                    {autoTranslate(event.category, i18n.language)}
                  </Badge>
                  {event.tags && event.tags.slice(0, 1).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {autoTranslate(tag, i18n.language)}
                    </Badge>
                  ))}
                  {event.tags && event.tags.length > 1 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.tags.length - 1}
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {autoTranslate(event.description || t('events.noDescription', 'No description available'), i18n.language)}
              </p>
              
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>
                    {format(eventDate, 'PPP')}
                    {eventEndDate && format(eventDate, 'yyyy-MM-dd') !== format(eventEndDate, 'yyyy-MM-dd') && 
                      ` - ${format(eventEndDate, 'PPP')}`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{autoTranslate(event.location?.address || event.location?.city || t('events.locationTBD', 'Location TBD'), i18n.language)}</span>
                </div>
                {event.ticketInfo && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{availableTickets - soldTickets} {t('events.ticketsAvailable', 'tickets available')}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">{t('events.by', 'by')} </span>
                  <span className="font-medium">
                    {autoTranslate(event.producerId?.name || event.producerId?.companyName || t('events.eventOrganizer', 'Event Organizer'), i18n.language)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {event.ticketInfo && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {minPrice === 0 ? t('events.free', 'Free') : 
                         minPrice === maxPrice ? `${minPrice}` : 
                         `${minPrice}-${maxPrice}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {availableTickets - soldTickets} {t('events.left', 'left')}
                      </div>
                    </div>
                  )}
                  <Button 
                    size="sm"
                    disabled={!hasAvailableTickets}
                    onClick={() => handleJoinEvent(event._id)}
                    className="ml-2"
                  >
                    {hasAvailableTickets ? t('events.viewEvent', 'View Event') : t('events.soldOut', 'Sold Out')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState: React.FC = () => (
    <div className="text-center py-12">
      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <p className="text-lg text-muted-foreground">{t('events.noEventsFound', 'No events found matching your criteria')}</p>
      <p className="text-sm text-muted-foreground mt-2">{t('events.tryAdjusting', 'Try adjusting your search or filters')}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="rounded-2xl p-8 glass-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('events.browseEvents', 'Browse Events')}</h1>
            <p className="text-muted-foreground">{t('events.discoverEvents', 'Discover and join exciting events happening around you')}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            {t('dashboard.sortByDate', 'Sort by Date')}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('events.searchPlaceholder', 'Search events, organizers, locations...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('events.allCategories', 'All Categories')}</SelectItem>
              {EVENT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {autoTranslate(category, i18n.language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('events.minPrice', 'Min Price')}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              type="number"
              min="0"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              placeholder={t('events.maxPrice', 'Max Price')}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              type="number"
              min="0"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="rounded"
              />
              {t('events.featuredOnly', 'Featured Only')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hasAvailableTickets}
                onChange={(e) => setHasAvailableTickets(e.target.checked)}
                className="rounded"
              />
              {t('events.availableTickets', 'Available Tickets')}
            </label>
          </div>

          {/* Enhanced Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{t('dashboard.show', 'Show')}:</span>
            <Select value={limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{t('dashboard.perPage', 'per page')}</span>
          </div>

          {/* Quick Reset Filters Button */}
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setMinPrice('');
                setMaxPrice('');
                setFeaturedOnly(false);
                setHasAvailableTickets(false);
                setCurrentPage(1);
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t('events.reset', 'Reset')}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading || paginationLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              {loading ? t('events.loadingEvents', 'Loading events...') : t('events.changingPage', 'Changing page...')}
            </span>
          </div>
        ) : (
          <>
            {/* Events List */}
            {sortedEvents.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="space-y-4">
                  {sortedEvents.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>

                {/* Simple Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {t('dashboard.showing', 'Showing')} {((currentPage - 1) * limit) + 1} {t('dashboard.to', 'to')} {Math.min(currentPage * limit, pagination.totalEvents)} {t('dashboard.of', 'of')} {pagination.totalEvents} {t('dashboard.events', 'events')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="text-muted-foreground"
                      >
                        {t('common.back', 'Previous')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                      >
                        {t('common.next', 'Next')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
