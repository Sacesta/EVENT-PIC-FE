import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, DollarSign, Lock, Camera, Video, UtensilsCrossed, Music, Palette, MapPinIcon, Shield, Car, Loader2, CheckCircle, Lightbulb, Volume2, Armchair, Home, Grid3X3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import apiService from '@/services/api';

interface SupplierData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  supplierDetails?: {
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    companyName?: string;
    description?: string;
  };
}

interface Step3_SummaryProps {
  eventData: {
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    eventType: string;
    isPrivate: boolean;
    isPaid: boolean;
    tickets: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    services: string[];
    selectedSuppliers: { [service: string]: { [supplierId: string]: string[] } };
  };
  onBack: () => void;
  onCreateEvent: () => void;
  isEditMode?: boolean;
  eventId?: string;
}

const Step3_Summary: React.FC<Step3_SummaryProps> = ({ eventData, onBack, onCreateEvent, isEditMode = false, eventId }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoadingUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [supplierDetails, setSupplierDetails] = useState<{ [key: string]: SupplierData }>({});
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  const serviceIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'photography': Camera,
    'videography': Video,
    'catering': UtensilsCrossed,
    'music': Music,
    'dj': Music,
    'decoration': Palette,
    'venue': MapPinIcon,
    'flowers': Palette,
    'security': Shield,
    'transportation': Car,
    'lighting': Lightbulb,
    'sound': Volume2,
    'furniture': Armchair,
    'tents': Home,
    'other': Grid3X3
  };

  // Transform frontend data to backend format
  const transformEventData = () => {
    console.log('=== TRANSFORM EVENT DATA DEBUG ===');
    console.log('Raw eventData:', eventData);
    console.log('Selected Services:', eventData.services);
    console.log('Selected Suppliers:', eventData.selectedSuppliers);
    
    // Create start and end dates
    const eventDate = new Date(eventData.date);
    const [hours, minutes] = eventData.time.split(':').map(Number);
    
    const startDate = new Date(eventDate);
    startDate.setHours(hours, minutes, 0, 0);
    
    // Assume event duration of 4 hours if not specified
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 4);

    // Transform suppliers from nested object to backend expected format (nested services structure)
    const suppliers: Array<{
      services: Array<{
        serviceId: string;
        requestedPrice?: number;
        notes?: string;
        priority?: 'low' | 'medium' | 'high';
      }>;
      supplierId: string;
    }> = [];

    console.log('Processing selectedSuppliers:', eventData.selectedSuppliers);

    // Create a map to group services by supplier
    const supplierServicesMap = new Map<string, Array<{
      serviceId: string;
      requestedPrice?: number;
      notes?: string;
      priority?: 'low' | 'medium' | 'high';
    }>>();

    if (eventData.selectedSuppliers && typeof eventData.selectedSuppliers === 'object') {
      Object.entries(eventData.selectedSuppliers).forEach(([serviceCategory, serviceSuppliers]) => {
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
      console.warn('selectedSuppliers is not an object or is null/undefined:', eventData.selectedSuppliers);
    }

    // Convert map to final suppliers array format
    supplierServicesMap.forEach((services, supplierId) => {
      suppliers.push({
        supplierId,
        services
      });
    });

    console.log('Final suppliers array (backend format with nested services):', suppliers);

    // Calculate ticket info
    const totalTickets = eventData.tickets?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
    const totalRevenue = eventData.tickets?.reduce((sum, ticket) => sum + (ticket.quantity * ticket.price), 0) || 0;
    const minPrice = eventData.tickets && eventData.tickets.length > 0 ? Math.min(...eventData.tickets.map(t => t.price)) : 0;
    const maxPrice = eventData.tickets && eventData.tickets.length > 0 ? Math.max(...eventData.tickets.map(t => t.price)) : 0;

    // Extract city from location (assume format "Address, City" or just "City")
    const locationParts = eventData.location.split(',');
    const city = locationParts.length > 1 ? locationParts[locationParts.length - 1].trim() : eventData.location;
    const address = locationParts.length > 1 ? locationParts.slice(0, -1).join(',').trim() : eventData.location;

    const transformedData = {
      name: eventData.name,
      description: eventData.description || '',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location: {
        address: address,
        city: city
      },
      language: 'en' as const, // Default to English
      category: eventData.eventType,
      requiredServices: eventData.services || [],
      suppliers: suppliers, // Now correctly structured with nested services
      status: 'draft' as const,
      isPublic: !eventData.isPrivate,
      ...(eventData.isPaid && totalTickets > 0 && {
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
      ...(eventData.isPaid && totalRevenue > 0 && {
        budget: {
          total: totalRevenue,
          spent: 0
        }
      }),
      tags: eventData.services || [],
    };

    console.log('=== FINAL TRANSFORMED DATA ===');
    console.log('Transformed data:', transformedData);
    console.log('Suppliers count:', suppliers.length);
    console.log('Required services:', eventData.services);
    console.log('===================================');
    
    return transformedData;
  };

  // Handle event creation or update
  const handleCreateEvent = async () => {
    // Check if user is authenticated and is a producer
    if (!isLoadingUser && (!user || user.role !== 'producer')) {
      // Save current form data to sessionStorage for restoration after login
      const currentEventData = {
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        eventType: eventData.eventType,
        isPrivate: eventData.isPrivate,
        isPaid: eventData.isPaid,
        tickets: eventData.tickets,
        services: eventData.services,
        selectedSuppliers: eventData.selectedSuppliers,
        pendingSubmission: true // Flag to indicate this should be auto-submitted after login
      };
      
      sessionStorage.setItem('createEventData', JSON.stringify(currentEventData));
      
      // Show message to user about needing to sign in
      toast({
        title: "Sign In Required",
        description: "Please sign in as a producer to create your event. Your details will be saved.",
        variant: "default"
      });
      
      // Redirect to producer login with return URL
      const returnUrl = encodeURIComponent('/create-event/step/3');
      navigate(`/producer-login?returnUrl=${returnUrl}`);
      return;
    }

    setIsCreating(true);
    
    try {
      if (isEditMode && eventId) {
        // For edit mode, let the parent handle the update logic
        // since it has the proper data transformation for the update API
        onCreateEvent();
      } else {
        // For create mode, use the original logic
        const transformedData = transformEventData();
        console.log('Transformed event data:', transformedData);
        
        const response = await apiService.createEvent(transformedData);
        
        if (response.success) {
          toast({
            title: t('createEvent.successTitle'),
            description: `${eventData.name} ${t('createEvent.successMessage')}`,
            variant: "default"
          });
          
          // Clear the saved data since event was created successfully
          sessionStorage.removeItem('createEventData');
          
          // Call the parent's onCreateEvent to handle navigation/cleanup
          onCreateEvent();
        } else {
          throw new Error(response.message || 'Failed to create event');
        }
      }
    } catch (error) {
      console.error('Error creating/updating event:', error);
      
      let errorMessage = t('createEvent.errorMessage');
      
      // Try to parse error message if it's a JSON string
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast({
        title: t('createEvent.errorTitle'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatEventType = (type: string) => {
    return t(`createEvent.eventTypes.${type.replace('-', '')}`) || type;
  };

  const getTotalTickets = () => {
    return eventData.tickets?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
  };

  const getTotalRevenue = () => {
    return eventData.tickets?.reduce((sum, ticket) => sum + (ticket.quantity * ticket.price), 0) || 0;
  };

  const getSelectedSuppliersCount = () => {
    const suppliers = eventData.selectedSuppliers || {};
    return Object.values(suppliers).reduce((total, serviceSuppliers) => {
      if (serviceSuppliers && typeof serviceSuppliers === 'object') {
        return total + Object.keys(serviceSuppliers).length;
      }
      return total;
    }, 0);
  };

  // Fetch supplier details from API
  useEffect(() => {
    const fetchSupplierDetails = async () => {
      if (!eventData.selectedSuppliers || Object.keys(eventData.selectedSuppliers).length === 0) {
        return;
      }

      setLoadingSuppliers(true);
      const details: { [key: string]: SupplierData } = {};

      try {
        // Get all unique supplier IDs
        const supplierIds = new Set<string>();
        Object.values(eventData.selectedSuppliers).forEach(serviceSuppliers => {
          if (serviceSuppliers && typeof serviceSuppliers === 'object') {
            Object.keys(serviceSuppliers).forEach(supplierId => {
              supplierIds.add(supplierId);
            });
          }
        });

        // Fetch details for each supplier
        const promises = Array.from(supplierIds).map(async (supplierId) => {
          try {
            const response = await apiService.getUserById(supplierId);
            if (response.success && response.data) {
              details[supplierId] = response.data;
            } else {
              // Set fallback data if no data in response
              details[supplierId] = {
                _id: supplierId,
                name: `Supplier ${supplierId.slice(-4)}`,
                email: 'unknown@example.com',
                supplierDetails: {
                  location: { city: 'Unknown' }
                }
              };
            }
          } catch (error) {
            console.error(`Error fetching supplier ${supplierId}:`, error);
            // Set fallback data for failed requests
            details[supplierId] = {
              _id: supplierId,
              name: `Supplier ${supplierId.slice(-4)}`,
              email: 'unknown@example.com',
              supplierDetails: {
                location: { city: 'Unknown' }
              }
            };
          }
        });

        await Promise.all(promises);
        setSupplierDetails(details);
      } catch (error) {
        console.error('Error fetching supplier details:', error);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSupplierDetails();
  }, [eventData.selectedSuppliers]);

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 text-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-1 sm:mb-2">{t('createEvent.step3.title')}</h2>
        <p className="text-sm sm:text-base text-muted-foreground px-2">{t('createEvent.step3.subtitle')}</p>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 pr-2 sm:pr-4">
        <div className="space-y-4 sm:space-y-6">
          {/* Event Overview */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('createEvent.step3.eventOverview')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground break-words">{eventData.name}</h3>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {formatEventType(eventData.eventType)}
                </Badge>
              </div>
              
              {eventData.description && (
                <p className="text-muted-foreground text-xs sm:text-sm break-words">{eventData.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{eventData.date ? format(new Date(eventData.date), 'PPP') : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span>{eventData.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm sm:col-span-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="break-words">{eventData.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm sm:col-span-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span>
                    {eventData.isPaid 
                      ? `${getTotalTickets()} ${t('createEvent.step3.maxAttendees')}`
                      : t('createEvent.step3.openEvent')
                    }
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {eventData.isPrivate && (
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <Lock className="h-2 w-2 sm:h-3 sm:w-3" />
                    {t('createEvent.step3.private')}
                  </Badge>
                )}
                {eventData.isPaid && (
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <DollarSign className="h-2 w-2 sm:h-3 sm:w-3" />
                    {t('createEvent.step3.paid')}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services & Suppliers */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('createEvent.step3.servicesSuppliers')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm">
                  <span className="font-medium">{eventData.services?.length || 0} {t('createEvent.step3.servicesSelected')}</span>
                  <span className="font-medium">{getSelectedSuppliersCount()} {t('createEvent.step3.suppliersSelected')}</span>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  {eventData.services?.map((service) => {
                    const IconComponent = serviceIcons[service] || Users;
                    const serviceSuppliers = eventData.selectedSuppliers?.[service] || {};
                    
                    return (
                      <div key={service} className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-xs sm:text-sm">{t(`${service}`)}</span>
                          <Badge variant="secondary" className="px-2 sm:px-3 py-1 text-xs ml-auto">
                            {Object.keys(serviceSuppliers).length} supplier{Object.keys(serviceSuppliers).length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        {Object.keys(serviceSuppliers).length > 0 && (
                          <div className="ml-6 sm:ml-8 space-y-2">
                            {loadingSuppliers ? (
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Loading supplier details...
                              </div>
                            ) : (
                              Object.keys(serviceSuppliers).map((supplierId) => {
                                const supplier = supplierDetails[supplierId];
                                const supplierName = supplier?.name || `Supplier ${supplierId.slice(-4)}`;
                                const supplierLocation = supplier?.supplierDetails?.location?.city || 'Unknown Location';
                                
                                return (
                                  <div key={supplierId} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                        <Users className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div>
                                        <div className="text-xs font-medium text-gray-900">{supplierName}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                          <MapPin className="w-2 h-2" />
                                          {supplierLocation}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {Array.isArray(serviceSuppliers[supplierId]) ? serviceSuppliers[supplierId].length : 0} service{Array.isArray(serviceSuppliers[supplierId]) && serviceSuppliers[supplierId].length !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets (if paid event) */}
          {eventData.isPaid && eventData.tickets && eventData.tickets.length > 0 && (
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('createEvent.step3.ticketing')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {eventData.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-2 sm:gap-0">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-sm sm:text-base block truncate">{ticket.name}</span>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {ticket.quantity} {t('createEvent.step3.tickets')} × ₪{ticket.price}
                        </p>
                      </div>
                      <span className="font-semibold text-base sm:text-lg text-right">₪{(ticket.quantity * ticket.price).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <Separator className="my-3 sm:my-4" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between font-semibold text-base sm:text-lg p-3 bg-primary/10 rounded-lg gap-2 sm:gap-0">
                    <span>{t('createEvent.step3.totalRevenue')}</span>
                    <span className="text-right">₪{getTotalRevenue().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t">
        <Button 
          variant="outline"
          onClick={onBack}
          className="px-4 sm:px-8 w-full sm:w-auto touch-manipulation select-none"
        >
          {t('common.back')}
        </Button>
        <Button 
          onClick={handleCreateEvent}
          disabled={isCreating}
          className="px-4 sm:px-8 w-full sm:w-auto touch-manipulation select-none"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
              <span className="text-sm sm:text-base">{t('creating')}</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-sm sm:text-base">{t('createEvent.step3.createEvent')}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step3_Summary;
