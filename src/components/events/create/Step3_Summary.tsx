import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, DollarSign, Lock, Camera, Video, UtensilsCrossed, Music, Palette, MapPinIcon, Shield, Car, Loader2, CheckCircle, Lightbulb, Volume2, Armchair, Home, Grid3X3, Building2, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
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
  bankDetails: {
  bankName: string;
  branch: string;
  accountNumber: string;
  accountHolderName: string;
};
  eventImage?: File | null;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
   
    location: string;
    eventType: string;
    isPrivate: boolean;
    eventPassword?: string;
    isPaid: boolean;
    tickets: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    services: string[];
    selectedSuppliers: { [service: string]: { [supplierId: string]: string[] } };
    selectedPackages?: { [serviceId: string]: { packageId: string; packageDetails: any } };
  };
  onBack: () => void;
  onCreateEvent: () => void;
  isEditMode?: boolean;
  eventId?: string;
}

const Step3_Summary: React.FC<Step3_SummaryProps> = ({ eventData, onBack, onCreateEvent, isEditMode = false, eventId }) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoadingUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [supplierDetails, setSupplierDetails] = useState<Record<string, SupplierData>>({});
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [isTicketingOpen, setIsTicketingOpen] = useState(false);
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
  const isRTL = i18n.language === 'he';

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
  console.log('Selected Packages:', eventData.selectedPackages);
  console.log('Bank Details:', eventData.bankDetails);
  
  // Create start and end dates from separate date/time fields
  // Handle both formats: YYYY-MM-DD, ISO string, and date objects
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.error('Invalid date:', date);
      return '';
    }
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  // Always extract YYYY-MM-DD from the date (whether it's ISO string or date object)
  const startDateStr = formatDate(eventData.startDate);
  const endDateStr = formatDate(eventData.endDate);

  console.log('Date Time Debug:', {
    rawStartDate: eventData.startDate,
    rawEndDate: eventData.endDate,
    startDateStr,
    endDateStr,
    startTime: eventData.startTime,
    endTime: eventData.endTime,
  });

  // Transform suppliers from nested object to backend expected format (nested services structure)
  const suppliers: Array<{
    services: Array<{
      serviceId: string;
      selectedPackageId?: string;
      packageDetails?: {
        name: string;
        description: string;
        price: number;
        features: string[];
        duration?: number;
      };
      requestedPrice?: number;
      notes?: string;
      priority?: 'low' | 'medium' | 'high';
    }>;
    supplierId: string;
  }> = [];

  console.log('Processing selectedSuppliers:', eventData.selectedSuppliers);

  // Create a map to group services/packages by supplier
  // NOTE: This works with both old (service-based) and new (package-based) structures
  // In the new structure, serviceId will be packageId, but the backend accepts both
  const supplierServicesMap = new Map<string, Array<{
    serviceId: string; // Will be packageId in new structure
    selectedPackageId?: string;
    packageDetails?: {
      name: string;
      description: string;
      price: number;
      features: string[];
      duration?: number;
    };
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
              // Check if this service has a selected package
              const packageInfo = eventData.selectedPackages?.[serviceId];
              
              const serviceEntry: {
                serviceId: string;
                selectedPackageId?: string;
                packageDetails?: {
                  name: string;
                  description: string;
                  price: number;
                  features: string[];
                  duration?: number;
                };
                requestedPrice?: number;
                notes?: string;
                priority: 'low' | 'medium' | 'high';
              } = {
                serviceId,
                priority: 'medium' as const,
                notes: `Selected for ${serviceCategory} service`,
              };

              // Add package information if available
              if (packageInfo && packageInfo.packageId && packageInfo.packageDetails) {
                serviceEntry.selectedPackageId = packageInfo.packageId;
                serviceEntry.packageDetails = packageInfo.packageDetails;
                serviceEntry.requestedPrice = packageInfo.packageDetails.price;
                
                console.log(`Package info added for service ${serviceId}:`, {
                  packageId: packageInfo.packageId,
                  packageDetails: packageInfo.packageDetails
                });
              }
              
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

  console.log('Final suppliers array (backend format with nested services and packages):', suppliers);

  // Calculate ticket info
  const totalTickets = eventData.tickets?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
  const totalRevenue = eventData.tickets?.reduce((sum, ticket) => sum + (ticket.quantity * ticket.price), 0) || 0;
  const minPrice = eventData.tickets && eventData.tickets.length > 0 ? Math.min(...eventData.tickets.map(t => t.price)) : 0;
  const maxPrice = eventData.tickets && eventData.tickets.length > 0 ? Math.max(...eventData.tickets.map(t => t.price)) : 0;

  // Extract city from location (assume format "Address, City" or just "City")
  const locationParts = eventData.location.split(',');
  const city = locationParts.length > 1 ? locationParts[locationParts.length - 1].trim() : eventData.location;
  const address = locationParts.length > 1 ? locationParts.slice(0, -1).join(',').trim() : eventData.location;

  // Transform tickets to backend format (simplified - backend will handle defaults)
  const transformedTickets = eventData.tickets && eventData.tickets.length > 0 ? eventData.tickets.map(ticket => ({
    title: ticket.name,
    description: `${ticket.name} ticket for ${eventData.name}`,
    type: ticket.name.toLowerCase().replace(/\s+/g, '-'),
    price: {
      amount: ticket.price,
      currency: 'ILS'
    },
    quantity: {
      total: ticket.quantity,
      available: ticket.quantity
    }
  })) : [];

  // Prepare bank details for backend
  // Only include bank details if at least one field is filled
  const bankDetails = eventData.bankDetails && (
    eventData.bankDetails.bankName?.trim() ||
    eventData.bankDetails.branch?.trim() ||
    eventData.bankDetails.accountNumber?.trim() ||
    eventData.bankDetails.accountHolderName?.trim()
  ) ? {
    bankName: eventData.bankDetails.bankName || '',
    branch: eventData.bankDetails.branch || '',
    accountNumber: eventData.bankDetails.accountNumber || '',
    accountHolderName: eventData.bankDetails.accountHolderName || ''
  } : undefined;

  console.log('Bank details to be sent:', bankDetails);

  const transformedData = {
    name: eventData.name,
    description: eventData.description || '',
    startDate: startDateStr,      // YYYY-MM-DD
    endDate: endDateStr,          // YYYY-MM-DD
    startTime: eventData.startTime, // HH:mm
    endTime: eventData.endTime,     // HH:mm
    location: {
      address: address,
      city: city
    },
    language: 'en' as const,
    category: eventData.eventType,
    requiredServices: eventData.services || [],
    suppliers: suppliers,
    status: 'draft' as const,
    isPublic: !eventData.isPrivate,
    // Include bank details if available
    ...(bankDetails && {
      bankDetails: bankDetails
    }),
    // Include password for private events (when isPublic is false)
    ...(eventData.isPrivate && eventData.eventPassword && {
      password: eventData.eventPassword
    }),
    // Include tickets array for backend to create ticket documents
    ...(transformedTickets.length > 0 && {
      tickets: transformedTickets
    }),
    // Include ticketInfo for event metadata
    ticketInfo: eventData.isPaid && totalTickets > 0 ? {
      availableTickets: totalTickets,
      soldTickets: 0,
      reservedTickets: 0,
      isFree: false,
      priceRange: {
        min: minPrice,
        max: maxPrice
      }
    } : {
      availableTickets: totalTickets || 0,
      soldTickets: 0,
      reservedTickets: 0,
      isFree: true,
      priceRange: {
        min: 0,
        max: 0
      }
    },
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
  console.log('Bank details included:', !!bankDetails);
  console.log('===================================');
  
  return transformedData;
};

  // Handle event creation or update
const handleCreateEvent = async () => {
  // Check if user is authenticated and is a producer
  if (!isLoadingUser && (!user || user.role !== 'producer')) {
    // Save current form data to sessionStorage for restoration after login
    console.log("1 event data -> ", eventData);
    
    const currentEventData = {
      name: eventData.name,
      description: eventData.description,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location,
      eventType: eventData.eventType,
      isPrivate: eventData.isPrivate,
      isPaid: eventData.isPaid,
      tickets: eventData.tickets,
      services: eventData.services,
      selectedSuppliers: eventData.selectedSuppliers,
      pendingSubmission: true, // Flag to indicate auto-submission after login
    };

    sessionStorage.setItem('createEventData', JSON.stringify(currentEventData));

    toast({
      title: "Sign In Required",
      description: "Please sign in as a producer to create your event. Your details will be saved.",
      variant: "default",
    });

    const returnUrl = encodeURIComponent('/create-event/step/4');
    navigate(`/producer-login?returnUrl=${returnUrl}`);
    return;
  }

  setIsCreating(true);

  try {
    if (isEditMode && eventId) {
      // Edit mode: let parent handle update logic
      onCreateEvent();
    } else {
      // Create mode
      const transformedData = transformEventData();
      console.log('Transformed event data:', transformedData);

      // ✅ Create FormData for multipart/form-data
      const formData = new FormData();

      console.log('Event image before upload:', eventData);

      // Append image file (if exists)
      if (eventData.eventImage) {
        if (eventData.eventImage instanceof File) {
          console.log('Attaching image file:', eventData.eventImage.name, 'size:', eventData.eventImage.size);
          formData.append('image', eventData.eventImage); // File object (from input)
        } else {
          console.warn('eventImage is not a File object:', eventData.eventImage);
        }
      }

      // ✅ Append the complete transformed data as JSON to match backend expectations
      console.log('Appending transformed data as JSON to FormData:');
      formData.append('data', JSON.stringify(transformedData));
      console.log('Appended data:', JSON.stringify(transformedData).substring(0, 100));

      // Log FormData entries for verification
      console.log('✅ FormData entries:');
      let entryCount = 0;
      for (let [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          console.log(`Entry ${entryCount + 1}: ${key} = ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
        } else {
          console.log(`Entry ${entryCount + 1}: ${key} = [File] ${value.name} (${value.size} bytes)`);
        }
        entryCount++;
      }
      console.log('Total FormData entries:', entryCount);

      console.log("Final FormData:", formData);

      // ✅ Send FormData to backend (Multer will handle it)
      const response = await apiService.createEvent(formData);

      if (response.success) {
        toast({
          title: t('createEvent.successTitle'),
          description: `${eventData.name} ${t('createEvent.successMessage')}`,
          variant: "default",
        });

        // Clear saved data
        sessionStorage.removeItem('createEventData');

        // Trigger navigation/cleanup
        onCreateEvent();
      } else {
        throw new Error(response.message || 'Failed to create event');
      }
    }
  } catch (error) {
    console.error('Error creating/updating event:', error);

    let errorMessage = t('createEvent.errorMessage');

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
      variant: "destructive",
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
      const details: Record<string, SupplierData> = {};

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
              <CardTitle className={`flex items-center gap-2 text-base sm:text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                <div className={`flex items-center gap-2 text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">
                    {eventData.startDate && eventData.endDate
                      ? (() => {
                          try {
                            const start = new Date(eventData.startDate);
                            const end = new Date(eventData.endDate);
                            return `${format(start, 'PPP')} - ${format(end, 'PPP')}`;
                          } catch (e) {
                            return `${eventData.startDate} - ${eventData.endDate}`;
                          }
                        })()
                      : eventData.startDate || ''
                    }
                  </span>
                </div>
                <div className={`flex items-center gap-2 text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span>
                    {eventData.startTime && eventData.endTime
                      ? `${eventData.startTime} - ${eventData.endTime}`
                      : eventData.startTime || ''
                    }
                  </span>
                </div>
                <div className={`flex items-center gap-2 text-xs sm:text-sm sm:col-span-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="break-words">{eventData.location}</span>
                </div>
                <div className={`flex items-center gap-2 text-xs sm:text-sm sm:col-span-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span>
                    {eventData.isPaid 
                      ? `${getTotalTickets()} ${t('createEvent.step3.maxAttendees')}`
                      : t('createEvent.step3.openEvent')
                    }
                  </span>
                </div>
              </div>

              <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {eventData.isPrivate && (
                  <Badge variant="outline" className={`flex items-center gap-1 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Lock className="h-2 w-2 sm:h-3 sm:w-3" />
                    {t('createEvent.step3.private')}
                  </Badge>
                )}
                {eventData.isPaid && (
                  <Badge variant="outline" className={`flex items-center gap-1 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
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
              <CardTitle className={`flex items-center gap-2 text-base sm:text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('createEvent.step3.servicesSuppliers')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                  <span className="font-medium">{eventData.services?.length || 0} {t('createEvent.step3.servicesSelected')}</span>
                  <span className="font-medium">{getSelectedSuppliersCount()} {t('createEvent.step3.suppliersSelected')}</span>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  {eventData.services?.map((service) => {
                    const IconComponent = serviceIcons[service] || Users;
                    const serviceSuppliers = eventData.selectedSuppliers?.[service] || {};
                    
                    return (
                      <div key={service} className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                        <div className={`flex items-center gap-2 sm:gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-xs sm:text-sm">{t(`${service}`)}</span>
                          <Badge variant="secondary" className={`px-2 sm:px-3 py-1 text-xs ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                            {Object.keys(serviceSuppliers).length} supplier{Object.keys(serviceSuppliers).length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        {Object.keys(serviceSuppliers).length > 0 && (
                          <div className={`space-y-2 ${isRTL ? 'mr-6 sm:mr-8' : 'ml-6 sm:ml-8'}`}>
                            {loadingSuppliers ? (
                              <div className={`text-xs text-muted-foreground flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Loading supplier details...
                              </div>
                            ) : (
                              Object.keys(serviceSuppliers).map((supplierId) => {
                                const supplier = supplierDetails[supplierId];
                                const supplierName = supplier?.name || `Supplier ${supplierId.slice(-4)}`;
                                const supplierLocation = supplier?.supplierDetails?.location?.city || 'Unknown Location';
                                
                                return (
                                  <div key={supplierId} className={`flex items-center justify-between p-2 bg-card rounded border border-border ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
                                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                        <div className="text-xs font-medium text-card-foreground">{supplierName}</div>
                                        <div className={`text-xs text-muted-foreground flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
            <Card className="overflow-hidden">
              <CardHeader
                className="pb-2 sm:pb-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-lg"
                onClick={() => setIsTicketingOpen(!isTicketingOpen)}
              >
                <CardTitle className={`flex items-center justify-between text-base sm:text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t('createEvent.step3.ticketing')}
                  </div>
                  {isTicketingOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </CardTitle>
              </CardHeader>
              {isTicketingOpen && (
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {eventData.tickets.map((ticket) => (
                      <div key={ticket.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-2 sm:gap-0 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-sm sm:text-base block truncate">{ticket.name}</span>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {ticket.quantity} {t('createEvent.step3.tickets')} × ₪{ticket.price}
                          </p>
                        </div>
                        <span className={`font-semibold text-base sm:text-lg ${isRTL ? 'text-left' : 'text-right'}`}>₪{(ticket.quantity * ticket.price).toFixed(2)}</span>
                      </div>
                    ))}

                    <Separator className="my-3 sm:my-4" />

                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between font-semibold text-base sm:text-lg p-3 bg-primary/10 rounded-lg gap-2 sm:gap-0 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                      <span>{t('createEvent.step3.totalRevenue')}</span>
                      <span className={`${isRTL ? 'text-left' : 'text-right'}`}>₪{getTotalRevenue().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Producer Banking Details */}
          {eventData.bankDetails && (
            <Card className="overflow-hidden">
              <CardHeader
                className="pb-2 sm:pb-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-lg"
                onClick={() => setIsBankDetailsOpen(!isBankDetailsOpen)}
              >
                <CardTitle className={`flex items-center justify-between text-base sm:text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t("createEvent.bankDetailsStep.info")}
                  </div>
                  {isBankDetailsOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </CardTitle>
              </CardHeader>
              {isBankDetailsOpen && (
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${isRTL ? 'text-right' : ''}`}>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium">{t("createEvent.bankDetailsStep.form.bankName.label")}</span>
                        </div>
                        <p className="text-sm sm:text-base text-foreground bg-muted/50 p-2 rounded-md">
                          {eventData.bankDetails.bankName || 'Not provided'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium"> {t("createEvent.bankDetailsStep.form.branch.label")}</span>
                        </div>
                        <p className="text-sm sm:text-base text-foreground bg-muted/50 p-2 rounded-md">
                          {eventData.bankDetails.branch || 'Not provided'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium"> {t("createEvent.bankDetailsStep.form.accountNumber.label")}</span>
                        </div>
                        <p className="text-sm sm:text-base text-foreground bg-muted/50 p-2 rounded-md font-mono">
                          {eventData.bankDetails.accountNumber || 'Not provided'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium">{t("createEvent.bankDetailsStep.form.accountHolderName.label")}</span>
                        </div>
                        <p className="text-sm sm:text-base text-foreground bg-muted/50 p-2 rounded-md">
                          {eventData.bankDetails.accountHolderName || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t nav-wrapper-dark">
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
