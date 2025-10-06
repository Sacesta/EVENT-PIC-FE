import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, XCircle, Users, MessageCircle, Plus, Package, CheckCircle, Star, MapPin, Clock, Search, Mail, Phone, Calendar, Ticket as TicketIcon, UserCheck, Link2, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
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
  const [selectedPackages, setSelectedPackages] = useState<{ [serviceId: string]: { packageId: string; packageDetails: any } }>({});
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Supplier browsing state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSupplierBrowser, setShowSupplierBrowser] = useState(false);
  const [availableSuppliers, setAvailableSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [newSelectedSuppliers, setNewSelectedSuppliers] = useState<{ [supplierId: string]: string }>({});
  const [newSelectedPackages, setNewSelectedPackages] = useState<{ [serviceId: string]: string }>({});

  // Attendees state
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [attendeesError, setAttendeesError] = useState<string | null>(null);
  const [attendeesPagination, setAttendeesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAttendees: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [attendeesStatistics, setAttendeesStatistics] = useState<any>(null);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState('all');
  
  // Copy link state
  const [linkCopied, setLinkCopied] = useState(false);

  // Create eventData object with stable reference
  const eventDataRef = useRef<EventData>({} as EventData);
  eventDataRef.current = {
    name, description, date, time, location: eventLocation, eventType,
    isPrivate, eventPassword, isPaid, tickets, services,
    selectedSuppliers, selectedPackages, specialRequests, currentTab
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
        
        // Handle tickets - use actual tickets array from API if available
        let formattedTickets: Array<{ id: string; name: string; quantity: number; price: number }> = [];
        
        if (event.tickets && Array.isArray(event.tickets) && event.tickets.length > 0) {
          // Use actual tickets from the tickets array
          formattedTickets = event.tickets.map((ticket: any) => ({
            id: ticket._id || ticket.id || `ticket-${Math.random()}`,
            name: ticket.title || ticket.name || 'General Admission',
            quantity: ticket.quantity?.total || ticket.quantity?.available || 0,
            price: ticket.price?.amount || ticket.price || 0
          }));
        } else if (event.ticketInfo) {
          // Fallback to ticketInfo if no tickets array
          formattedTickets = [{
            id: 'general',
            name: 'General Admission',
            quantity: event.ticketInfo.availableTickets || 0,
            price: event.ticketInfo.priceRange?.min || 0
          }];
        }
        
        setTickets(formattedTickets);
        
        setServices(event.requiredServices || []);
        
        // Handle suppliers and their packages
        const formattedSuppliers: { [service: string]: { [supplierId: string]: string[] } } = {};
        const formattedPackages: { [serviceId: string]: { packageId: string; packageDetails: any } } = {};
        
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
              
              // Extract package information if available
              const selectedPackageId = (supplier as any).selectedPackageId;
              const packageDetails = (supplier as any).packageDetails;
              
              if (selectedPackageId && packageDetails) {
                formattedPackages[serviceId] = {
                  packageId: selectedPackageId,
                  packageDetails: packageDetails
                };
              }
            }
          });
        }
        
        setSelectedSuppliers(formattedSuppliers);
        setSelectedPackages(formattedPackages);
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

  // Fetch attendees when attendees tab is active
  useEffect(() => {
    if (activeTab === 'attendees' && event?._id) {
      fetchAttendees();
    }
  }, [activeTab, event?._id, attendeesPagination.currentPage, attendeeSearch, attendeeStatusFilter]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('event-detail');
      setError(null);
      setAttendees([]);
      setAttendeeSearch('');
      setAttendeeStatusFilter('all');
      setAttendeesPagination({
        currentPage: 1,
        totalPages: 1,
        totalAttendees: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    }
  }, [isOpen]);

  // Fetch attendees function
  const fetchAttendees = useCallback(async () => {
    if (!event?._id) return;

    try {
      setLoadingAttendees(true);
      setAttendeesError(null);

      const params: any = {
        page: attendeesPagination.currentPage,
        limit: 20
      };

      if (attendeeSearch.trim()) {
        params.search = attendeeSearch.trim();
      }

      if (attendeeStatusFilter && attendeeStatusFilter !== 'all') {
        params.status = attendeeStatusFilter;
      }

      const response = await apiService.getEventAttendees(event._id, params);

      if (response.success) {
        setAttendees(response.data || []);
        setAttendeesPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalAttendees: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
        setAttendeesStatistics(response.statistics || null);
      } else {
        setAttendeesError('Failed to load attendees');
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
      setAttendeesError('Failed to load attendees. Please try again.');
    } finally {
      setLoadingAttendees(false);
    }
  }, [event?._id, attendeesPagination.currentPage, attendeeSearch, attendeeStatusFilter]);

  const handleAttendeePageChange = (newPage: number) => {
    setAttendeesPagination(prev => ({ ...prev, currentPage: newPage }));
  };

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

      // Transform suppliers WITH PACKAGE DETAILS
      const suppliers: Array<{
        supplierId: string;
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
      }> = [];

      const supplierServicesMap = new Map<string, Array<{
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
      }>>();

      if (eventDataRef.current.selectedSuppliers && typeof eventDataRef.current.selectedSuppliers === 'object') {
        Object.entries(eventDataRef.current.selectedSuppliers).forEach(([serviceCategory, serviceSuppliers]) => {
          if (serviceSuppliers && typeof serviceSuppliers === 'object') {
            Object.entries(serviceSuppliers).forEach(([supplierId, serviceIds]) => {
              if (Array.isArray(serviceIds)) {
                serviceIds.forEach((serviceId) => {
                  // Check if this service has a selected package
                  const packageInfo = eventDataRef.current.selectedPackages?.[serviceId];
                  
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
                  }
                  
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

      // Calculate ticket info - ensure prices are numbers
      const totalTickets = eventDataRef.current.tickets?.reduce((sum, ticket) => sum + Number(ticket.quantity || 0), 0) || 0;
      const totalRevenue = eventDataRef.current.tickets?.reduce((sum, ticket) => sum + (Number(ticket.quantity || 0) * Number(ticket.price || 0)), 0) || 0;
      const minPrice = eventDataRef.current.tickets && eventDataRef.current.tickets.length > 0 
        ? Math.min(...eventDataRef.current.tickets.map(t => Number(t.price || 0))) 
        : 0;
      const maxPrice = eventDataRef.current.tickets && eventDataRef.current.tickets.length > 0 
        ? Math.max(...eventDataRef.current.tickets.map(t => Number(t.price || 0))) 
        : 0;

      // Extract location
      const locationParts = eventDataRef.current.location.split(',');
      const city = locationParts.length > 1 ? locationParts[locationParts.length - 1].trim() : eventDataRef.current.location;
      const address = locationParts.length > 1 ? locationParts.slice(0, -1).join(',').trim() : eventDataRef.current.location;

      // Determine if event is free or paid
      const isFreeEvent = !eventDataRef.current.isPaid || minPrice === 0;

      // Transform tickets to backend format (same as create event)
      const transformedTickets = eventDataRef.current.tickets && eventDataRef.current.tickets.length > 0 
        ? eventDataRef.current.tickets.map(ticket => ({
            title: ticket.name,
            description: `${ticket.name} ticket for ${eventDataRef.current.name}`,
            type: ticket.name.toLowerCase().replace(/\s+/g, '-'),
            price: {
              amount: ticket.price,
              currency: 'ILS'
            },
            quantity: {
              total: ticket.quantity,
              available: ticket.quantity
            }
          }))
        : [];

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
        // Include tickets array for backend to update/create ticket documents
        ...(transformedTickets.length > 0 && {
          tickets: transformedTickets
        }),
        // Always include ticketInfo for both free and paid events
        ...(totalTickets > 0 && {
          ticketInfo: {
            availableTickets: totalTickets,
            soldTickets: event.ticketInfo?.soldTickets || 0,
            reservedTickets: event.ticketInfo?.reservedTickets || 0,
            priceRange: { min: minPrice, max: maxPrice },
            isFree: isFreeEvent
          }
        }),
        // Only include budget for paid events with revenue
        ...(eventDataRef.current.isPaid && totalRevenue > 0 && {
          budget: { 
            total: totalRevenue, 
            spent: event.budget?.spent || 0,
            allocated: event.budget?.allocated || {}
          }
        }),
        tags: eventDataRef.current.services || [],
      };

      const response = await apiService.updateEvent(event._id, updateData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update event');
      }

      // Refetch the updated event to get the latest data from the server
      const refreshedEvent = await apiService.getEvent(event._id);
      
      if (refreshedEvent.success && refreshedEvent.data) {
        toast({
          title: "Event Updated Successfully!",
          description: "Your event has been updated and changes are now live.",
        });

        // Pass the fresh data to parent component
        onSave(refreshedEvent.data as ApiEvent);
        
        // Close modal after successful refresh
        onClose();
      } else {
        // Fallback to response data if refetch fails
        toast({
          title: "Event Updated Successfully!",
          description: "Your event has been updated and changes are now live.",
        });
        
        onSave(response.data as ApiEvent);
        onClose();
      }
      
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

  // Fetch suppliers for selected category
  const fetchSuppliersForCategory = useCallback(async () => {
    if (!selectedCategory) return;
    
    setLoadingSuppliers(true);
    try {
      const response = await apiService.getServicesWithSuppliers({
        category: selectedCategory,
        limit: 50,
        page: 1
      });
      
      if (response.success && response.data) {
        setAvailableSuppliers(response.data as any[]);
        setShowSupplierBrowser(true);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingSuppliers(false);
    }
  }, [selectedCategory, toast]);

  // Handle supplier selection in browser
  const handleSupplierToggle = (serviceId: string, supplierId: string) => {
    setNewSelectedSuppliers(prev => {
      const updated = { ...prev };
      if (updated[supplierId] === serviceId) {
        delete updated[supplierId];
        // Also remove package selection
        setNewSelectedPackages(p => {
          const updatedPkg = { ...p };
          delete updatedPkg[serviceId];
          return updatedPkg;
        });
      } else {
        updated[supplierId] = serviceId;
      }
      return updated;
    });
  };

  // Handle package selection in browser
  const handlePackageToggle = (serviceId: string, packageId: string) => {
    setNewSelectedPackages(prev => {
      const updated = { ...prev };
      if (updated[serviceId] === packageId) {
        delete updated[serviceId];
      } else {
        updated[serviceId] = packageId;
      }
      return updated;
    });
  };

  // Add selected suppliers to event
  const handleAddSuppliers = async () => {
    if (!event?._id) return;
    
    try {
      setLoading(true);
      
      // Transform new selections
      const updatedSuppliers = { ...selectedSuppliers };
      
      Object.entries(newSelectedSuppliers).forEach(([supplierId, serviceId]) => {
        if (!updatedSuppliers[selectedCategory]) {
          updatedSuppliers[selectedCategory] = {};
        }
        if (!updatedSuppliers[selectedCategory][supplierId]) {
          updatedSuppliers[selectedCategory][supplierId] = [];
        }
        if (!updatedSuppliers[selectedCategory][supplierId].includes(serviceId)) {
          updatedSuppliers[selectedCategory][supplierId].push(serviceId);
        }
      });
      
      // Build suppliers payload with package details
      const suppliers: Array<{
        supplierId: string;
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
      }> = [];
      
      const supplierServicesMap = new Map<string, Array<{
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
      }>>();
      
      Object.entries(updatedSuppliers).forEach(([categoryKey, serviceSuppliers]) => {
        if (serviceSuppliers && typeof serviceSuppliers === 'object') {
          Object.entries(serviceSuppliers).forEach(([supplierId, serviceIds]) => {
            if (Array.isArray(serviceIds)) {
              serviceIds.forEach((serviceId) => {
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
                  notes: `Selected for ${selectedCategory} service`
                };
                
                // Add package details if selected
                const packageId = newSelectedPackages[serviceId];
                if (packageId) {
                  const service = availableSuppliers.find(s => s.serviceId === serviceId);
                  const pkg = service?.packages?.find((p: any) => p._id === packageId);
                  if (pkg) {
                    serviceEntry.selectedPackageId = pkg._id;
                    serviceEntry.packageDetails = {
                      name: pkg.name,
                      description: pkg.description || '',
                      price: pkg.price,
                      features: pkg.features || [],
                      duration: pkg.duration
                    };
                    serviceEntry.requestedPrice = pkg.price;
                  }
                }
                
                if (!supplierServicesMap.has(supplierId)) {
                  supplierServicesMap.set(supplierId, []);
                }
                supplierServicesMap.get(supplierId)!.push(serviceEntry);
              });
            }
          });
        }
      });
      
      supplierServicesMap.forEach((services, supplierId) => {
        suppliers.push({ supplierId, services });
      });
      
      console.log('=== ADDING SUPPLIERS WITH PACKAGES ===');
      console.log('Suppliers payload:', suppliers);
      
      // ✅ Send ONLY the suppliers array, not the entire event
      const response = await apiService.updateEvent(event._id, { suppliers });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to add suppliers');
      }
      
      toast({
        title: "Suppliers Added!",
        description: "New suppliers have been added to your event.",
      });
      
      // Refetch the event data to get updated supplier information with packages
      try {
        const refreshedEvent = await apiService.getEvent(event._id);
        if (refreshedEvent.success && refreshedEvent.data) {
          onSave(refreshedEvent.data as ApiEvent);
        } else {
          // Fallback to response data if refetch fails
          onSave(response.data as ApiEvent);
        }
      } catch (error) {
        console.error('Error refetching event:', error);
        // Fallback to response data if refetch fails
        onSave(response.data as ApiEvent);
      }
      
      // Update local state
      setSelectedSuppliers(updatedSuppliers);
      
      // Add package selections to local state
      const updatedPackages = { ...selectedPackages };
      Object.entries(newSelectedPackages).forEach(([serviceId, packageId]) => {
        const service = availableSuppliers.find(s => s.serviceId === serviceId);
        const pkg = service?.packages?.find((p: any) => p._id === packageId);
        if (pkg) {
          updatedPackages[serviceId] = {
            packageId,
            packageDetails: {
              name: pkg.name,
              description: pkg.description || '',
              price: pkg.price,
              features: pkg.features || [],
              duration: pkg.duration
            }
          };
        }
      });
      setSelectedPackages(updatedPackages);
      
      // Reset browser state
      setShowSupplierBrowser(false);
      setNewSelectedSuppliers({});
      setNewSelectedPackages({});
      setSelectedCategory('');
      
    } catch (error) {
      console.error('Error adding suppliers:', error);
      toast({
        title: "Failed to Add Suppliers",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!event?._id) return;
    
    const eventUrl = `${window.location.origin}/event/${event._id}`;
    navigator.clipboard.writeText(eventUrl).then(() => {
      setLinkCopied(true);
      toast({
        title: "Link Copied!",
        description: "Event invite link has been copied to clipboard",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive"
      });
    });
  };

  const handleClose = () => {
    setActiveTab('event-detail');
    setError(null);
    setShowSupplierBrowser(false);
    setSelectedCategory('');
    setNewSelectedSuppliers({});
    setNewSelectedPackages({});
    setLinkCopied(false);
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
                <>
                  {/* Invite Share Link Section - Only for Private Events */}
                  {!event.isPublic && (
                    <Card className="mb-4 border-primary/20 bg-primary/5">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <Link2 className="w-5 h-5 text-primary" />
                          Invite Share Link
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-background border rounded-lg px-4 py-3 text-sm text-muted-foreground overflow-hidden">
                            <span className="truncate block">
                              {`${window.location.origin}/event/${event._id}`}
                            </span>
                          </div>
                          <Button
                            variant={linkCopied ? "default" : "outline"}
                            onClick={handleCopyInviteLink}
                            className="px-6"
                          >
                            {linkCopied ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Link
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Share this link with invitees to allow them to view and register for your private event
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Step2_Details
                    eventData={eventDataRef.current}
                    onUpdate={handleInputChange}
                    onNext={() => {}} // No next step needed
                    onBack={() => {}} // No back step needed
                    isEditMode={true}
                  />
                </>
              )}
            </TabsContent>

            {/* Suppliers Tab */}
            <TabsContent value="suppliers" className="flex-1 overflow-y-auto mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Event Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add New Supplier Section */}
                  {!showSupplierBrowser ? (
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add More Suppliers
                      </h3>
                      <div className="flex gap-2">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select service category..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="photography">Photography</SelectItem>
                            <SelectItem value="videography">Videography</SelectItem>
                            <SelectItem value="catering">Catering</SelectItem>
                            <SelectItem value="music">Music</SelectItem>
                            <SelectItem value="decoration">Decoration</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="lighting">Lighting</SelectItem>
                            <SelectItem value="sound">Sound</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="tents">Tents</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={fetchSuppliersForCategory}
                          disabled={!selectedCategory || loadingSuppliers}
                        >
                          {loadingSuppliers ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Users className="w-4 h-4 mr-2" />
                              Browse Suppliers
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Browse {selectedCategory} Suppliers
                        </h3>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setShowSupplierBrowser(false);
                              setNewSelectedSuppliers({});
                              setNewSelectedPackages({});
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleAddSuppliers}
                            disabled={Object.keys(newSelectedSuppliers).length === 0}
                          >
                            Add Selected ({Object.keys(newSelectedSuppliers).length})
                          </Button>
                        </div>
                      </div>
                      
                      {/* Compact Supplier Cards */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availableSuppliers.map((service) => {
                          const isSelected = newSelectedSuppliers[service.supplier.supplierId] === service.serviceId;
                          const selectedPkg = newSelectedPackages[service.serviceId];
                          
                          // Check if this service already has a package selected in the event
                          const existingPackageId = selectedPackages[service.serviceId]?.packageId;
                          
                          return (
                            <Card 
                              key={service.serviceId}
                              className={cn(
                                "transition-all",
                                isSelected ? "border-primary bg-primary/5" : ""
                              )}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start gap-2">
                                  {/* Checkbox */}
                                  <div 
                                    // className={cn(
                                    //   "w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer mt-1",
                                    //   isSelected ? "bg-primary border-primary" : "border-border"
                                    // )}
                                    onClick={() => handleSupplierToggle(service.serviceId, service.supplier.supplierId)}
                                  >
                                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                  </div>
                                  
                                  {/* Supplier Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-sm truncate">{service.title}</h4>
                                      {service.supplier.isVerified && (
                                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                      <span className="truncate">{service.supplier.name}</span>
                                      <span>•</span>
                                      <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }, (_, i) => (
                                          <Star
                                            key={i}
                                            className={cn(
                                              "w-2.5 h-2.5",
                                              i < Math.floor(service.rating.average)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground/30"
                                            )}
                                          />
                                        ))}
                                        <span className="ml-1">{service.rating.average.toFixed(1)}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-xs">
                                      <MapPin className="w-3 h-3" />
                                      <span>{service.location?.city}</span>
                                      <span>•</span>
                                      <span className="font-semibold text-primary">₪{service.price.amount}</span>
                                    </div>
                                    
                                    {/* Packages */}
                                    {service.packages && service.packages.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {service.packages.map((pkg: any) => {
                                          // Check if this package is already selected in the event
                                          const isAlreadySelected = existingPackageId === pkg._id;
                                          const isCurrentlySelected = selectedPkg === pkg._id;
                                          
                                          return (
                                            <div
                                              key={pkg._id}
                                              className={cn(
                                                "flex items-center justify-between p-2 rounded border text-xs",
                                                isAlreadySelected 
                                                  ? "border-green-500 bg-green-50 opacity-60 cursor-not-allowed"
                                                  : isCurrentlySelected
                                                    ? "border-primary bg-primary/10 cursor-pointer"
                                                    : "border-border hover:border-primary/50 cursor-pointer"
                                              )}
                                              onClick={() => {
                                                if (isAlreadySelected) return; // Don't allow clicking already selected packages
                                                if (!isSelected) {
                                                  handleSupplierToggle(service.serviceId, service.supplier.supplierId);
                                                }
                                                handlePackageToggle(service.serviceId, pkg._id);
                                              }}
                                            >
                                              <div className="flex-1">
                                                <div className="flex items-center gap-1">
                                                  <span className={cn(
                                                    "font-medium capitalize",
                                                    isAlreadySelected && "text-muted-foreground"
                                                  )}>
                                                    {pkg.name}
                                                  </span>
                                                  {pkg.isPopular && <span className="text-orange-500">🔥</span>}
                                                  {isAlreadySelected && (
                                                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300 ml-1">
                                                      Already Selected
                                                    </Badge>
                                                  )}
                                                </div>
                                                {pkg.duration && (
                                                  <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span>{pkg.duration}h</span>
                                                  </div>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className={cn(
                                                  "font-bold",
                                                  isAlreadySelected ? "text-muted-foreground" : "text-primary"
                                                )}>
                                                  ₪{pkg.price}
                                                </span>
                                                <div className={cn(
                                                  "w-4 h-4 rounded border-2 flex items-center justify-center",
                                                  isAlreadySelected
                                                    ? "bg-green-500 border-green-500"
                                                    : isCurrentlySelected
                                                      ? "bg-primary border-primary"
                                                      : "border-border"
                                                )}>
                                                  {(isAlreadySelected || isCurrentlySelected) && (
                                                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Existing Suppliers List */}
                  {!showSupplierBrowser && (
                    <>
                      <div className="mb-4">
                        <h3 className="font-semibold mb-3">Current Suppliers</h3>
                      </div>
                  
                      {event.suppliers && event.suppliers.length > 0 ? (
                        <div className="space-y-3">
                      {event.suppliers.map((supplier, index) => {
                        const supplierId = typeof supplier.supplierId === 'string' 
                          ? supplier.supplierId 
                          : supplier.supplierId?._id;
                        const supplierName = typeof supplier.supplierId === 'object' && supplier.supplierId?.name
                          ? supplier.supplierId.name
                          : `Supplier ${index + 1}`;
                        
                        // Get service details - with proper type checking
                        const serviceData = supplier.serviceId && typeof supplier.serviceId === 'object' 
                          ? supplier.serviceId as any 
                          : null;
                        const serviceName = serviceData?.title || 'Service';
                        
                        // Extract package details from serviceId.packages array using selectedPackageId
                        const selectedPackageId = (supplier as any).selectedPackageId;
                        let packageDetails = (supplier as any).packageDetails; // Check direct packageDetails first
                        
                        // If no direct packageDetails, try to find it in serviceId.packages array
                        if ((!packageDetails || (!packageDetails.name && !packageDetails.price)) && selectedPackageId && serviceData?.packages && Array.isArray(serviceData.packages)) {
                          const foundPackage = serviceData.packages.find((pkg: any) => 
                            pkg._id === selectedPackageId || pkg.id === selectedPackageId
                          );
                          
                          if (foundPackage) {
                            packageDetails = {
                              name: foundPackage.name,
                              description: foundPackage.description,
                              price: foundPackage.price,
                              features: foundPackage.features || [],
                              duration: foundPackage.duration,
                              isPopular: foundPackage.isPopular
                            };
                          }
                        }
                        
                        const hasPackage = packageDetails && (packageDetails.name || packageDetails.price);
                        const finalPrice = (supplier as any).finalPrice;
                        
                        return (
                          <Card key={index} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback>
                                      {supplierName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-semibold text-lg">{supplierName}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Service: <span className="font-medium text-foreground">{serviceName}</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant={supplier.status === 'approved' ? 'default' : supplier.status === 'rejected' ? 'destructive' : 'secondary'}>
                                        {supplier.status || 'pending'}
                                      </Badge>
                                      {supplier.priority && (
                                        <Badge variant="outline" className="text-xs">
                                          {supplier.priority} priority
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Chat
                                </Button>
                              </div>

                              {/* Package Details Section */}
                              {hasPackage && packageDetails && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-sm flex items-center gap-2">
                                      <Package className="w-4 h-4 text-primary" />
                                      Selected Package
                                    </h5>
                                    <Badge variant="secondary" className="font-bold text-base">
                                      ₪{packageDetails.price}
                                    </Badge>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-foreground capitalize">
                                          {packageDetails.name}
                                        </p>
                                        {packageDetails.isPopular && (
                                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                                            🔥 Popular
                                          </Badge>
                                        )}
                                      </div>
                                      {packageDetails.description && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {packageDetails.description}
                                        </p>
                                      )}
                                    </div>

                                    {packageDetails.duration && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{packageDetails.duration} hours</span>
                                      </div>
                                    )}

                                    {packageDetails.features && packageDetails.features.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Package Features:</p>
                                        <ul className="text-xs space-y-1">
                                          {packageDetails.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-1">
                                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                              <span>{feature}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Additional Info */}
                              {!hasPackage && (
                                <div className="mt-3 pt-3 border-t border-border">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {supplier.requestedPrice && (
                                      <div>
                                        <span className="text-muted-foreground">Requested Price:</span>
                                        <span className="font-semibold ml-2">₪{supplier.requestedPrice}</span>
                                      </div>
                                    )}
                                    {finalPrice && (
                                      <div>
                                        <span className="text-muted-foreground">Final Price:</span>
                                        <span className="font-semibold ml-2 text-green-600">₪{finalPrice}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No suppliers invited yet</p>
                          <p className="text-sm mt-2">Select a category above to browse suppliers</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendees Tab */}
            <TabsContent value="attendees" className="flex-1 overflow-y-auto mt-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Event Attendees</span>
                    {attendeesStatistics && (
                      <Badge variant="secondary" className="text-sm">
                        {attendeesPagination.totalAttendees} Total
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Statistics Cards */}
                  {attendeesStatistics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">{attendeesStatistics.confirmedAttendees || 0}</p>
                          <p className="text-sm text-muted-foreground">Confirmed</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-blue-600">{attendeesStatistics.totalTicketsSold || 0}</p>
                          <p className="text-sm text-muted-foreground">Tickets Sold</p>
                        </CardContent>
                      </Card>
                   
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-orange-600">₪{attendeesStatistics.totalRevenue || 0}</p>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Search and Filter */}
                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, phone, or booking reference..."
                        value={attendeeSearch}
                        onChange={(e) => setAttendeeSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={attendeeStatusFilter} onValueChange={setAttendeeStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Attendees List */}
                  {loadingAttendees ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading attendees...</span>
                    </div>
                  ) : attendeesError ? (
                    <div className="text-center py-8 text-red-600">
                      <XCircle className="w-12 h-12 mx-auto mb-4" />
                      <p>{attendeesError}</p>
                    </div>
                  ) : attendees.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No attendees yet</p>
                      <p className="text-sm mt-2">
                        Attendees will appear here once they register for your event
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {attendees.map((attendee, index) => (
                          <Card key={attendee._id || index} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {attendee.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'A'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-base">{attendee.fullName}</h4>
                                      {attendee.checkedIn && (
                                        <Badge variant="default" className="bg-green-500">
                                          <UserCheck className="w-3 h-3 mr-1" />
                                          Checked In
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{attendee.email}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        <span>{attendee.phone}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <TicketIcon className="w-3 h-3" />
                                        <span>{attendee.ticketType || 'General'} × {attendee.ticketQuantity || 1}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                          {attendee.registeredAt 
                                            ? new Date(attendee.registeredAt).toLocaleDateString()
                                            : 'N/A'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Ticket Pricing Details */}
                                    {(attendee.ticketPrice !== undefined || attendee.totalAmount !== undefined) && (
                                      <div className="mt-2 p-2 bg-muted/30 rounded border border-border">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">Price per ticket:</span>
                                          <span className="font-semibold">₪{attendee.ticketPrice || 0}</span>
                                        </div>
                                        {attendee.ticketQuantity > 1 && (
                                          <div className="flex items-center justify-between text-xs mt-1">
                                            <span className="text-muted-foreground">Total amount:</span>
                                            <span className="font-bold text-primary">₪{attendee.totalAmount || 0}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                   
                                    {attendee.specialRequirements && (
                                      <div className="mt-2 text-xs text-muted-foreground italic">
                                        Note: {attendee.specialRequirements}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <Badge 
                                    variant={
                                      attendee.bookingStatus === 'confirmed' 
                                        ? 'default' 
                                        : attendee.bookingStatus === 'cancelled' 
                                        ? 'destructive' 
                                        : 'secondary'
                                    }
                                  >
                                    {attendee.bookingStatus || 'pending'}
                                  </Badge>
                                  {attendee.age && (
                                    <span className="text-xs text-muted-foreground">
                                      Age: {attendee.age}
                                    </span>
                                  )}
                                  {attendee.gender && (
                                    <span className="text-xs text-muted-foreground capitalize">
                                      {attendee.gender}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Pagination */}
                      {attendeesPagination.totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Showing {((attendeesPagination.currentPage - 1) * 20) + 1} to {Math.min(attendeesPagination.currentPage * 20, attendeesPagination.totalAttendees)} of {attendeesPagination.totalAttendees} attendees
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAttendeePageChange(attendeesPagination.currentPage - 1)}
                              disabled={!attendeesPagination.hasPrevPage}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAttendeePageChange(attendeesPagination.currentPage + 1)}
                              disabled={!attendeesPagination.hasNextPage}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
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
