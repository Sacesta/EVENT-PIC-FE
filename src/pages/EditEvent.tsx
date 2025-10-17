
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, XCircle } from 'lucide-react';
import Step1_ServicesAndSuppliers from '@/components/events/create/Step1_ServicesAndSuppliers_Fixed';
import Step2_Details from '@/components/events/create/Step2_Details_Refactored';
import Step_ProducerDetails from '@/components/events/create/Step_ProducerDetails';
import Step3_Summary from '@/components/events/create/Step3_Summary';
import { EventData, Ticket } from '@/components/events/create/types';
import apiService, { type Event } from '@/services/api';

interface EditEventProps {
  eventId?: string;
}

const EditEvent: React.FC<EditEventProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { toast } = useToast();

  // Get event ID from URL params
  const eventId = params.eventId;
  
  // Get current step from URL params, default to 1
  const currentStep = params.step ? parseInt(params.step) : 1;
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalEvent, setOriginalEvent] = useState<Event | null>(null);

  // Form state - using refs for stable references
  const [services, setServices] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<{ [service: string]: { [supplierId: string]: string[] } }>({});
  const [currentTab, setCurrentTab] = useState('services');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventType, setEventType] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [eventPassword, setEventPassword] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [tickets, setTickets] = useState<Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    currency: string;
  }>>([]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    branch: '',
    accountNumber: '',
    accountHolderName: ''
  });

  // Create eventData object with stable reference but updated values
  const eventDataRef = useRef<EventData>({} as EventData);
  eventDataRef.current = {
    name, description, startDate, endDate, startTime, endTime, location: eventLocation, eventType,
    isPrivate, eventPassword, isPaid, tickets, services,
    selectedSuppliers, specialRequests, currentTab, isFree: !isPaid, freeTicketLimit: 0, selectedPackages: {}, bankDetails
  };

  const steps = useMemo(() => [
    {
      number: 1,
      title: t('createEvent.steps.servicesSuppliers'),
      path: `/edit-event/${eventId}/step/1`
    },
    {
      number: 2,
      title: t('createEvent.steps.eventDetails'),
      path: `/edit-event/${eventId}/step/2`
    },
    {
      number: 3,
      title: t('createEvent.steps.bankDetails'),
      path: `/edit-event/${eventId}/step/3`
    },
    {
      number: 4,
      title: t('createEvent.steps.summary'),
      path: `/edit-event/${eventId}/step/4`
    }
  ], [t, eventId]);

  // Load event data from API
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) {
        setError('Event ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading event data for ID:', eventId);
        
        // Use real API call to get event by ID
        const response = await apiService.getEvent(eventId);
        
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load event data');
        }

        const eventData = response.data as Event;
        console.log('Loaded event data:', eventData);
        
        setOriginalEvent(eventData);
        
        // Pre-populate form fields with real API data
        setName(eventData.name || '');
        setDescription(eventData.description || '');
        
        // Handle date formatting - extract date from startDate
        if (eventData.startDate) {
          const startDate = new Date(eventData.startDate);
          setStartDate(startDate.toISOString().split('T')[0]); // YYYY-MM-DD format
          setStartTime(startDate.toTimeString().slice(0, 5)); // HH:MM format
        }

        // Handle end date if available
        if (eventData.endDate) {
          const endDate = new Date(eventData.endDate);
          setEndDate(endDate.toISOString().split('T')[0]); // YYYY-MM-DD format
          setEndTime(endDate.toTimeString().slice(0, 5)); // HH:MM format
        }
        
        // Handle location - can be string or object
        if (typeof eventData.location === 'string') {
          setEventLocation(eventData.location);
        } else if (eventData.location && eventData.location.address) {
          setEventLocation(`${eventData.location.address}, ${eventData.location.city}`);
        }
        
        setEventType(eventData.category || '');
        setIsPrivate(!eventData.isPublic);
        setEventPassword(''); // Password not returned from API for security
        
        // Determine if event is paid based on ticket info
        const hasPaidTickets = eventData.ticketInfo?.priceRange?.min && eventData.ticketInfo.priceRange.min > 0;
        setIsPaid(hasPaidTickets || false);
        
        // Handle tickets - convert from API format to form format
        const formattedTickets = eventData.ticketInfo ? [{
          id: 'general',
          name: 'General Admission',
          quantity: eventData.ticketInfo.availableTickets || 0,
          price: eventData.ticketInfo.priceRange?.min || 0,
          currency: 'ILS'
        }] : [];
        setTickets(formattedTickets);
        
        setServices(eventData.requiredServices || []);
        
        // Handle suppliers - convert from API format to form format
        const formattedSuppliers: { [service: string]: { [supplierId: string]: string[] } } = {};
        if (eventData.suppliers && Array.isArray(eventData.suppliers) && eventData.suppliers.length > 0) {
          eventData.suppliers.forEach((supplier) => {
            // Handle both string and object types for serviceId and supplierId
            let serviceId: string | undefined;
            let supplierId: string | undefined;
            
            if (typeof supplier.serviceId === 'string') {
              serviceId = supplier.serviceId;
            } else if (supplier.serviceId && typeof supplier.serviceId === 'object' && '_id' in supplier.serviceId) {
              serviceId = (supplier.serviceId as { _id: string })._id;
            }
            
            if (typeof supplier.supplierId === 'string') {
              supplierId = supplier.supplierId;
            } else if (supplier.supplierId && typeof supplier.supplierId === 'object' && '_id' in supplier.supplierId) {
              supplierId = (supplier.supplierId as { _id: string })._id;
            }
            
            if (serviceId && supplierId) {
              if (!formattedSuppliers[serviceId]) {
                formattedSuppliers[serviceId] = {};
              }
              formattedSuppliers[serviceId][supplierId] = [serviceId];
            }
          });
        }
        setSelectedSuppliers(formattedSuppliers);
        
        // Special requests - not in current API response, keep empty for now
        setSpecialRequests('');

      } catch (err) {
        console.error('Error loading event data:', err);
        let errorMessage = 'Failed to load event data. Please try again.';
        
        // Handle specific error types
        if (err instanceof Error) {
          try {
            const errorData = JSON.parse(err.message);
            if (errorData.status === 404) {
              errorMessage = 'Event not found. It may have been deleted.';
            } else if (errorData.status === 403) {
              errorMessage = 'You do not have permission to edit this event.';
            } else {
              errorMessage = errorData.message || errorMessage;
            }
          } catch {
            errorMessage = err.message || errorMessage;
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

  // Save data to sessionStorage whenever form data changes (for persistence during editing)
  useEffect(() => {
    if (!loading && originalEvent) {
      const dataToSave = {
        services, selectedSuppliers, currentTab, name, description,
        startDate, endDate, startTime, endTime, location: eventLocation, eventType, isPrivate,
        eventPassword, isPaid, tickets, specialRequests
      };
      sessionStorage.setItem(`editEventData_${eventId}`, JSON.stringify(dataToSave));
    }
  }, [services, selectedSuppliers, currentTab, name, description, startDate, endDate, startTime, endTime, eventLocation, eventType, isPrivate, eventPassword, isPaid, tickets, specialRequests, loading, originalEvent, eventId]);

  const handleInputChange = useCallback((field: string, value: unknown) => {
    switch (field) {
      case 'name': setName(value as string); break;
      case 'description': setDescription(value as string); break;
      case 'startDate': setStartDate(value as string); break;
      case 'endDate': setEndDate(value as string); break;
      case 'startTime': setStartTime(value as string); break;
      case 'endTime': setEndTime(value as string); break;
      case 'location': setEventLocation(value as string); break;
      case 'eventType': setEventType(value as string); break;
      case 'isPrivate': setIsPrivate(value as boolean); break;
      case 'eventPassword': setEventPassword(value as string); break;
      case 'isPaid': setIsPaid(value as boolean); break;
      case 'tickets': setTickets(value as Ticket[]); break;
      case 'specialRequests': setSpecialRequests(value as string); break;
      case 'services': setServices(value as string[]); break;
      case 'selectedSuppliers': setSelectedSuppliers(value as { [service: string]: { [supplierId: string]: string[] } }); break;
      case 'currentTab': setCurrentTab(value as string); break;
    }
  }, []);

  const nextStep = useCallback(() => {
    const next = Math.min(currentStep + 1, steps.length);
    navigate(`/edit-event/${eventId}/step/${next}`);
  }, [currentStep, steps.length, navigate, eventId]);

  const prevStep = useCallback(() => {
    const prev = Math.max(currentStep - 1, 1);
    navigate(`/edit-event/${eventId}/step/${prev}`);
  }, [currentStep, navigate, eventId]);

  const handleUpdateEvent = useCallback(async () => {
    if (!eventId) {
      toast({
        title: t('createEvent.editEvent.updateFailed'),
        description: t('createEvent.editEvent.eventIdMissing'),
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('=== UPDATE EVENT DATA DEBUG ===');
      console.log('Raw eventData:', eventDataRef.current);
      console.log('Selected Services:', eventDataRef.current.services);
      console.log('Selected Suppliers:', eventDataRef.current.selectedSuppliers);
      
      // Create start and end dates
      const eventDate = new Date(eventDataRef.current.startDate);
      const [hours, minutes] = eventDataRef.current.startTime.split(':').map(Number);

      const startDate = new Date(eventDate);
      startDate.setHours(hours, minutes, 0, 0);

      // Use end date/time if available, otherwise assume event duration of 4 hours
      let endDate: Date;
      if (eventDataRef.current.endDate && eventDataRef.current.endTime) {
        const endDateTime = new Date(eventDataRef.current.endDate);
        const [endHours, endMinutes] = eventDataRef.current.endTime.split(':').map(Number);
        endDate = new Date(endDateTime);
        endDate.setHours(endHours, endMinutes, 0, 0);
      } else {
        endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 4);
      }

      // Transform suppliers from nested object to backend expected format (nested services structure)
      const suppliers: Array<{
        supplierId: string;
        services: Array<{
          serviceId: string;
          requestedPrice?: number;
          notes?: string;
          priority?: 'low' | 'medium' | 'high';
        }>;
      }> = [];

      console.log('Processing selectedSuppliers:', eventDataRef.current.selectedSuppliers);

      // Create a map to group services by supplier
      const supplierServicesMap = new Map<string, Array<{
        serviceId: string;
        requestedPrice?: number;
        notes?: string;
        priority?: 'low' | 'medium' | 'high';
      }>>();

      if (eventDataRef.current.selectedSuppliers && typeof eventDataRef.current.selectedSuppliers === 'object') {
        Object.entries(eventDataRef.current.selectedSuppliers).forEach(([serviceCategory, serviceSuppliers]) => {
          console.log(`Processing service category: ${serviceCategory}`, serviceSuppliers);
          
          if (serviceSuppliers && typeof serviceSuppliers === 'object') {
            Object.entries(serviceSuppliers).forEach(([supplierId, serviceIds]) => {
              console.log(`Processing supplier: ${supplierId}`, serviceIds);
              
              if (Array.isArray(serviceIds)) {
                serviceIds.forEach((serviceId) => {
                  const serviceEntry = {
                    serviceId,
                    priority: 'medium' as const,
                    notes: `Selected for ${serviceCategory} service`,
                    requestedPrice: undefined // Can be added later if needed
                  };
                  
                  // Add to supplier's services array
                  if (!supplierServicesMap.has(supplierId)) {
                    supplierServicesMap.set(supplierId, []);
                  }
                  supplierServicesMap.get(supplierId)!.push(serviceEntry);
                  
                  console.log('Adding service entry for supplier:', supplierId, serviceEntry);
                });
              } else {
                console.warn('serviceIds is not an array:', serviceIds);
              }
            });
          } else {
            console.warn('serviceSuppliers is not an object:', serviceSuppliers);
          }
        });
      } else {
        console.warn('selectedSuppliers is not an object or is null/undefined:', eventDataRef.current.selectedSuppliers);
      }

      // Convert map to final suppliers array format
      supplierServicesMap.forEach((services, supplierId) => {
        suppliers.push({
          supplierId,
          services
        });
      });

      console.log('Final suppliers array (backend format with nested services):', suppliers);

      // Valid service categories - 12 categories
      const validServiceCategories = [
        'dj', 'security', 'scenery', 'sounds_lights', 'catering', 'bar',
        'first_aid', 'musicians', 'insurance', 'photography', 'location', 'transportation','other'
      ];

      // Filter and map services to valid categories
      const mappedServices = eventDataRef.current.services
        .map(service => {
          // Map common service names to valid categories
          const serviceMapping: { [key: string]: string } = {
            'dj': 'music',
            'band': 'music',
            'sound': 'music',
            'flowers': 'decoration',
            'venue': 'other',
            'cake': 'catering',
            'entertainment': 'other',
            'transport': 'transportation',
            'car': 'transportation',
            'bus': 'transportation'
          };
          
          const lowerService = service.toLowerCase();
          
          // Check if it's already a valid category
          if (validServiceCategories.includes(lowerService)) {
            return lowerService;
          }
          
          // Map to valid category or default to 'other'
          return serviceMapping[lowerService] || 'other';
        })
        .filter((service, index, array) => array.indexOf(service) === index); // Remove duplicates

      // Calculate ticket info
      const totalTickets = eventDataRef.current.tickets?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
      const totalRevenue = eventDataRef.current.tickets?.reduce((sum, ticket) => sum + (ticket.quantity * ticket.price), 0) || 0;
      const minPrice = eventDataRef.current.tickets && eventDataRef.current.tickets.length > 0 ? Math.min(...eventDataRef.current.tickets.map(t => t.price)) : 0;
      const maxPrice = eventDataRef.current.tickets && eventDataRef.current.tickets.length > 0 ? Math.max(...eventDataRef.current.tickets.map(t => t.price)) : 0;

      // Extract city from location (assume format "Address, City" or just "City")
      const locationParts = eventDataRef.current.location.split(',');
      const city = locationParts.length > 1 ? locationParts[locationParts.length - 1].trim() : eventDataRef.current.location;
      const address = locationParts.length > 1 ? locationParts.slice(0, -1).join(',').trim() : eventDataRef.current.location;

      // Transform form data to API format (same as CreateEvent)
      const updateData = {
        name: eventDataRef.current.name,
        description: eventDataRef.current.description || '',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(), // Use the calculated endDate
        location: {
          address: address,
          city: city
        },
        language: 'en' as const, // Default to English
        category: eventDataRef.current.eventType || 'other',
        requiredServices: mappedServices,
        suppliers: suppliers, // Now correctly structured with nested services
        status: originalEvent?.status || 'draft' as const, // Keep existing status or default to draft
        isPublic: !eventDataRef.current.isPrivate,
        ...(eventDataRef.current.isPaid && totalTickets > 0 && {
          ticketInfo: {
            availableTickets: totalTickets,
            soldTickets: 0,
            reservedTickets: 0,
            priceRange: {
              min: minPrice,
              max: maxPrice
            }
          }
        }),
        ...(eventDataRef.current.isPaid && totalRevenue > 0 && {
          budget: {
            total: totalRevenue,
            spent: 0
          }
        }),
        tags: eventDataRef.current.services || [],
      };

      console.log('=== FINAL UPDATE DATA ===');
      console.log('Update data:', updateData);
      console.log('Suppliers count:', suppliers.length);
      console.log('Required services:', mappedServices);
      console.log('===========================');

      // Use real API call to update event
      const response = await apiService.updateEvent(eventId, updateData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update event');
      }

      console.log('Event updated successfully:', response);
      
      // Clear saved data after successful update
      sessionStorage.removeItem(`editEventData_${eventId}`);
      
      // Navigate back to dashboard or event details
      navigate('/producer-dashboard');
      
      toast({
        title: t('createEvent.editEvent.eventUpdatedSuccessfully'),
        description: t('createEvent.editEvent.changesAreLive'),
      });
    } catch (error) {
      console.error('Error updating event:', error);
      
      let errorMessage = 'Failed to update event. Please try again.';
      
      // Handle specific error types
      if (error instanceof Error) {
          try {
            const errorData = JSON.parse(error.message);
            if (errorData.status === 403) {
              errorMessage = t('createEvent.editEvent.noPermission');
            } else if (errorData.status === 404) {
              errorMessage = t('createEvent.editEvent.eventNotFound');
            } else {
              errorMessage = errorData.message || errorMessage;
            }
          } catch {
            errorMessage = error.message || errorMessage;
          }
      }
      
      toast({
        title: t('createEvent.editEvent.updateFailed'),
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [navigate, toast, eventId, originalEvent]);

  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      // Go back to dashboard or previous page
      navigate('/producer-dashboard');
    } else {
      prevStep();
    }
  }, [currentStep, navigate, prevStep]);

  // Redirect to step 1 if no step is specified
  useEffect(() => {
    if (location.pathname === `/edit-event/${eventId}`) {
      navigate(`/edit-event/${eventId}/step/1`, { replace: true });
    }
  }, [location.pathname, navigate, eventId]);

  // Validate step number
  if (currentStep < 1 || currentStep > steps.length) {
    navigate(`/edit-event/${eventId}/step/1`, { replace: true });
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">{t('createEvent.editEvent.loadingEventData')}</h3>
            <p className="text-muted-foreground">{t('createEvent.editEvent.pleaseWait')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-400">{t('createEvent.editEvent.errorLoadingEvent')}</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate('/producer-dashboard')}>
                {t('createEvent.editEvent.goBack')}
              </Button>
              <Button onClick={() => window.location.reload()}>
                {t('createEvent.editEvent.tryAgain')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t('createEvent.editEvent.title')}: {name}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            {t('createEvent.editEvent.subtitle')}
          </p>
        </div>

        {/* Step Indicator */}
        <Card className="mb-4 sm:mb-8">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation select-none ${
                      currentStep > step.number ? 'bg-green-500 text-white border-green-500 dark:bg-green-600' :
                      currentStep === step.number ? 'border-primary text-primary bg-primary/10' :
                      'border-border text-muted-foreground'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <p className={`mt-1 sm:mt-2 text-xs sm:text-sm font-medium transition-all duration-300 max-w-[80px] sm:max-w-[100px] leading-tight ${
                      currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 sm:mx-4 rounded transition-all duration-300 ${
                      currentStep > step.number ? 'bg-green-500 dark:bg-green-600' : 'bg-border'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div> 
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-2">
          <CardContent className="p-3 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="min-h-[400px] sm:min-h-[500px]"
              >
                {currentStep === 1 && (
                  <Step1_ServicesAndSuppliers
                    eventData={eventDataRef}
                    onUpdate={handleInputChange}
                    selectedServices={services}
                    onServicesChange={(newServices) => handleInputChange('services', newServices)}
                    selectedSuppliers={selectedSuppliers}
                    onSuppliersChange={(newSuppliers) => handleInputChange('selectedSuppliers', newSuppliers)}
                    onNext={nextStep}
                    isEditMode={true}
                  />
                )}
                {currentStep === 2 && (
                  <Step2_Details
                    eventData={eventDataRef.current}
                    onUpdate={handleInputChange}
                    onNext={nextStep}
                    onBack={prevStep}
                    isEditMode={true}
                  />
                )}
                {currentStep === 3 && (
                  <Step_ProducerDetails
                    eventData={eventDataRef.current}
                    onUpdate={handleInputChange}
                    onNext={nextStep}
                    onBack={prevStep}
                    isEditMode={true}
                  />
                )}
                {currentStep === 4 && (
                  <Step3_Summary
                    eventData={eventDataRef.current}
                    onBack={prevStep}
                    onCreateEvent={handleUpdateEvent}
                    isEditMode={true}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditEvent;
