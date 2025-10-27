import React, { useState, useEffect, useRef } from 'react';
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
  Settings,
  ExternalLink,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Globe,
  FileLock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const attendeesFetchedRef = useRef(false);

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
    navigate(`/edit-event/${eventId}/2`);
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

  const handleTogglePublish = async () => {
    if (!eventId || !event) return;

    try {
      const newStatus = event.status === 'published' ? 'draft' : 'published';

      const response = await apiService.updateEvent(eventId, {
        status: newStatus
      });

      if (response.success) {
        // Refetch the event
        const refreshedEvent = await apiService.getEvent(eventId);
        if (refreshedEvent.success && refreshedEvent.data) {
          setEvent(refreshedEvent.data);
        } else {
          setEvent({ ...event, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error toggling event status:', error);
    }
  };

  const fetchAttendees = async () => {
    if (!eventId) return;

    try {
      setAttendeesLoading(true);
      const response = await apiService.getEventAttendees(eventId, {
        page: 1,
        limit: 1000 // Get all attendees for now
      });

      if (response.success && response.data) {
        setAttendees(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setAttendeesLoading(false);
    }
  };

  // Fetch attendees once when event is loaded
  useEffect(() => {
    if (eventId && event && !attendeesFetchedRef.current) {
      attendeesFetchedRef.current = true;
      fetchAttendees();
    }
  }, [eventId, event]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <BackButton onClick={() => navigate(-1)} />

          {isProducer && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
              <Button
                variant={event.status === 'published' ? 'outline' : 'default'}
                size="sm"
                onClick={handleTogglePublish}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {event.status === 'published' ? (
                  <>
                    <FileLock className="w-4 h-4" />
                    <span className="hidden sm:inline">Set as Draft</span>
                    <span className="sm:hidden">Draft</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">Publish Event</span>
                    <span className="sm:hidden">Publish</span>
                  </>
                )}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/event/${eventId}`)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">View Public Page</span>
                <span className="sm:hidden">Public</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditEvent}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Event</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageTickets}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Ticket className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Tickets</span>
                <span className="sm:hidden">Tickets</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleChatEvent}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Event Chat</span>
                <span className="sm:hidden">Chat</span>
              </Button>
            </div>
          )}
        </div>

        {/* Event Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {services.slice(0, 3).map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {services.length > 3 && (
                  <Badge variant="outline" className="text-xs">
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
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">{event.description}</p>
          )}
        </div>

        {/* Event Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h3 className="text-sm sm:text-base font-semibold">Date & Time</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {format(eventDate, 'PPP')} at {timeString}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h3 className="text-sm sm:text-base font-semibold">Location</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate" title={locationString}>{locationString}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h3 className="text-sm sm:text-base font-semibold">Attendees</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} attending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs sm:text-sm">Tickets</TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs sm:text-sm">Suppliers</TabsTrigger>
            <TabsTrigger value="attendees" className="text-xs sm:text-sm">Attendees</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

          <TabsContent value="tickets" className="mt-4 sm:mt-6">
            {tickets.length === 0 ? (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <Ticket className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No Tickets Created</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">Create ticket types for your event to start selling.</p>
                  <Button onClick={handleManageTickets}>
                    <Ticket className="w-4 h-4 mr-2" />
                    Create Tickets
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket, index) => {
                  // Handle both object and primitive formats for quantity
                  const totalQuantity = typeof ticket.quantity === 'object'
                    ? ticket.quantity?.total ?? 0
                    : ticket.quantity ?? 0;

                  const soldQuantity = typeof ticket.quantity === 'object'
                    ? ticket.quantity?.sold ?? 0
                    : 0;

                  // Calculate available as total - sold
                  const availableQuantity = totalQuantity - soldQuantity;

                  // Handle both object and primitive formats for price
                  const ticketPrice = typeof ticket.price === 'object'
                    ? ticket.price?.amount ?? 0
                    : ticket.price ?? 0;

                  const currency = typeof ticket.price === 'object'
                    ? ticket.price?.currency ?? 'ILS'
                    : 'ILS';

                  const currencySymbol = currency === 'ILS' ? '₪' : currency === 'USD' ? '$' : '€';

                  const soldPercentage = totalQuantity > 0 ? (soldQuantity / totalQuantity) * 100 : 0;
                  const revenue = soldQuantity * ticketPrice;

                  return (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Ticket Info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">
                                  {ticket.name || ticket.type || ticket.title}
                                </h3>
                                {ticket.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {ticket.description}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant={ticket.status === 'active' ? 'default' : 'secondary'}
                                className="ml-2"
                              >
                                {ticket.status || 'active'}
                              </Badge>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Price</p>
                                <p className="text-sm font-semibold">{currencySymbol}{ticketPrice}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Initial Amount</p>
                                <p className="text-sm font-semibold">{totalQuantity}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Sold</p>
                                <p className="text-sm font-semibold text-green-600">{soldQuantity}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Available</p>
                                <p className="text-sm font-semibold text-blue-600">{availableQuantity}</p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Sales Progress</span>
                                <span className="font-medium">{soldPercentage.toFixed(0)}%</span>
                              </div>
                              <Progress value={soldPercentage} className="h-2" />
                            </div>

                            {/* Revenue */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-sm text-muted-foreground">Total Revenue</span>
                              <span className="text-lg font-bold text-primary">
                                {currencySymbol}{revenue.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex lg:flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 lg:flex-none"
                              onClick={() => {
                                const ticketIdValue = ticket._id || ticket.id;
                                navigate(`/event/${eventId}/ticket/${ticketIdValue}/customize-pdf`);
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">Customize PDF</span>
                              <span className="sm:hidden">PDF</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 lg:flex-none"
                              onClick={() => {
                                // Open manage tickets modal with this ticket selected
                                handleManageTickets();
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suppliers" className="mt-4 sm:mt-6">
            {suppliers.length === 0 ? (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No Suppliers Assigned</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Suppliers will be listed here once they are assigned to services.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {suppliers.map((supplier, index) => {
                  // Extract supplier details
                  const supplierName = supplier.name || supplier.supplierId?.name || supplier.supplierId?.companyName || `Supplier ${index + 1}`;
                  const supplierEmail = supplier.supplierId?.email;
                  const supplierPhone = supplier.supplierId?.phone;
                  const supplierLocation = supplier.supplierId?.location?.city;

                  // Extract package details
                  const packageDetails = supplier.packageDetails || supplier.service?.packageDetails;
                  const packageName = packageDetails?.name || supplier.serviceId || supplier.service || 'Service Package';
                  const packageDescription = packageDetails?.description;
                  const packageFeatures = packageDetails?.features || [];
                  const packageDuration = packageDetails?.duration;

                  // Extract pricing
                  const requestedPrice = supplier.requestedPrice || supplier.price;
                  const packagePrice = typeof packageDetails?.price === 'object'
                    ? packageDetails.price.amount
                    : packageDetails?.price;
                  const finalPrice = supplier.finalPrice;
                  const displayPrice = finalPrice || requestedPrice || packagePrice || 0;

                  // Status colors
                  const statusVariant =
                    supplier.status === 'confirmed' || supplier.status === 'approved'
                      ? 'default'
                      : supplier.status === 'rejected'
                      ? 'destructive'
                      : 'secondary';

                  const statusIcon =
                    supplier.status === 'approved'
                      ? <CheckCircle className="w-4 h-4" />
                      : supplier.status === 'rejected'
                      ? <XCircle className="w-4 h-4" />
                      : <AlertCircle className="w-4 h-4" />;

                  return (
                    <Card key={index} className="border-l-4" style={{
                      borderLeftColor:
                        supplier.status === 'approved' ? '#22c55e' :
                        supplier.status === 'rejected' ? '#ef4444' :
                        '#94a3b8'
                    }}>
                      <CardContent className="p-4 sm:p-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{supplierName}</h3>
                              {supplier.supplierId?.isVerified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            {(supplierEmail || supplierPhone || supplierLocation) && (
                              <div className="space-y-1 text-sm text-muted-foreground">
                                {supplierEmail && (
                                  <div className="flex items-center gap-2">
                                    <span>📧</span>
                                    <span>{supplierEmail}</span>
                                  </div>
                                )}
                                {supplierPhone && (
                                  <div className="flex items-center gap-2">
                                    <span>📞</span>
                                    <span>{supplierPhone}</span>
                                  </div>
                                )}
                                {supplierLocation && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    <span>{supplierLocation}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <Badge
                            variant={statusVariant}
                            className="flex items-center gap-1 w-fit"
                          >
                            {statusIcon}
                            <span className="capitalize">{supplier.status || 'pending'}</span>
                          </Badge>
                        </div>

                        {/* Package Details */}
                        <div className="bg-muted/30 rounded-lg p-4 mb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-base mb-1 flex items-center gap-2">
                                📦 {packageName}
                              </h4>
                              {packageDescription && (
                                <p className="text-sm text-muted-foreground">{packageDescription}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-primary">₪{displayPrice.toLocaleString()}</div>
                              {packageDuration && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{packageDuration}h</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Package Features */}
                          {packageFeatures.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Package Includes:</p>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {packageFeatures.map((feature: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Pricing Breakdown (if different prices) */}
                        {(requestedPrice || finalPrice) && (requestedPrice !== finalPrice) && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Requested Price:</span>
                              <span className="font-medium">₪{requestedPrice?.toLocaleString()}</span>
                            </div>
                            {finalPrice && (
                              <div className="flex items-center justify-between text-sm mt-1">
                                <span className="text-muted-foreground">Final Price:</span>
                                <span className="font-bold text-green-600">₪{finalPrice.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {supplier.notes && (
                          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">📝 Notes:</p>
                            <p className="text-sm text-yellow-900 dark:text-yellow-100">{supplier.notes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to supplier chat or details
                              console.log('Contact supplier:', supplier);
                            }}
                            className="flex-1"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // View supplier profile
                              console.log('View supplier:', supplier);
                            }}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendees" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Event Attendees ({attendees.length})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAttendees}
                    disabled={attendeesLoading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {attendeesLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {attendeesLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading attendees...</p>
                  </div>
                ) : attendees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Attendees Yet</h3>
                    <p className="text-muted-foreground">Attendees will appear here as they register for the event.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={fetchAttendees}
                    >
                      Load Attendees
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Table Header */}
                    <div className="hidden lg:grid lg:grid-cols-7 gap-4 pb-3 border-b font-semibold text-sm">
                      <div className="col-span-2">Attendee</div>
                      <div>Ticket Type</div>
                      <div>Amount Paid</div>
                      <div>Purchase Date</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>

                    {/* Attendee Rows */}
                    {attendees.map((attendee, index) => {
                      const ticketName = attendee.ticketTitle || attendee.ticketType || 'General Admission';
                      const purchaseDate = attendee.registeredAt
                        ? format(new Date(attendee.registeredAt), 'MMM d, yyyy')
                        : 'N/A';
                      const isCheckedIn = attendee.checkedIn || false;

                      return (
                        <Card key={index} className="hover:bg-muted/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-center">
                              {/* Attendee Info */}
                              <div className="col-span-1 lg:col-span-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-semibold text-primary">
                                      {attendee.fullName?.charAt(0).toUpperCase() || 'A'}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">{attendee.fullName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{attendee.email}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Ticket Type */}
                              <div>
                                <p className="lg:hidden text-xs text-muted-foreground mb-1">Ticket Type</p>
                                <Badge variant="outline" className="text-xs">
                                  {ticketName}
                                </Badge>
                                {attendee.ticketQuantity > 1 && (
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    x{attendee.ticketQuantity}
                                  </span>
                                )}
                              </div>

                              {/* Amount Paid */}
                              <div>
                                <p className="lg:hidden text-xs text-muted-foreground mb-1">Amount Paid</p>
                                <p className="font-semibold text-sm">
                                  ₪{(attendee.totalAmount || 0).toLocaleString()}
                                </p>
                                {attendee.ticketPrice > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    ₪{attendee.ticketPrice} each
                                  </p>
                                )}
                              </div>

                              {/* Purchase Date */}
                              <div>
                                <p className="lg:hidden text-xs text-muted-foreground mb-1">Purchase Date</p>
                                <p className="text-sm">{purchaseDate}</p>
                              </div>

                              {/* Status */}
                              <div>
                                <p className="lg:hidden text-xs text-muted-foreground mb-1">Status</p>
                                {isCheckedIn ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Checked In
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Not Checked In
                                  </Badge>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // TODO: View attendee details
                                    console.log('View attendee:', attendee);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Navigate to QR scan page with this attendee
                                    navigate(`/qr-result/${attendee.qrCode}`);
                                  }}
                                  disabled={!attendee.qrCode}
                                >
                                  QR
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
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