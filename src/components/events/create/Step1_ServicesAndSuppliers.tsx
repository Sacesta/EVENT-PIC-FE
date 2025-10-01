import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, DollarSign, Camera, Utensils, Music, Palette, MapPinIcon, Shield, Car, Volume2, Lightbulb, Mic, Heart, Building, Coffee, Users, FileText, Home, Bus, Settings } from 'lucide-react';

interface Service {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  color: string;
}

interface SupplierService {
  id: string;
  name: string;
  price: number;
  description: string;
  duration?: string;
}

interface Supplier {
  id: string;
  name: string;
  rating: number;
  location: string;
  description: string;
  services: SupplierService[];
  experience: string;
  availability: string;
}

interface Step1_ServicesAndSuppliersProps {
  eventData: {
    services: string[];
    selectedSuppliers: { [service: string]: { [supplierId: string]: string[] } }; // supplierId -> serviceIds
    currentTab?: string;
  };
  onUpdate: (field: string, value: unknown) => void;
  onNext: () => void;
}

// Memoized Service Item Component - Cleaner desktop layout
const ServiceItem = React.memo(({ 
  service, 
  isSelected, 
  onToggle 
}: { 
  service: Service; 
  isSelected: boolean; 
  onToggle: (service: string, checked: boolean) => void; 
}) => {
  const Icon = service.icon;
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md' : 'hover:bg-muted/30'
      }`}
      onClick={() => onToggle(service.key, !isSelected)}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`p-2 md:p-3 rounded-lg ${service.color} transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
            <Icon className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className="font-semibold text-sm md:text-base leading-tight">{service.name}</h3>
          <Checkbox 
            checked={isSelected}
            onChange={() => onToggle(service.key, !isSelected)}
            className="pointer-events-none"
          />
        </div>
      </CardContent>
    </Card>
  );
});

// Supplier Invitation Card Component
const SupplierInvitationCard = React.memo(({ 
  supplier, 
  service, 
  selectedServices,
  onServiceToggle 
}: { 
  supplier: Supplier; 
  service: string;
  selectedServices: string[];
  onServiceToggle: (service: string, supplierId: string, serviceId: string) => void; 
}) => {
  const { t } = useTranslation();
  const relevantServices = supplier.services.filter(s => 
    s.name.toLowerCase().includes(service.toLowerCase()) || 
    service === 'dj' && (s.name.toLowerCase().includes('dj') || s.name.toLowerCase().includes('music')) ||
    service === 'security' && s.name.toLowerCase().includes('security') ||
    service === 'decoration' && s.name.toLowerCase().includes('decor') ||
    service === 'sound_lighting' && (s.name.toLowerCase().includes('sound') || s.name.toLowerCase().includes('lighting') || s.name.toLowerCase().includes('audio') || s.name.toLowerCase().includes('visual')) ||
    service === 'catering' && (s.name.toLowerCase().includes('catering') || s.name.toLowerCase().includes('food')) ||
    service === 'bar' && (s.name.toLowerCase().includes('bar') || s.name.toLowerCase().includes('cocktail') || s.name.toLowerCase().includes('drink')) ||
    service === 'first_aid' && (s.name.toLowerCase().includes('medical') || s.name.toLowerCase().includes('first') || s.name.toLowerCase().includes('aid')) ||
    service === 'artists' && (s.name.toLowerCase().includes('band') || s.name.toLowerCase().includes('musician') || s.name.toLowerCase().includes('performer') || s.name.toLowerCase().includes('artist')) ||
    service === 'insurance' && s.name.toLowerCase().includes('insurance') ||
    service === 'venue_rental' && s.name.toLowerCase().includes('venue') ||
    service === 'transportation' && s.name.toLowerCase().includes('transport') ||
    service === 'general' && (s.name.toLowerCase().includes('coordination') || s.name.toLowerCase().includes('setup') || s.name.toLowerCase().includes('general'))
  );

  const hasSelectedServices = selectedServices.length > 0;

  return (
    <Card className={`transition-all duration-300 ${hasSelectedServices ? 'ring-2 ring-primary bg-gradient-to-br from-primary/5 to-primary/10' : 'hover:shadow-lg'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg">{supplier.name}</CardTitle>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{supplier.rating}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{supplier.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{supplier.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">{supplier.experience}</Badge>
              </div>
              <div className="text-green-600 font-medium">{supplier.availability}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              {t('createEvent.selectServices')} - {service}
            </h4>
            <div className="space-y-2">
              {relevantServices.map((supplierService) => {
                const isSelected = selectedServices.includes(supplierService.id);
                return (
                  <div 
                    key={supplierService.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }`}
                    onClick={() => onServiceToggle(service, supplier.id, supplierService.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm">{supplierService.name}</h5>
                          <div className="text-lg font-bold text-primary">${supplierService.price}</div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{supplierService.description}</p>
                        {supplierService.duration && (
                          <div className="text-xs text-muted-foreground">
                            Duration: {supplierService.duration}
                          </div>
                        )}
                      </div>
                       <Checkbox 
                         checked={isSelected}
                         onChange={() => onServiceToggle(service, supplier.id, supplierService.id)}
                         className="pointer-events-none"
                       />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {hasSelectedServices && (
            <div className="border-t pt-4">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
                <h5 className="font-semibold text-sm mb-2 text-primary">🎉 Selected Services</h5>
                <div className="text-xs text-muted-foreground">
                  {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                </div>
                <div className="text-lg font-bold text-primary mt-1">
                  Total: ${relevantServices
                    .filter(s => selectedServices.includes(s.id))
                    .reduce((sum, s) => sum + s.price, 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

const Step1_ServicesAndSuppliers: React.FC<Step1_ServicesAndSuppliersProps> = React.memo(({ eventData, onUpdate, onNext }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [activeTab, setActiveTab] = useState(eventData.currentTab || 'services');

  // Sync activeTab with eventData to prevent resets
  React.useEffect(() => {
    if (eventData.currentTab && eventData.currentTab !== activeTab) {
      setActiveTab(eventData.currentTab);
    }
  }, [eventData.currentTab, activeTab]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    onUpdate('currentTab', value);
  }, [onUpdate]);

  const services = useMemo(() => [
    { key: 'dj', icon: Music, name: t('createEvent.services.dj'), color: 'text-purple-500 bg-purple-100' },
    { key: 'security', icon: Shield, name: t('createEvent.services.security'), color: 'text-red-500 bg-red-100' },
    { key: 'decoration', icon: Palette, name: t('createEvent.services.decoration'), color: 'text-pink-500 bg-pink-100' },
    { key: 'sound_lighting', icon: Volume2, name: t('createEvent.services.soundLighting'), color: 'text-yellow-500 bg-yellow-100' },
    { key: 'catering', icon: Utensils, name: t('createEvent.services.catering'), color: 'text-orange-500 bg-orange-100' },
    { key: 'bar', icon: Coffee, name: t('createEvent.services.bar'), color: 'text-amber-500 bg-amber-100' },
    { key: 'first_aid', icon: Heart, name: t('createEvent.services.firstAid'), color: 'text-red-600 bg-red-50' },
    { key: 'artists', icon: Mic, name: t('createEvent.services.artists'), color: 'text-indigo-500 bg-indigo-100' },
    { key: 'insurance', icon: FileText, name: t('createEvent.services.insurance'), color: 'text-slate-500 bg-slate-100' },
    { key: 'venue_rental', icon: Building, name: t('createEvent.services.venueRental'), color: 'text-green-500 bg-green-100' },
    { key: 'transportation', icon: Bus, name: t('createEvent.services.transportation'), color: 'text-blue-500 bg-blue-100' },
    { key: 'general', icon: Settings, name: t('createEvent.services.general'), color: 'text-gray-500 bg-gray-100' }
  ], [t]);

  // Mock supplier data with detailed services - memoized to prevent recreation on every render
  const supplierData = useMemo((): { [key: string]: Supplier[] } => ({
    'dj': [
      { 
        id: '1', 
        name: 'DJ Supreme', 
        rating: 4.9, 
        location: 'Citywide', 
        description: 'Professional DJ and MC services with state-of-the-art sound equipment and lighting.',
        experience: '10+ years',
        availability: 'Available',
        services: [
          { id: 'dj-1', name: 'Wedding DJ Package', price: 800, description: 'Complete wedding entertainment with MC services', duration: '6 hours' },
          { id: 'dj-2', name: 'Party DJ Service', price: 500, description: 'DJ services for private parties and celebrations', duration: '4 hours' },
          { id: 'dj-3', name: 'Corporate Event DJ', price: 650, description: 'Professional entertainment for corporate events', duration: '4 hours' }
        ]
      }
    ],
    'security': [
      { 
        id: '2', 
        name: 'SecureGuard Solutions', 
        rating: 4.8, 
        location: 'City Center', 
        description: 'Professional security services for events of all sizes with trained personnel.',
        experience: '12+ years',
        availability: 'Available',
        services: [
          { id: 'sec-1', name: 'Event Security Package', price: 200, description: 'Security personnel per hour (minimum 4 hours)', duration: '4+ hours' },
          { id: 'sec-2', name: 'VIP Protection', price: 350, description: 'Personal security for VIP guests', duration: 'Full event' }
        ]
      }
    ],
    'decoration': [
      { 
        id: '3', 
        name: 'Dream Decorators', 
        rating: 4.7, 
        location: 'Design Quarter', 
        description: 'Full-service event decoration specialists creating magical atmospheres for every occasion.',
        experience: '9+ years',
        availability: 'Available',
        services: [
          { id: 'decor-1', name: 'Wedding Decoration Package', price: 1500, description: 'Complete venue transformation with floral arrangements', duration: 'Setup & breakdown' },
          { id: 'decor-2', name: 'Birthday Party Decor', price: 350, description: 'Themed party decorations and setup', duration: '2 hours setup' },
          { id: 'decor-3', name: 'Corporate Event Styling', price: 800, description: 'Professional corporate event decoration', duration: 'Full setup' }
        ]
      }
    ],
    'sound_lighting': [
      { 
        id: '4', 
        name: 'Audio Visual Pro', 
        rating: 4.9, 
        location: 'Tech District', 
        description: 'Professional sound and lighting equipment rental with expert setup and operation.',
        experience: '8+ years',
        availability: 'Available',
        services: [
          { id: 'av-1', name: 'Complete Sound System', price: 400, description: 'Professional sound system with microphones', duration: 'Full event' },
          { id: 'av-2', name: 'Lighting Package', price: 300, description: 'Stage and ambient lighting setup', duration: 'Full event' },
          { id: 'av-3', name: 'AV Combo Package', price: 650, description: 'Sound and lighting combined package', duration: 'Full event' }
        ]
      }
    ],
    'catering': [
      { 
        id: '5', 
        name: 'Elite Catering Co.', 
        rating: 4.8, 
        location: 'Downtown', 
        description: 'Premium catering service offering exquisite cuisine crafted from the finest local ingredients.',
        experience: '12+ years',
        availability: 'Available',
        services: [
          { id: 'cater-1', name: 'Italian Feast Menu', price: 45, description: 'Authentic Italian cuisine per person (min 50 people)', duration: 'Full service' },
          { id: 'cater-2', name: 'Vegetarian Deluxe', price: 38, description: 'Gourmet vegetarian options per person', duration: 'Full service' },
          { id: 'cater-3', name: 'Corporate Lunch Package', price: 25, description: 'Business lunch catering per person', duration: '2 hours setup' }
        ]
      }
    ],
    'bar': [
      { 
        id: '6', 
        name: 'Cocktail Masters', 
        rating: 4.7, 
        location: 'Entertainment District', 
        description: 'Professional bar services with skilled bartenders and premium beverages.',
        experience: '6+ years',
        availability: 'Available',
        services: [
          { id: 'bar-1', name: 'Open Bar Package', price: 35, description: 'Unlimited drinks per person', duration: 'Full event' },
          { id: 'bar-2', name: 'Cocktail Service', price: 25, description: 'Signature cocktails and premium spirits', duration: '4 hours' }
        ]
      }
    ],
    'first_aid': [
      { 
        id: '7', 
        name: 'Event Medical Services', 
        rating: 4.9, 
        location: 'Citywide', 
        description: 'Professional medical services and first aid support for events.',
        experience: '15+ years',
        availability: 'Available',
        services: [
          { id: 'med-1', name: 'First Aid Station', price: 150, description: 'Medical professional on-site with first aid equipment', duration: 'Full event' },
          { id: 'med-2', name: 'Emergency Response', price: 200, description: 'Full emergency medical response team', duration: 'Full event' }
        ]
      }
    ],
    'artists': [
      { 
        id: '8', 
        name: 'Talent Agency Pro', 
        rating: 4.8, 
        location: 'Arts Quarter', 
        description: 'Professional talent booking agency for musicians, performers, and entertainers.',
        experience: '10+ years',
        availability: 'Available',
        services: [
          { id: 'art-1', name: 'Live Band Performance', price: 1200, description: 'Professional band for 3-hour performance', duration: '3 hours' },
          { id: 'art-2', name: 'Solo Musician', price: 400, description: 'Solo performer for background music', duration: '2 hours' }
        ]
      }
    ],
    'insurance': [
      { 
        id: '9', 
        name: 'Event Insurance Co.', 
        rating: 4.6, 
        location: 'Financial District', 
        description: 'Comprehensive event insurance coverage for all types of events.',
        experience: '20+ years',
        availability: 'Available',
        services: [
          { id: 'ins-1', name: 'Event Liability Insurance', price: 200, description: 'Comprehensive liability coverage for the event', duration: 'Event duration' },
          { id: 'ins-2', name: 'Equipment Insurance', price: 100, description: 'Coverage for rented equipment and property', duration: 'Event duration' }
        ]
      }
    ],
    'venue_rental': [
      { 
        id: '10', 
        name: 'Grand Ballroom', 
        rating: 4.8, 
        location: 'Downtown', 
        description: 'Elegant ballroom venue with crystal chandeliers and accommodation for up to 300 guests.',
        experience: '15+ years',
        availability: 'Available',
        services: [
          { id: 'venue-1', name: 'Wedding Venue Rental', price: 2500, description: 'Full day ballroom rental with setup assistance', duration: '12 hours' },
          { id: 'venue-2', name: 'Corporate Event Space', price: 1800, description: 'Professional meeting and event space', duration: '8 hours' }
        ]
      }
    ],
    'transportation': [
      { 
        id: '11', 
        name: 'Luxury Transport Co.', 
        rating: 4.7, 
        location: 'Citywide', 
        description: 'Premium transportation services for events with luxury vehicles.',
        experience: '8+ years',
        availability: 'Available',
        services: [
          { id: 'trans-1', name: 'Luxury Bus Rental', price: 500, description: 'Luxury bus for up to 50 passengers', duration: 'Full day' },
          { id: 'trans-2', name: 'VIP Car Service', price: 200, description: 'Luxury car with professional driver', duration: '4 hours' }
        ]
      }
    ],
    'general': [
      { 
        id: '12', 
        name: 'Event Solutions', 
        rating: 4.5, 
        location: 'City Center', 
        description: 'General event services and coordination for all your event needs.',
        experience: '5+ years',
        availability: 'Available',
        services: [
          { id: 'gen-1', name: 'Event Coordination', price: 300, description: 'Full event coordination and management', duration: 'Full event' },
          { id: 'gen-2', name: 'General Setup', price: 150, description: 'General setup and breakdown services', duration: 'As needed' }
        ]
      }
    ]
  }), []);

  const handleServiceToggle = useCallback((service: string, checked: boolean) => {
    const updatedServices = checked 
      ? [...(eventData.services || []), service]
      : (eventData.services || []).filter(s => s !== service);
    
    onUpdate('services', updatedServices);
    
    // If unchecking a service, also remove selected suppliers for that service
    if (!checked && eventData.selectedSuppliers?.[service]) {
      const updatedSuppliers = { ...eventData.selectedSuppliers };
      delete updatedSuppliers[service];
      onUpdate('selectedSuppliers', updatedSuppliers);
    }
  }, [eventData.services, eventData.selectedSuppliers, onUpdate]);

  const handleSupplierServiceToggle = useCallback((service: string, supplierId: string, serviceId: string) => {
    const currentSuppliers = eventData.selectedSuppliers || {};
    const supplierServices = currentSuppliers[service]?.[supplierId] || [];
    
    const updatedServices = supplierServices.includes(serviceId)
      ? supplierServices.filter(id => id !== serviceId)
      : [...supplierServices, serviceId];
    
    const updatedSuppliers = {
      ...currentSuppliers,
      [service]: {
        ...currentSuppliers[service],
        [supplierId]: updatedServices.length > 0 ? updatedServices : undefined
      }
    };

    // Clean up empty entries
    if (updatedServices.length === 0) {
      delete updatedSuppliers[service][supplierId];
      if (Object.keys(updatedSuppliers[service]).length === 0) {
        delete updatedSuppliers[service];
      }
    }
    
    onUpdate('selectedSuppliers', updatedSuppliers);
  }, [eventData.selectedSuppliers, onUpdate]);

  const getSelectedServicesCount = useMemo(() => eventData.services?.length || 0, [eventData.services]);
  const getSelectedSuppliersCount = useMemo(() => {
    const suppliers = eventData.selectedSuppliers || {};
    return Object.values(suppliers).reduce((total, serviceSuppliers) => {
      return total + Object.values(serviceSuppliers).reduce((serviceTotal, services) => {
        return serviceTotal + services.length;
      }, 0);
    }, 0);
  }, [eventData.selectedSuppliers]);

  const canProceed = useMemo(() => {
    return true; // Allow proceeding even without services (skip option)
  }, []);

  const handleNext = useCallback(() => {
    if (activeTab === 'services' && getSelectedServicesCount > 0) {
      const newTab = 'suppliers';
      setActiveTab(newTab);
      onUpdate('currentTab', newTab);
    } else if (activeTab === 'suppliers') {
      onNext();
    } else {
      // Skip services entirely
      onNext();
    }
  }, [activeTab, getSelectedServicesCount, onUpdate, onNext]);

  const handleSkip = useCallback(() => {
    onUpdate('services', []);
    onUpdate('selectedSuppliers', {});
    onNext();
  }, [onUpdate, onNext]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">{t('createEvent.step1.title')}</h2>
        <p className="text-muted-foreground">{t('createEvent.step1.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className={`grid w-full grid-cols-2`}>
          {isRTL ? (
            <>
              <TabsTrigger value="services" className="flex items-center gap-2">
                {t('createEvent.services.title', 'Services')}
                {getSelectedServicesCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getSelectedServicesCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="suppliers" disabled={getSelectedServicesCount === 0} className="flex items-center gap-2">
                {t('createEvent.suppliers.title', 'Suppliers')}
                {getSelectedSuppliersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getSelectedSuppliersCount}
                  </Badge>
                )}
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="services" className="flex items-center gap-2">
                {t('createEvent.services.title', 'Services')}
                {getSelectedServicesCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getSelectedServicesCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="suppliers" disabled={getSelectedServicesCount === 0} className="flex items-center gap-2">
                {t('createEvent.suppliers.title', 'Suppliers')}
                {getSelectedSuppliersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getSelectedSuppliersCount}
                  </Badge>
                )}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">{t('createEvent.step1.servicesDesc')}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
            {services.map((service) => {
              const isSelected = eventData.services?.includes(service.key) || false;
              
              return (
                <ServiceItem
                  key={service.key}
                  service={service}
                  isSelected={isSelected}
                  onToggle={handleServiceToggle}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">{t('createEvent.step1.suppliersDesc')}</p>
          </div>

          <div className="space-y-8">
            {eventData.services?.map((service) => (
              <div key={service} className="space-y-4">
                <div className="flex items-center gap-3 pb-2">
                  <div className={`p-2 rounded-lg ${services.find(s => s.key === service)?.color || 'bg-muted'}`}>
                    {React.createElement(services.find(s => s.key === service)?.icon || Camera, { className: "w-5 h-5" })}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {services.find(s => s.key === service)?.name || service}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {supplierData[service]?.length || 0} {t('createEvent.step1.available')}
                  </Badge>
                </div>
                
                <div className="grid gap-6">
                  {supplierData[service]?.map((supplier) => {
                    const selectedServices = eventData.selectedSuppliers?.[service]?.[supplier.id] || [];
                    
                    return (
                      <SupplierInvitationCard
                        key={supplier.id}
                        supplier={supplier}
                        service={service}
                        selectedServices={selectedServices}
                        onServiceToggle={handleSupplierServiceToggle}
                      />
                    );
                  }) || (
                    <Card className="p-8">
                      <p className="text-muted-foreground text-center">
                        {t('createEvent.step1.noSuppliers')} {service}
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            )) || (
              <Card className="p-12">
                <p className="text-muted-foreground text-center text-lg">
                  {t('createEvent.step1.selectServicesFirst')}
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline"
          onClick={handleSkip}
          className="px-8"
        >
          {t('createEvent.step1.skip')}
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
          className="px-8"
        >
          {activeTab === 'services' && getSelectedServicesCount > 0 
            ? t('createEvent.step1.chooseSuppliers')
            : t('common.continue')
          }
        </Button>
      </div>
    </div>
  );
});

export default Step1_ServicesAndSuppliers;