import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, XCircle, Users, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import Step2_Details from '@/components/events/create/Step2_Details_Refactored';
import { EventData, Ticket } from '@/components/events/create/types';
import apiService, { type Event as ApiEvent } from '@/services/api';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ApiEvent | null;
  onSave: (event: ApiEvent) => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Main tab state
  const [activeTab, setActiveTab] = useState('event-detail');
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [services, setServices] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<{ [service: string]: { [supplierId: string]: string[] } }>({});
  const [currentTab, setCurrentTab] = useState('services');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
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
  }>>([]);
  const [specialRequests, setSpecialRequests] = useState('');

  // Create eventData object with stable reference
  const eventDataRef = useRef<EventData>({} as EventData);
  eventDataRef.current = {
    name, description, date, time, location: eventLocation, eventType,
    isPrivate, eventPassword, isPaid, tickets, services,
    selectedSuppliers, specialRequests, currentTab
  };

  // Load event data when modal opens
  useEffect(() => {
    const loadEventData = async () => {
      if (!isOpen || !event) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Pre-populate form fields
        setName(event.name || '');
        setDescription(event.description || '');
        
        // Handle date formatting
        if (event.startDate) {
          const startDate = new Date(event.startDate);
          setDate(startDate.toISOString().split('T')[0]);
          setTime(startDate.toTimeString().slice(0, 5));
        }
        
        // Handle location
        if (typeof event.location === 'string') {
          setEventLocation(event.location);
        } else if (event.location && event.location.address) {
          setEventLocation(`${event.location.address}, ${event.location.city}`);
        }
        
        setEventType(event.category || '');
        setIsPrivate(!event.isPublic);
        setEventPassword('');
        
        // Determine if event is paid
        const hasPaidTickets = event.ticketInfo?.priceRange?.min && event.ticketInfo.priceRange.min > 0;
        setIsPaid(hasPaidTickets || false);
        
        // Handle tickets
        const formattedTickets = event.ticketInfo ? [{
          id: 'general',
          name: 'General Admission',
          quantity: event.ticketInfo.availableTickets || 0,
          price: event.ticketInfo.priceRange?.min || 0
        }] : [];
        setTickets(formattedTickets);
        
        setServices(event.requiredServices || []);
        
        // Handle suppliers
        const formattedSuppliers: { [service: string]: { [supplierId: string]: string[] } } = {};
        if (event.suppliers && Array.isArray(event.suppliers) && event.suppliers.length > 0) {
          event.suppliers.forEach((supplier) => {
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
        setSpecialRequests('');

      } catch (err) {
        console.error('Error loading event data:', err);
        setError('Failed to load event data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [isOpen, event]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('event-detail');
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = useCallback((field: string, value: unknown) => {
    switch (field) {
      case 'name': setName(value as string); break;
      case 'description': setDescription(value as string); break;
      case 'date': setDate(value as string); break;
      case 'time': setTime(value as string); break;
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

  const handleUpdateEvent = useCallback(async () => {
    if (!event?._id) {
      toast({
        title: "Update Failed",
        description: "Event ID is missing. Cannot update event.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create start and end dates
      const eventDate = new Date(eventDataRef.current.date);
      const [hours, minutes] = eventDataRef.current.time.split(':').map(Number);
      
      const startDate = new Date(eventDate);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 4);

      // Transform suppliers
      const suppliers: Array<{
        supplierId: string;
        services: Array<{
          serviceId: string;
          requestedPrice?: number;
          notes?: string;
          priority?: 'low' | 'medium' | 'high';
        }>;
      }> = [];

      const supplierServicesMap = new Map<string, Array<{
        serviceId: string;
        requestedPrice?: number;
        notes?: string;
        priority?: 'low' | 'medium' | 'high';
      }>>();

      if (eventDataRef.current.selectedSuppliers && typeof eventDataRef.current.selectedSuppliers === 'object') {
        Object.entries(eventDataRef.current.selectedSuppliers).forEach(([serviceCategory, serviceSuppliers]) => {
          if (serviceSuppliers && typeof serviceSuppliers === 'object') {
            Object.entries(serviceSuppliers).forEach(([supplierId, serviceIds]) => {
              if (Array.isArray(serviceIds)) {
                serviceIds.forEach((serviceId) => {
                  const serviceEntry = {
                    serviceId,
                    priority: 'medium' as const,
                    notes: `Selected for ${serviceCategory} service`,
                    requestedPrice: undefined
                  };
                  
                  if (!supplierServicesMap.has(supplierId)) {
                    supplierServicesMap.set(supplierId, []);
                  }
                  supplierServicesMap.get(supplierId)!.push(serviceEntry);
                });
              }
            });
          }
        });
      }

      supplierServicesMap.forEach((services, supplierId) => {
        suppliers.push({ supplierId, services });
      });

      // Valid service categories
      const validServiceCategories = [
        'photography', 'videography', 'catering', 'music', 
        'decoration', 'transportation', 'security', 'other'
      ];

      const serviceMapping: { [key: string]: string } = {
        'dj': 'music', 'band': 'music', 'sound': 'music',
        'flowers': 'decoration', 'venue': 'other', 'cake': 'catering',
        'entertainment': 'other', 'transport': 'transportation',
        'car': 'transportation', 'bus': 'transportation'
      };

      const mappedServices = eventDataRef.current.services
        .map(service => {
          const lowerService = service.toLowerCase();
          if (validServiceCategories.includes(lowerService)) {
            return lowerService;
          }
          return serviceMapping[lowerService] || 'other';
        })
        .filter((service, index, array) => array.indexOf(service) === index);

      // Calculate ticket info
      const totalTickets = eventDataRef.current.tickets?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
      const totalRevenue = eventDataRef.current.tickets?.reduce((sum, ticket) => sum + (ticket.quantity * ticket.price), 0) || 0;
      const minPrice = eventDataRef.current.tickets && eventDataRef.current.tickets.length > 0 ? Math.min(...eventDataRef.current.tickets.map(t => t.price)) : 0;
      const maxPrice = eventDataRef.current.tickets && eventDataRef.current.tickets.length > 0 ? Math.max(...eventDataRef.current.tickets.map(t => t.price)) : 0;

      // Extract location
      const locationParts = eventDataRef.current.location.split(',');
      const city = locationParts.length > 1 ? locationParts[locationParts.length - 1].trim() : eventDataRef.current.location;
      const address = locationParts.length > 1 ? locationParts.slice(0, -1).join(',').trim() : eventDataRef.current.location;

      const updateData = {
        name: eventDataRef.current.name,
        description: eventDataRef.current.description || '',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: { address, city },
        language: 'en' as const,
        category: eventDataRef.current.eventType || 'other',
        requiredServices: mappedServices,
        suppliers: suppliers,
        status: event.status || 'draft' as const,
        isPublic: !eventDataRef.current.isPrivate,
        ...(eventDataRef.current.isPaid && totalTickets > 0 && {
          ticketInfo: {
            availableTickets: totalTickets,
            soldTickets: 0,
            reservedTickets: 0,
            priceRange: { min: minPrice, max: maxPrice }
          }
        }),
        ...(eventDataRef.current.isPaid && totalRevenue > 0 && {
          budget: { total: totalRevenue, spent: 0 }
        }),
        tags: eventDataRef.current.services || [],
      };

      const response = await apiService.updateEvent(event._id, updateData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update event');
      }

      toast({
        title: "Event Updated Successfully!",
        description: "Your event has been updated and changes are now live.",
      });

      onSave(response.data as ApiEvent);
      onClose();
      
    } catch (error) {
      console.error('Error updating event:', error);
      
      let errorMessage = 'Failed to update event. Please try again.';
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [event, toast, onSave, onClose]);

  const handleClose = () => {
    setActiveTab('event-detail');
    setError(null);
    onClose();
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            Edit Event: {event.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="event-detail">Event Detail</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
            </TabsList>
            
            {/* Event Detail Tab */}
            <TabsContent value="event-detail" className="flex-1 overflow-y-auto mt-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">{error}</p>
                  </CardContent>
                </Card>
              ) : (
                <Step2_Details
                  eventData={eventDataRef.current}
                  onUpdate={handleInputChange}
                  onNext={() => {}} // No next step needed
                  onBack={() => {}} // No back step needed
                  isEditMode={true}
                />
              )}
            </TabsContent>

            {/* Suppliers Tab */}
            <TabsContent value="suppliers" className="flex-1 overflow-y-auto mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Event Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                  {event.suppliers && event.suppliers.length > 0 ? (
                    <div className="space-y-3">
                      {event.suppliers.map((supplier, index) => {
                        const supplierId = typeof supplier.supplierId === 'string' 
                          ? supplier.supplierId 
                          : supplier.supplierId?._id;
                        const supplierName = typeof supplier.supplierId === 'object' && supplier.supplierId?.name
                          ? supplier.supplierId.name
                          : `Supplier ${index + 1}`;
                        
                        return (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback>
                                      {supplierName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-semibold">{supplierName}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Status: <Badge variant={supplier.status === 'approved' ? 'default' : 'secondary'}>
                                        {supplier.status || 'pending'}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Chat
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No suppliers invited yet</p>
                      <p className="text-sm mt-2">Go to Event Detail tab to invite suppliers</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendees Tab */}
            <TabsContent value="attendees" className="flex-1 overflow-y-auto mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Event Attendees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Attendee management coming soon</p>
                    <p className="text-sm mt-2">
                      View and manage event attendees, ticket holders, and check-in status
                    </p>
                  </div>
                  
                  {/* Ticket Summary */}
                  {event.ticketInfo && (
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{event.ticketInfo.availableTickets || 0}</p>
                          <p className="text-sm text-muted-foreground">Available</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{event.ticketInfo.soldTickets || 0}</p>
                          <p className="text-sm text-muted-foreground">Sold</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{event.ticketInfo.reservedTickets || 0}</p>
                          <p className="text-sm text-muted-foreground">Reserved</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {activeTab === 'event-detail' && (
              <Button 
                onClick={handleUpdateEvent} 
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Event'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
