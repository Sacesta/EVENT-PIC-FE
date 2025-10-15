import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarPlus, BarChart3, Calendar, Clock, Users, MessagesSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CreateEventButton } from '@/components/CreateEventButton';
import { EditEventModal } from '@/components/EditEventModal';
import { EventsSection } from '@/components/EventsSection';
import { ManageTicketModal } from '@/components/ManageTicketModal';
import { apiService, type EnhancedEvent, type MyEventsResponse, type OverallStats } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';

const ProducerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Get user name from auth context
  const userName = user?.name || "Producer";
  
  // Get random greeting
  const greetings = t('dashboard.producer.greetings', { returnObjects: true }) as string[];
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  // Parse the greeting to replace the placeholder
  const displayGreeting = randomGreeting.replace('{{name}}', userName);
  
  // State management
  const [editingEvent, setEditingEvent] = useState<EnhancedEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedEventForTickets, setSelectedEventForTickets] = useState<EnhancedEvent | null>(null);
  const [events, setEvents] = useState<EnhancedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch producer events on component mount and when page changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response: MyEventsResponse = await apiService.getMyEvents({ 
          limit: 10,
          page: pagination.currentPage,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });

       
        
        if (response.success && response.data) {
          setEvents(response.data);
          setPagination(response.pagination);
          setOverallStats(response.overallStats);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [pagination.currentPage]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditEvent = (eventId: string) => {
    const event = events.find(e => e._id === eventId);
    if (event) {
      setEditingEvent(event);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEvent = async (updatedEvent: Record<string, unknown>) => {
    try {
      // The EditEventModal already handles the update and refetch
      // We just need to refresh the events list to show the updated data
      const response: MyEventsResponse = await apiService.getMyEvents({ 
        limit: 10,
        page: pagination.currentPage,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (response.success && response.data) {
        setEvents(response.data);
        setPagination(response.pagination);
        setOverallStats(response.overallStats);
      }
      
      console.log('Event list refreshed successfully');
    } catch (error) {
      console.error('Error refreshing events:', error);
      setError('Failed to refresh events. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm(t('dashboard.producer.deleteConfirm'))) {
      try {
        await apiService.deleteEvent(eventId);
        
        // Refresh events list using the new API
        const response: MyEventsResponse = await apiService.getMyEvents({ 
          limit: 10,
          page: pagination.currentPage,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        
        if (response.success && response.data) {
          setEvents(response.data);
          setPagination(response.pagination);
          setOverallStats(response.overallStats);
        }
        
        console.log('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('Failed to delete event. Please try again.');
      }
    }
  };

  const handleChatEvent = (eventId: string) => {
    navigate("/event-chat/select");
  };

  const handleManageTickets = (eventId: string) => {
    const event = events.find(e => e._id === eventId);
    if (event) {
      setSelectedEventForTickets(event);
      setIsTicketModalOpen(true);
    }
  };

  const handleSaveTickets = (eventId: string, tickets: Record<string, unknown>[]) => {
    setEvents(prev => prev.map(e => 
      e._id === eventId ? { ...e, tickets } : e
    ));
    console.log('Saving tickets for event:', eventId, tickets);
  };

  const handleChatClick = () => {
    navigate('/event-chat/select');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-primary">
            {displayGreeting}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('dashboard.producer.subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <CreateEventButton eventCount={events.length}>
            <div className="group p-6 rounded-2xl glass-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CalendarPlus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold group-hover:text-gradient-primary transition-all duration-300 text-foreground">{t('dashboard.producer.createEvent')}</h3>
                  <p className="text-sm text-muted-foreground">{t('dashboard.producer.createEventDesc')}</p>
                </div>
              </div>
            </div>
          </CreateEventButton>

          <div className="group p-6 rounded-2xl glass-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold group-hover:text-gradient-primary transition-all duration-300 text-foreground">{t('dashboard.producer.analytics')}</h3>
                <p className="text-sm text-muted-foreground">{t('dashboard.producer.analyticsDesc')}</p>
              </div>
            </div>
          </div>
          
          <div className="group p-6 rounded-2xl glass-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer" onClick={handleChatClick}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessagesSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold group-hover:text-gradient-primary transition-all duration-300 text-foreground">{t('dashboard.producer.chat')}</h3>
                <p className="text-sm text-muted-foreground">{t('dashboard.producer.chatDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="group p-8 rounded-2xl text-center bg-secondary/10 border border-secondary/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-secondary/20">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-2 text-gradient-primary">
              {isLoading ? '...' : overallStats?.totalEvents || 0}
            </h3>
            <p className="text-sm font-medium text-muted-foreground">{t('dashboard.producer.totalEvents')}</p>
          </div>

          <div className="group p-8 rounded-2xl text-center bg-accent/10 border border-accent/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-accent/20">
            <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-2 text-gradient-primary">
              {isLoading ? '...' : overallStats?.upcomingEvents || 0}
            </h3>
            <p className="text-sm font-medium text-muted-foreground">{t('dashboard.producer.upcomingEvents')}</p>
          </div>

          <div className="group p-8 rounded-2xl text-center bg-secondary-green/10 border border-secondary-green/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-secondary-green/20">
            <div className="w-16 h-16 rounded-full bg-secondary-green flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-2 text-gradient-primary">
              {isLoading ? '...' : overallStats?.completedEvents || 0}
            </h3>
            <p className="text-sm font-medium text-muted-foreground">{t('dashboard.producer.completedEvents')}</p>
          </div>
        </div>

        {/* Events Section */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">{t('common.loadingYourEvents')}</p>
          </div>
        ) : (
          <>
            <EventsSection 
              events={events as any}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onManageAttendees={(eventId) => console.log(t('common.manageAttendees'), eventId)}
              onChatEvent={handleChatEvent}
              onManageTickets={handleManageTickets}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {t('dashboard.showing', 'Showing')} {((pagination.currentPage - 1) * 10) + 1} {t('dashboard.to', 'to')} {Math.min(pagination.currentPage * 10, pagination.totalEvents)} {t('dashboard.of', 'of')} {pagination.totalEvents} {t('dashboard.events', 'events')}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="text-muted-foreground"
                  >
                    {t('common.back', 'Previous')}
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    {t('common.next', 'Next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link to="/">
            <Button variant="outline">
              {t('dashboard.producer.backToHome')}
            </Button>
          </Link>
        </div>

        {/* Edit Event Modal */}
        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEvent(null);
          }}
          event={editingEvent}
          onSave={handleSaveEvent}
        />

        {/* Manage Ticket Modal */}
        <ManageTicketModal
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setSelectedEventForTickets(null);
          }}
          event={selectedEventForTickets}
          onSave={handleSaveTickets}
        />
      </div>
    </div>
  );
};

export default ProducerDashboard;
