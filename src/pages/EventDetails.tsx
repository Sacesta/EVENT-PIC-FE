import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Lock, 
  Camera, 
  Utensils, 
  Music, 
  Palette, 
  MapPinIcon, 
  Shield, 
  Car,
  ArrowLeft,
  Pencil,
  MessageCircle,
  Ticket,
  Eye,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditEventModal } from '@/components/EditEventModal';
import { ManageTicketModal } from '@/components/ManageTicketModal';
import { PaymentModal } from '@/components/PaymentModal';
import { apiService } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  // Private event password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  const serviceIcons: { [key: string]: any } = {
    'photography': Camera,
    'catering': Utensils,
    'dj': Music,
    'decoration': Palette,
    'venue': MapPinIcon,
    'flowers': Palette,
    'security': Shield,
    'transportation': Car
  };

  useEffect(() => {
    if (!eventId) {
      setError('Event ID not provided');
      setIsLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiService.getEvent(eventId);
        
        console.log('📊 Event Details Response:', response);
        
        if (response.success && response.data) {
          setEvent(response.data);
          console.log('✅ Event loaded successfully:', response.data.name);
          
          // Check if event is private and user is not the producer
          const isPrivateEvent = !response.data.isPublic;
          const isEventOwner = user?.role === 'producer' && user?.email === response.data.producerEmail;
          
          if (isPrivateEvent && !isEventOwner && !isPasswordVerified) {
            setShowPasswordModal(true);
          }
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('❌ Error fetching event:', err);
        setError('Failed to load event. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, user, isPasswordVerified]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isProducer = user?.role === 'producer' && user?.email === event.producerEmail;
  const eventDate = new Date(event.startDate || event.date);
  const timeString = event.time || format(eventDate, 'HH:mm');
  const locationString = typeof event.location === 'string' 
    ? event.location 
    : `${event.location?.address || ''}, ${event.location?.city || ''}`.trim().replace(/^,\s*/, '');
  const services = event.requiredServices || event.services || [];
  const tickets = event.tickets || [];
  const attendeeCount = event.attendees?.length || 0;
  
  // Handle both regular suppliers array and groupedSuppliers from backend
  const suppliers = event.groupedSuppliers 
    ? Object.values(event.groupedSuppliers).flatMap((group: any) => 
        group.services.map((service: any) => ({
          name: group.supplier?.name || group.supplier?.companyName,
          serviceId: service.service?.title || service.service?._id,
          status: service.status,
          price: service.requestedPrice || service.service?.price,
          ...service
        }))
      )
    : event.suppliers || [];

  const handleEditEvent = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveEvent = async (updatedEvent: any) => {
    try {
      // Update the event
      await apiService.updateEvent(eventId!, updatedEvent);
      
      // Refetch the event to get the latest data from the server
      const refreshedEvent = await apiService.getEvent(eventId!);
      
      if (refreshedEvent.success && refreshedEvent.data) {
        // Update local state with fresh data from API
        setEvent(refreshedEvent.data);
      } else {
        // Fallback to merging updated data if refetch fails
        setEvent({ ...event, ...updatedEvent });
      }
    } catch (error) {
      console.error('Error saving event:', error);
      // Still try to update local state on error
      setEvent({ ...event, ...updatedEvent });
    }
  };

  const handleManageTickets = () => {
    setIsTicketModalOpen(true);
  };

  const handleSaveTickets = (eventId: string, updatedTickets: any[]) => {
    setEvent({ ...event, tickets: updatedTickets });
  };

  const handleBuyTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsPaymentModalOpen(true);
  };

  const handleChatEvent = () => {
    navigate(`/event-chat/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          {isProducer && (
            <div className="flex gap-2 ml-auto">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleEditEvent}
                className="flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit Event
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleManageTickets}
                className="flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                Manage Tickets
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleChatEvent}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Event Chat
              </Button>
            </div>
          )}
        </div>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-2">
                {services.slice(0, 3).map((service) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
                {services.length > 3 && (
                  <Badge variant="outline">
                    +{services.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {event.isPrivate && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Private
                </Badge>
              )}
              {event.isPaid && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Paid Event
                </Badge>
              )}
              {event.status && (
                <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                  {event.status}
                </Badge>
              )}
            </div>
          </div>

          {event.description && (
            <p className="text-lg text-muted-foreground">{event.description}</p>
          )}
        </div>

        {/* Event Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">Date & Time</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(eventDate, 'PPP')} at {timeString}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">Location</h3>
              </div>
              <p className="text-sm text-muted-foreground">{locationString}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">Attendees</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} attending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Required Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {services.map((service) => {
                      const IconComponent = serviceIcons[service] || Users;
                      return (
                        <div key={service} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <span className="font-medium">{service}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Event Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Attendees</span>
                    <span className="font-semibold">{attendeeCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Services Required</span>
                    <span className="font-semibold">{services.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Suppliers</span>
                    <span className="font-semibold">{suppliers.length}</span>
                  </div>
                  {tickets.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Ticket Types</span>
                      <span className="font-semibold">{tickets.length}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            {tickets.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Tickets Available</h3>
                  <p className="text-muted-foreground">This is a free event with no ticket requirements.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket, index) => (
                  <Card key={index} className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-lg">{ticket.name || ticket.type}</h3>
                        <Badge variant="secondary">{ticket.quantity} available</Badge>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-primary">₪{ticket.price}</span>
                        <span className="text-muted-foreground ml-2">per ticket</span>
                      </div>

                      {!isProducer && (
                        <Button 
                          className="w-full"
                          onClick={() => handleBuyTicket(ticket)}
                          disabled={ticket.quantity === 0}
                        >
                          {ticket.quantity === 0 ? 'Sold Out' : 'Buy Ticket'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suppliers" className="mt-6">
            {suppliers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Suppliers Assigned</h3>
                  <p className="text-muted-foreground">Suppliers will be listed here once they are assigned to services.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suppliers.map((supplier, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{supplier.name || `Supplier ${index + 1}`}</h3>
                        <Badge 
                          variant={
                            supplier.status === 'confirmed' || supplier.status === 'approved' 
                              ? 'default' 
                              : supplier.status === 'rejected' 
                              ? 'destructive' 
                              : 'secondary'
                          }
                        >
                          {supplier.status || 'pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Service: {supplier.serviceId || supplier.service || 'N/A'}
                      </p>
                      {supplier.price && (
                        <p className="text-sm font-medium">₪{supplier.price}</p>
                      )}
                      {supplier.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Note: {supplier.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendees" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Attendees ({attendeeCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {attendeeCount === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Attendees Yet</h3>
                    <p className="text-muted-foreground">Attendees will appear here as they register for the event.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* This would show actual attendee data when available */}
                    <p className="text-muted-foreground">Attendee management features coming soon.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          event={event}
          onSave={handleSaveEvent}
        />

        <ManageTicketModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          event={event}
          onSave={handleSaveTickets}
        />

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedTicket(null);
          }}
          onPaymentSuccess={() => {
            console.log('Ticket purchased:', selectedTicket);
            // Handle successful ticket purchase
          }}
        />
      </div>
    </div>
  );
};

export default EventDetails;