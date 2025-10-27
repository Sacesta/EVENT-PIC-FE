import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Bookmark,
  CheckCircle2,
  ArrowLeft,
  Music,
  Camera,
  Utensils,
  Palette,
  Shield,
  Car,
  CreditCard,
  DollarSign,
  Package,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookTicketModal } from '@/components/BookTicketModal';
import { VerifyEventPasswordModal } from '@/components/VerifyEventPasswordModal';
import { apiService } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { autoTranslate } from '@/utils/autoTranslate';
import { useToast } from '@/hooks/use-toast';
import config from '@/config/environment';
import { getImageUrl } from '@/utils/imageUtils';
import { generateGoogleCalendarUrl, downloadICSFile } from '@/utils/calendarUtils';

const PublicEventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

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
        
        console.log('📊 Public Event Details Response:', response);
        
        if (response.success && response.data) {
          const eventData = response.data;
          setEvent(eventData);
          console.log('✅ Event loaded successfully:', eventData.name);
          
          // Check if event is private and user is not the producer
          const isPrivateEvent = !eventData.isPublic;
          const isEventOwner = user?.role === 'producer' && user?.email === eventData.producerId?.email;
          
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

  const handleVerifyPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await apiService.verifyEventPassword(eventId!, password);
      
      if (response.success) {
        setIsPasswordVerified(true);
        setShowPasswordModal(false);
        toast({
          title: "Access Granted",
          description: "Password verified successfully!",
          variant: "default",
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  };

  const handlePasswordModalClose = () => {
    // If user closes the modal without verifying, redirect back
    setShowPasswordModal(false);
    navigate('/browse-events');
  };

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <BackButton onClick={() => navigate('/browse-events')}>
            {t('common.backToEvents', 'Back to Events')}
          </BackButton>
        </div>
      </div>
    );
  }

  // Show password modal for private events
  if (showPasswordModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <VerifyEventPasswordModal
          isOpen={showPasswordModal}
          onClose={handlePasswordModalClose}
          onVerify={handleVerifyPassword}
          eventName={event.name}
        />
      </div>
    );
  }

  // Use dateTimeInfo for proper date and time display
  const dateTimeInfo = event.dateTimeInfo || {};
  const eventDate = dateTimeInfo.startDate ? parseISO(`${dateTimeInfo.startDate}T${dateTimeInfo.startTime || '00:00'}`) : parseISO(event.startDate);
  const eventEndDate = dateTimeInfo.endDate ? parseISO(`${dateTimeInfo.endDate}T${dateTimeInfo.endTime || '00:00'}`) : (event.endDate ? parseISO(event.endDate) : null);
  const locationString = typeof event.location === 'string'
    ? event.location
    : `${event.location?.address || ''}, ${event.location?.city || ''}`.trim().replace(/^,\s*/, '');
  
  const minPrice = event.ticketInfo?.priceRange?.min || 0;
  const maxPrice = event.ticketInfo?.priceRange?.max || 0;
  const availableTickets = event.ticketInfo?.availableTickets || 0;
  const soldTickets = event.ticketInfo?.soldTickets || 0;
  const remainingTickets = availableTickets - soldTickets;
  
  // Handle tickets: if tickets array is empty but ticketInfo exists, create a default ticket
  const tickets = event.tickets && event.tickets.length > 0 
    ? event.tickets 
    : event.ticketInfo && event.ticketInfo.availableTickets > 0
    ? [{
        _id: 'General Admission', // Use ticket type name instead of fake ObjectId
        name: 'General Admission',
        type: 'General Admission',
        price: event.ticketInfo.priceRange?.min || 0,
        quantity: event.ticketInfo.availableTickets - (event.ticketInfo.soldTickets || 0),
        description: 'Standard entry ticket to the event'
      }]
    : [];
  
  // Service icons mapping
  const serviceIcons: { [key: string]: any } = {
    'music': Music,
    'photography': Camera,
    'catering': Utensils,
    'decoration': Palette,
    'security': Shield,
    'transportation': Car,
  };

  // Extract highlights from event data or use defaults
  const highlights = event.requiredServices && event.requiredServices.length > 0
    ? event.requiredServices.map((service: string) => service.charAt(0).toUpperCase() + service.slice(1))
    : [
        'Keynote Speakers',
        'Interactive Workshops',
        'Networking Sessions',
        'Innovation Showcase'
      ];

  // Get event duration
  const eventDuration = event.eventStatus?.duration || event.duration || 0;
  const daysUntilStart = event.eventStatus?.daysUntilStart || 0;
  
  // Get supplier stats
  const supplierStats = event.supplierStats || {};
  const groupedSuppliers = event.groupedSuppliers || [];

  const handleBookTicket = () => {
    setIsBookingModalOpen(true);
  };

  const handleBookingComplete = async (selectedTickets: any[], attendeeInfo: any) => {
    try {
      console.log('Booking completed:', { selectedTickets, attendeeInfo, eventId });

      // Prepare data for backend API
      const registrationData = {
        eventId: eventId!,
        tickets: selectedTickets.map(ticket => ({
          ticketId: ticket.ticketId,
          quantity: ticket.quantity
        })),
        attendeeInfo: {
          fullName: attendeeInfo.fullName,
          email: attendeeInfo.email,
          phone: attendeeInfo.phone,
          age: parseInt(attendeeInfo.age),
          gender: attendeeInfo.gender
        }
      };

      console.log('📤 Sending registration to backend:', registrationData);

      // Call backend API
      const response = await apiService.registerAttendee(registrationData);

      console.log('✅ Registration response:', response);

      if (response.success) {
        // Check if payment is required
        if (response.requiresPayment && response.data?.totalAmount > 0) {
          // Booking created, now initiate payment
          const bookingReference = response.data.bookingReferences[0];

          console.log('💳 Payment required, initiating payment...');

          const paymentData = {
            eventId: eventId!,
            tickets: selectedTickets.map(ticket => ({
              ticketId: ticket.ticketId,
              quantity: ticket.quantity
            })),
            attendeeInfo: {
              fullName: attendeeInfo.fullName,
              email: attendeeInfo.email,
              phone: attendeeInfo.phone
            },
            bookingReference: bookingReference
          };

          const paymentResponse = await apiService.initiatePayment(paymentData);

          if (paymentResponse.success && paymentResponse.payment?.paymentUrl) {
            // Redirect to Hyp payment gateway
            toast({
              title: "Redirecting to Payment",
              description: "You will be redirected to complete your payment...",
              variant: "default",
            });

            // Redirect to payment URL
            window.location.href = paymentResponse.payment.paymentUrl;
          } else {
            toast({
              title: "Payment Initiation Failed",
              description: paymentResponse.error || 'Failed to initiate payment. Please contact support.',
              variant: "destructive",
            });
          }
        } else {
          // Free tickets - booking complete
          toast({
            title: "Booking Successful!",
            description: `Your tickets for ${event.name} have been booked successfully. Booking reference: ${response.data?.bookingReferences?.[0] || 'N/A'}`,
            variant: "default",
          });

          // Optionally refresh event data to update ticket counts
          const refreshedEvent = await apiService.getEvent(eventId!);
          if (refreshedEvent.success && refreshedEvent.data) {
            setEvent(refreshedEvent.data);
          }
        }
      } else {
        toast({
          title: "Booking Failed",
          description: response.message || 'Failed to complete booking. Please try again.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Booking error:', error);

      let errorMessage = 'Failed to complete booking. Please try again.';
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = error.message || errorMessage;
        }
      }

      toast({
        title: "Booking Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAddToGoogleCalendar = () => {
    const startDate = dateTimeInfo.startDate
      ? new Date(`${dateTimeInfo.startDate}T${dateTimeInfo.startTime || '00:00'}`)
      : new Date(event.startDate);
    const endDate = dateTimeInfo.endDate
      ? new Date(`${dateTimeInfo.endDate}T${dateTimeInfo.endTime || '00:00'}`)
      : (event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000));

    const url = generateGoogleCalendarUrl(
      event.name,
      startDate,
      endDate,
      locationString,
      event.description
    );

    window.open(url, '_blank');

    toast({
      title: "Opening Google Calendar",
      description: "Adding event to your Google Calendar",
      variant: "default",
    });
  };

  const handleAddToAppleCalendar = () => {
    const startDate = dateTimeInfo.startDate
      ? new Date(`${dateTimeInfo.startDate}T${dateTimeInfo.startTime || '00:00'}`)
      : new Date(event.startDate);
    const endDate = dateTimeInfo.endDate
      ? new Date(`${dateTimeInfo.endDate}T${dateTimeInfo.endTime || '00:00'}`)
      : (event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000));

    downloadICSFile(
      event.name,
      startDate,
      endDate,
      locationString,
      event.description
    );

    toast({
      title: "Calendar Event Downloaded",
      description: "Open the .ics file to add to Apple Calendar",
      variant: "default",
    });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href,
      });
    }
  };

  console.log("event --->",event);
  console.log("url ---- > ",config.BACKEND_URL);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <BackButton
              variant="ghost"
              onClick={() => navigate('/browse-events')}
            >
              {t('common.backToEvents', 'Back to Events')}
            </BackButton>

            {/* Quick Edit Button for Producers */}
            {user?.role === 'producer' && user?.email === event?.producerId?.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/event/${eventId}/manage`)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Event</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Event Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                {autoTranslate(event.name, i18n.language)}
              </h1>
            </div>

            {/* Event Banner Image - Always show */}

<div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background shadow-lg">
 <img
  src={getImageUrl(event.image) || '/image.png'}
  alt={autoTranslate(event.name, i18n.language)}
  className="w-full h-full object-cover"
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== window.location.origin + '/image.png') {
      target.src = '/image.png';
    }
  }}
/>

</div>


            {/* Event Info */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Host */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Hosted by</p>
                    <p className="text-lg font-semibold text-primary">
                      {autoTranslate(
                        event.producerId?.name || 
                        event.producerId?.companyName || 
                        'Event Organizer',
                        i18n.language
                      )}
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">
                        {format(eventDate, 'EEEE, MMMM d, yyyy')} at {format(eventDate, 'h:mm a')}
                      </p>
                      {eventEndDate && (
                        <p className="text-sm text-muted-foreground">
                         {format(eventEndDate, 'EEEE, MMMM d, yyyy')} at {format(eventEndDate, 'h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">
                        {autoTranslate(locationString || 'Location TBD', i18n.language)}
                      </p>
                    </div>
                  </div>

                  {/* Interested Count - Only show if views exist */}
                  {/* {event.views && event.views > 0 && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {event.views} people interested
                      </p>
                    </div>
                  )} */}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    Save
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto"
                      >
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Add to Calendar</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleAddToGoogleCalendar}>
                        Google Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleAddToAppleCalendar}>
                        Apple Calendar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* About this event */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">About this event</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {autoTranslate(
                    event.description ||
                    'Join us for an exciting event bringing together the brightest minds in technology. This year\'s summit will feature keynote speeches from industry leaders, interactive workshops, and networking opportunities. Connect with fellow innovators shaping the future of tech. Don\'t miss out on this exciting opportunity to learn, collaborate, and grow.',
                    i18n.language
                  )}
                </p>
              </CardContent>
            </Card>

      

            {/* Highlights */}
            {highlights.length > 0 && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Event Features</h2>
                  <div className="space-y-2 sm:space-y-3">
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                        <span className="text-sm sm:text-base text-muted-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Map */}
            {event.location?.coordinates && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Location</h2>
                  <div className="w-full h-64 bg-muted rounded-lg overflow-hidden">
                    {/* Placeholder for map - integrate with Google Maps or similar */}
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <MapPin className="w-12 h-12" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {autoTranslate(locationString, i18n.language)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Ticket Booking Card */}
            <Card className="lg:sticky lg:top-4">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Tickets from</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {minPrice === 0 ? 'Free' : `$${minPrice}`}
                  </p>
                  {maxPrice > minPrice && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Up to ${maxPrice}
                    </p>
                  )}
                </div>

                <Button
                  className="w-full mb-3 sm:mb-4"
                  size="lg"
                  onClick={handleBookTicket}
                  disabled={remainingTickets === 0}
                >
                  {remainingTickets === 0 ? 'Sold Out' : 'Book Ticket'}
                </Button>

                {remainingTickets > 0 && remainingTickets < 20 && (
                  <p className="text-xs sm:text-sm text-orange-600 text-center">
                    Only {remainingTickets} tickets left!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Interests/Tags */}
            {event.tags && event.tags.length > 0 && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {event.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {autoTranslate(tag, i18n.language)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Details */}
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Event Details</h3>
                
                {/* Category */}
                {event.category && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category</p>
                    <Badge variant="outline" className="text-sm">
                      {autoTranslate(event.category, i18n.language)}
                    </Badge>
                  </div>
                )}
                
                {/* Duration */}
                {eventDuration > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {eventDuration} {eventDuration === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                )}
                
                {/* Days Until Start */}
                {daysUntilStart > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Starts In</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {daysUntilStart} {daysUntilStart === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                )}
                
                {/* Language */}
                {event.language && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Language</p>
                    <p className="text-sm font-medium">
                      {event.language === 'en' ? 'English' : event.language === 'he' ? 'Hebrew' : event.language}
                    </p>
                  </div>
                )}
                
                {/* Estimated Cost */}
                {event.financialSummary?.estimatedCost > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Event Cost</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      ₪{event.financialSummary.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Producer Contact */}
            {event.producerId && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Organizer</h3>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-medium truncate">
                        {event.producerId.name || 'Event Organizer'}
                      </p>
                      {event.producerId.email && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {event.producerId.email}
                        </p>
                      )}
                      {event.producerId.phone && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {event.producerId.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Events */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Recommended Events</h3>
                <div className="space-y-4">
                  {/* Placeholder for recommended events */}
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">Summer Music Festival</p>
                      <p className="text-xs text-muted-foreground">Sat, Jul 20, 7:00 PM</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">Art in the Park</p>
                      <p className="text-xs text-muted-foreground">Sun, Jul 21, 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            {event.bankDetails && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Bank Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Name</p>
                      <p className="text-sm font-medium">{event.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Branch</p>
                      <p className="text-sm font-medium">{event.bankDetails.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="text-sm font-medium">{event.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Holder</p>
                      <p className="text-sm font-medium">{event.bankDetails.accountHolderName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Book Ticket Modal */}
      <BookTicketModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        tickets={tickets}
        eventName={event.name}
        onBookingComplete={handleBookingComplete}
      />

      {/* Password Verification Modal */}
      <VerifyEventPasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onVerify={handleVerifyPassword}
        eventName={event.name}
      />
    </div>
  );
};

export default PublicEventDetails;
