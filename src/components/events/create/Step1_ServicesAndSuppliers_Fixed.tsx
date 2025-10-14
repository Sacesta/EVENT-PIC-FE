import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Video, 
  UtensilsCrossed, 
  Music, 
  Music2,
  Palette, 
  Car, 
  Shield, 
  ShieldCheck,
  Lightbulb, 
  Volume2, 
  Armchair, 
  Home,
  Grid3X3,
  Star,
  MapPin,
  Clock,
  Users,
  Phone,
  Mail,
  CheckCircle,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ChevronDown,
  Package,
  X,
  Wine,
  Image,
  Zap,
  Heart,
  Building,
  Disc3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import apiService from '@/services/api';
import { autoTranslate } from '@/utils/autoTranslate';

// Service categories with icons - using translation keys (12 categories)
const SERVICE_CATEGORIES = [
  { key: 'dj', icon: Disc3, labelKey: 'categories.dj', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300' },
  { key: 'security', icon: Shield, labelKey: 'categories.security', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { key: 'scenery', icon: Image, labelKey: 'categories.scenery', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300' },
  { key: 'sounds_lights', icon: Zap, labelKey: 'categories.sounds_lights', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  { key: 'catering', icon: UtensilsCrossed, labelKey: 'categories.catering', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { key: 'bar', icon: Wine, labelKey: 'categories.bar', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  { key: 'first_aid', icon: Heart, labelKey: 'categories.first_aid', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { key: 'musicians', icon: Music2, labelKey: 'categories.musicians', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  { key: 'insurance', icon: ShieldCheck, labelKey: 'categories.insurance', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300' },
  { key: 'photography', icon: Camera, labelKey: 'categories.photography', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { key: 'location', icon: MapPin, labelKey: 'categories.location', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  { key: 'transportation', icon: Car, labelKey: 'categories.transportation', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { key: 'other', icon: Grid3X3, labelKey: 'categories.other', color: 'bg-muted text-muted-foreground' }
];

// Types
interface ServiceWithSupplier {
  serviceId: string;
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  tags: string[];
  price: {
    amount: number;
    currency: string;
    pricingType: string;
    minPrice?: number;
    maxPrice?: number;
  };
  packages: Array<{
    _id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    duration?: number;
    isPopular: boolean;
  }>;
  rating: {
    average: number;
    count: number;
    totalReviews: number;
  };
  location: {
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    serviceRadius: number;
  };
  availability: {
    startDate?: string;
    endDate?: string;
    workingHours?: Record<string, any>;
    leadTime?: number;
  };
  image?: string;
  portfolio: Array<{
    title: string;
    description: string;
    image: string;
    eventType: string;
    date: string;
  }>;
  available: boolean;
  featured: boolean;
  views: number;
  experience: string;
  supplier: {
    supplierId: string;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
    isVerified: boolean;
    memberSince: string;
    companyName?: string;
    description?: string;
    businessLicense?: string;
    experience?: string;
    categories: string[];
    rating: {
      average: number;
      count: number;
    };
    location: {
      city: string;
      address?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
      serviceRadius?: number;
    };
    portfolio: any[];
    certifications: string[];
    languages: string[];
    paymentMethods: string[];
    businessHours: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}

interface Step1Props {
  eventData?: any;
  onUpdate?: (field: string, value: unknown) => void;
  selectedServices?: string[];
  onServicesChange?: (services: string[]) => void;
  selectedSuppliers?: { [service: string]: { [supplierId: string]: string[] } };
  onSuppliersChange?: (suppliers: { [service: string]: { [supplierId: string]: string[] } }) => void;
  selectedPackages?: { [serviceId: string]: { packageId: string; packageDetails: any } };
  onPackagesChange?: (packages: { [serviceId: string]: { packageId: string; packageDetails: any } }) => void;
  onNext?: () => void;
  isEditMode?: boolean;
}

// Service Category Card Component
const ServiceCategoryCard = React.memo(({ 
  category, 
  isSelected, 
  onToggle 
}: { 
  category: typeof SERVICE_CATEGORIES[0]; 
  isSelected: boolean; 
  onToggle: (categoryKey: string) => void; 
}) => {
  const { t } = useTranslation();
  const Icon = category.icon;
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md h-24 sm:h-32 md:h-36",
        isSelected 
          ? "ring-2 ring-primary border-primary bg-primary/5" 
          : "hover:border-primary/50"
      )}
      onClick={() => onToggle(category.key)}
    >
      <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-center touch-manipulation select-none">
        <div className={cn(
          "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2",
          category.color
        )}>
          <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
        </div>
        <h3 className="font-semibold text-xs sm:text-sm mb-1">{t(category.labelKey)}</h3>
        <div className="flex justify-center">
          {isSelected && (
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#31A7FF]" />
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// Enhanced Package Card Component - Fully Clickable with Complete Details
const EnhancedPackageCard = React.memo(({ 
  pkg,
  service,
  isSelected,
  onSelect,
  i18nLanguage
}: {
  pkg: any;
  service: ServiceWithSupplier;
  isSelected: boolean;
  onSelect: () => void;
  i18nLanguage: string;
}) => {
  const { t } = useTranslation();
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative rounded-lg border-2 transition-all duration-300 cursor-pointer group",
        "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        isSelected
          ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 dark:bg-primary/20"
          : "border-border bg-card hover:border-primary/50 dark:bg-card"
      )}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-[#31A7FF] text-white rounded-full p-1 shadow-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* Popular Badge */}
      {pkg.isPopular && (
        <div className="absolute -top-2 -left-2 z-10">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 shadow-lg">
            🔥 Popular
          </Badge>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header: Name and Price */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-base md:text-lg font-bold text-foreground capitalize leading-tight">
              {autoTranslate(pkg.name, i18nLanguage)}
            </h4>
            {pkg.description && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                {autoTranslate(pkg.description, i18nLanguage)}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl md:text-2xl font-bold text-primary">
              {formatPrice(pkg.price, service.price.currency)}
            </div>
            {pkg.duration && pkg.duration > 0 && (
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                <span>{pkg.duration}h</span>
              </div>
            )}
          </div>
        </div>

        {/* Features List */}
        {pkg.features && pkg.features.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                {t('createEvent.step1.packageFeatures')}
              </h5>
              {pkg.features.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllFeatures(!showAllFeatures);
                  }}
                  className="h-6 text-xs px-2"
                >
                  {showAllFeatures ? t('common.showLess') : `+${pkg.features.length - 3} ${t('common.more')}`}
                </Button>
              )}
            </div>
            <ul className="space-y-1.5">
              {(showAllFeatures ? pkg.features : pkg.features.slice(0, 3)).map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-xs md:text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{autoTranslate(feature, i18nLanguage)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Selection Indicator */}
        
      </div>
    </div>
  );
});

// Supplier Card Component - Compact for Scalability
const SupplierCard = React.memo(({ 
  service, 
  selectedSuppliers, 
  onSupplierSelect,
  selectedPackages: globalSelectedPackages,
  onPackageSelect
}: { 
  service: ServiceWithSupplier;
  selectedSuppliers: { [service: string]: { [supplierId: string]: string[] } };
  onSupplierSelect: (service: string, supplierId: string, serviceId: string, isSelected: boolean) => void;
  selectedPackages: { [serviceId: string]: { packageId: string; packageDetails: any } };
  onPackageSelect: (serviceId: string, packageId: string | null, packageDetails: any | null) => void;
}) => {
  const { t, i18n } = useTranslation();
  const [showPackages, setShowPackages] = useState(false);

  // Check if this supplier's service is selected
  const isSupplierSelected = selectedSuppliers[service.category]?.[service.supplier.supplierId]?.includes(service.serviceId) || false;
  
  // Get selected package for this service from global state
  const selectedPackageId = globalSelectedPackages[service.serviceId]?.packageId || null;

  // Auto-expand packages if supplier is selected
  useEffect(() => {
    if (isSupplierSelected && service.packages && service.packages.length > 0) {
      setShowPackages(true);
    }
  }, [isSupplierSelected, service.packages]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Translate pricing type
  const translatePricingType = (pricingType: string) => {
    const pricingKey = `pricing.${pricingType}`;
    const translated = t(pricingKey);
    return translated !== pricingKey ? translated : pricingType.replace('_', ' ');
  };

  // Auto-translate service title from backend
  const translatedTitle = autoTranslate(service.title, i18n.language);

  const handlePackageSelect = (packageId: string) => {
    const isCurrentlySelected = selectedPackageId === packageId;
    
    if (isCurrentlySelected) {
      // Deselect the package
      onPackageSelect(service.serviceId, null, null);
      
      // If supplier is selected, deselect it too
      if (isSupplierSelected) {
        onSupplierSelect(
          service.category,
          service.supplier.supplierId,
          service.serviceId,
          false
        );
      }
    } else {
      // Select the new package
      const selectedPackage = service.packages.find(pkg => pkg._id === packageId);
      
      if (selectedPackage) {
        const packageDetails = {
          name: selectedPackage.name,
          description: selectedPackage.description || '',
          price: selectedPackage.price,
          features: selectedPackage.features || [],
          duration: selectedPackage.duration
        };
        
        onPackageSelect(service.serviceId, packageId, packageDetails);
        
        // If supplier is not yet selected, select it
        if (!isSupplierSelected) {
          onSupplierSelect(
            service.category,
            service.supplier.supplierId,
            service.serviceId,
            true
          );
        }
      }
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 border-2 bg-card dark:bg-card mb-2 cursor-pointer",
      isSupplierSelected 
        ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20" 
        : "border-border hover:shadow-sm hover:border-primary/30"
    )}>
      {/* Compact Supplier Info - Fully Clickable */}
      <div 
        className="p-2"
        onClick={() => {
          if (service.packages && service.packages.length > 0) {
            setShowPackages(!showPackages);
          }
        }}
      >
        <div className="flex items-center gap-2">
          {/* Image Section - Compact */}
          <div className="w-12 h-12 flex-shrink-0 relative overflow-hidden rounded-md">
            {service.image ? (
              <img 
                src={service.image} 
                alt={service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            {service.featured && (
              <div className="absolute -top-1 -left-1">
                <div className="bg-orange-500 text-white text-xs px-1 rounded-br-md">⭐</div>
              </div>
            )}
          </div>

          {/* Service Info - Compact */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="text-sm font-bold text-foreground truncate">{translatedTitle}</h3>
              {service.supplier.isVerified && (
                <CheckCircle className="w-3 h-3 text-green-500 dark:text-green-400 flex-shrink-0" />
              )}
            </div>
            
            {/* Rating - Compact */}
            <div className="flex items-center gap-1 mb-1">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i < Math.floor(service.rating.average) 
                        ? "fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" 
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-foreground">
                {service.rating.average.toFixed(1)}
              </span>
            </div>

            {/* Supplier & Location - Compact */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-medium truncate max-w-[100px]">{service.supplier.name}</span>
              <span>•</span>
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{service.location?.city}</span>
            </div>
          </div>

          {/* Price - Compact */}
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              {translatePricingType(service.price.pricingType)}
            </div>
          </div>

          {/* Packages Indicator - Compact */}
          <div className="flex-shrink-0">
            {service.packages && service.packages.length > 0 && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 h-7 text-xs font-medium rounded-md transition-all duration-200",
                showPackages 
                  ? "bg-indigo-600 text-white dark:bg-indigo-500" 
                  : "bg-indigo-100 text-indigo-700 border border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700"
              )}>
                <Package className="w-3 h-3" />
                <span>{service.packages.length}</span>
                {selectedPackageId && (
                  <span className="text-green-400 dark:text-green-300">✓</span>
                )}
                <ChevronDown className={cn(
                  "w-3 h-3 transition-transform duration-200",
                  showPackages ? "rotate-180" : ""
                )} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Packages Section - Full Details */}
      {showPackages && service.packages && service.packages.length > 0 && (
        <div className="border-t-2 border-border bg-muted/30 dark:bg-muted/10 p-3 md:p-4">
          {/* Package Grid - Full Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {service.packages.map((pkg) => (
              <EnhancedPackageCard
                key={pkg._id}
                pkg={pkg}
                service={service}
                isSelected={selectedPackageId === pkg._id}
                onSelect={() => handlePackageSelect(pkg._id)}
                i18nLanguage={i18n.language}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
});

// Compact Filters Component
const CompactFilters = ({ 
  searchTerm, setSearchTerm, 
  cityFilter, setCityFilter,
  priceFilter, setPriceFilter,
  ratingFilter, setRatingFilter,
  onClearFilters 
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
  priceFilter: string;
  setPriceFilter: (value: string) => void;
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  onClearFilters: () => void;
}) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = searchTerm || cityFilter || priceFilter || ratingFilter;

  return (
    <div className="flex-shrink-0 mb-3">
      {/* Search Bar - Always Visible */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder={t('createEvent.step1.searchSuppliers')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 text-sm"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 h-8 text-xs"
        >
          <Filter className="w-3 h-3" />
          {t('createEvent.step1.filters')}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-4 text-xs">
              {[searchTerm, cityFilter, priceFilter, ratingFilter].filter(Boolean).length}
            </Badge>
          )}
          <ChevronDown className={cn(
            "w-3 h-3 transition-transform",
            showFilters ? "rotate-180" : ""
          )} />
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="flex items-center gap-1 h-8 text-xs text-gray-600 hover:text-gray-900"
          >
            <X className="w-3 h-3" />
            {t('createEvent.step1.clear')}
          </Button>
        )}
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="mt-2 space-y-2 p-3 bg-gray-50 rounded-lg border">
          <div>
            <label className="text-xs font-medium mb-1 block">{t('auth.city')}</label>
            <Input
              placeholder={t('createEvent.step1.enterCity')}
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">{t('createEvent.step1.priceRange')}</label>
            <Select value={priceFilter || undefined} onValueChange={(value) => setPriceFilter(value || '')}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={t('createEvent.step1.anyPrice')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-500">$0 - $500</SelectItem>
                <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                <SelectItem value="5000-">$5,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">{t('createEvent.step1.minRating')}</label>
            <Select value={ratingFilter || undefined} onValueChange={(value) => setRatingFilter(value || '')}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={t('createEvent.step1.anyRating')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4+ {t('createEvent.step1.stars')}</SelectItem>
                <SelectItem value="4.5">4.5+ {t('createEvent.step1.stars')}</SelectItem>
                <SelectItem value="5">5 {t('createEvent.step1.stars')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
const Step1_ServicesAndSuppliers: React.FC<Step1Props> = ({ 
  selectedServices: propSelectedServices = [], 
  onServicesChange = () => {},
  selectedSuppliers: propSelectedSuppliers = {},
  onSuppliersChange = () => {},
  selectedPackages: propSelectedPackages = {},
  onPackagesChange = () => {},
  onNext = () => {} 
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [activeTab, setActiveTab] = useState('services');
  const [suppliers, setSuppliers] = useState<ServiceWithSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  
  // Internal state for selected services (fallback if no props provided)
  const [internalSelectedServices, setInternalSelectedServices] = useState<string[]>([]);
  const [internalSelectedSuppliers, setInternalSelectedSuppliers] = useState<{ [service: string]: { [supplierId: string]: string[] } }>({});
  const [internalSelectedPackages, setInternalSelectedPackages] = useState<{ [serviceId: string]: { packageId: string; packageDetails: any } }>({});
  
  // Use prop services if provided, otherwise use internal state
  const selectedServices = propSelectedServices.length > 0 ? propSelectedServices : internalSelectedServices;
  const selectedSuppliers = Object.keys(propSelectedSuppliers).length > 0 ? propSelectedSuppliers : internalSelectedSuppliers;
  const selectedPackages = Object.keys(propSelectedPackages).length > 0 ? propSelectedPackages : internalSelectedPackages;

  // Check if at least one supplier is selected
  const hasSelectedSuppliers = useMemo(() => {
    return Object.values(selectedSuppliers).some(serviceSuppliers => 
      Object.values(serviceSuppliers).some(services => services.length > 0)
    );
  }, [selectedSuppliers]);

  // Handle service category toggle
  const handleServiceToggle = useCallback((categoryKey: string) => {
    const currentServices = selectedServices || [];
    const newServices = currentServices.includes(categoryKey)
      ? currentServices.filter(s => s !== categoryKey)
      : [...currentServices, categoryKey];
    
    setInternalSelectedServices(newServices);
    onServicesChange(newServices);

    // If removing a service, also remove all suppliers for that service
    if (!newServices.includes(categoryKey)) {
      const updatedSuppliers = { ...selectedSuppliers };
      delete updatedSuppliers[categoryKey];
      setInternalSelectedSuppliers(updatedSuppliers);
      onSuppliersChange(updatedSuppliers);
    }
  }, [selectedServices, onServicesChange, selectedSuppliers, onSuppliersChange]);

  // Handle supplier selection
  const handleSupplierSelect = useCallback((service: string, supplierId: string, serviceId: string, isSelected: boolean) => {
    const updatedSuppliers = { ...selectedSuppliers };
    
    if (!updatedSuppliers[service]) {
      updatedSuppliers[service] = {};
    }
    
    if (!updatedSuppliers[service][supplierId]) {
      updatedSuppliers[service][supplierId] = [];
    }
    
    if (isSelected) {
      if (!updatedSuppliers[service][supplierId].includes(serviceId)) {
        updatedSuppliers[service][supplierId].push(serviceId);
      }
    } else {
      updatedSuppliers[service][supplierId] = updatedSuppliers[service][supplierId].filter(id => id !== serviceId);
      
      if (updatedSuppliers[service][supplierId].length === 0) {
        delete updatedSuppliers[service][supplierId];
      }
      
      if (Object.keys(updatedSuppliers[service]).length === 0) {
        delete updatedSuppliers[service];
      }
      
      // Also remove package selection when supplier is deselected
      const updatedPackages = { ...selectedPackages };
      if (updatedPackages[serviceId]) {
        delete updatedPackages[serviceId];
        setInternalSelectedPackages(updatedPackages);
        onPackagesChange(updatedPackages);
      }
    }
    
    setInternalSelectedSuppliers(updatedSuppliers);
    onSuppliersChange(updatedSuppliers);
  }, [selectedSuppliers, selectedPackages, onSuppliersChange, onPackagesChange]);

  // Handle package selection
  const handlePackageSelect = useCallback((serviceId: string, packageId: string | null, packageDetails: any | null) => {
    const updatedPackages = { ...selectedPackages };
    
    if (packageId && packageDetails) {
      updatedPackages[serviceId] = { packageId, packageDetails };
    } else {
      delete updatedPackages[serviceId];
    }
    
    setInternalSelectedPackages(updatedPackages);
    onPackagesChange(updatedPackages);
  }, [selectedPackages, onPackagesChange]);

  // Fetch suppliers based on selected services
  const fetchSuppliers = useCallback(async () => {
    if (!selectedServices || selectedServices.length === 0) {
      setSuppliers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: any = {
        category: selectedServices.join(','),
        limit: 50,
        page: 1
      };

      if (searchTerm) params.search = searchTerm;
      if (cityFilter) params.city = cityFilter;
      if (priceFilter) {
        const [min, max] = priceFilter.split('-').map(Number);
        if (min) params.minPrice = min;
        if (max) params.maxPrice = max;
      }
      if (ratingFilter) params.minRating = parseFloat(ratingFilter);

      const response = await apiService.getServicesWithSuppliers(params);
      
      if (response.success && response.data) {
        setSuppliers(response.data as ServiceWithSupplier[]);
      } else {
        setError('Failed to fetch suppliers');
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to fetch suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedServices, searchTerm, cityFilter, priceFilter, ratingFilter]);

  // Effect to fetch suppliers when filters change
  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchSuppliers();
    }
  }, [activeTab, fetchSuppliers]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setCityFilter('');
    setPriceFilter('');
    setRatingFilter('');
  }, []);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-120px)]">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 text-center pb-3 md:pb-4">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">
          {t('createEvent.step1.title')}
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          {t('createEvent.step1.subtitle')}
        </p>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0 mb-3">
            <TabsTrigger value="services" className="flex items-center gap-1 md:gap-2">
              <Palette className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">{t('createEvent.services.title')}</span>
              {selectedServices && selectedServices.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 text-xs">
                  {selectedServices.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-1 md:gap-2">
              <Users className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">{t('createEvent.suppliers.title')}</span>
              {Object.values(selectedSuppliers).reduce((total, serviceSuppliers) => 
                total + Object.values(serviceSuppliers).reduce((sum, services) => sum + services.length, 0), 0
              ) > 0 && (
                <Badge variant="default" className="ml-1 h-4 text-xs bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground font-bold">
                  {Object.values(selectedSuppliers).reduce((total, serviceSuppliers) => 
                    total + Object.values(serviceSuppliers).reduce((sum, services) => sum + services.length, 0), 0
                  )}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="flex-1 overflow-hidden">
            <div 
              className="h-full overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
              style={{ 
                maxHeight: 'calc(100vh - 280px)',
                minHeight: '300px'
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 pb-4 px-1">
                {SERVICE_CATEGORIES.map((category) => (
                  <ServiceCategoryCard
                    key={category.key}
                    category={category}
                    isSelected={selectedServices?.includes(category.key) || false}
                    onToggle={handleServiceToggle}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="flex-1 overflow-hidden">
            {!selectedServices || selectedServices.length === 0 ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-8">
                  <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    {t('createEvent.step1.noSuppliers')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('createEvent.step1.selectServicesFirst')}
                  </p>
                  <Button onClick={() => setActiveTab('services')} size="sm">
                    {t('createEvent.services.title')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col h-full">
                {/* Compact Filters */}
                <CompactFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  cityFilter={cityFilter}
                  setCityFilter={setCityFilter}
                  priceFilter={priceFilter}
                  setPriceFilter={setPriceFilter}
                  ratingFilter={ratingFilter}
                  setRatingFilter={setRatingFilter}
                  onClearFilters={clearAllFilters}
                />

                {/* Suppliers List - Properly Scrollable */}
                <div className="flex-1 overflow-hidden">
                  <div 
                    className="h-full overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
                    style={{ 
                      maxHeight: 'calc(100vh - 420px)',
                      minHeight: '300px'
                    }}
                  >
                    {loading ? (
                      <div className="space-y-2 p-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i} className="h-16 p-2">
                            <div className="flex items-center gap-2 h-full">
                              <Skeleton className="w-10 h-10 rounded-md flex-shrink-0" />
                              <div className="flex-1 space-y-1">
                                <Skeleton className="h-3 w-3/4" />
                                <Skeleton className="h-2 w-1/2" />
                                <Skeleton className="h-2 w-2/3" />
                              </div>
                              <Skeleton className="w-12 h-6 flex-shrink-0" />
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : error ? (
                      <Card className="m-2">
                        <CardContent className="text-center py-6">
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            {t('common.error')}
                          </h3>
                          <p className="text-xs text-gray-600 mb-3">{error}</p>
                          <Button onClick={fetchSuppliers} size="sm">
                            {t('common.continue')}
                          </Button>
                        </CardContent>
                      </Card>
                    ) : suppliers.length === 0 ? (
                      <Card className="m-2">
                        <CardContent className="text-center py-6">
                          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            {t('createEvent.step1.noSuppliers')}
                          </h3>
                          <p className="text-xs text-gray-600 mb-3">
                            {t('createEvent.step1.selectServicesFirst')}
                          </p>
                          <Button variant="outline" size="sm" onClick={clearAllFilters}>
                            {t('common.cancel')}
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="px-1 pb-4">
                        {suppliers.map((service) => (
                          <SupplierCard 
                            key={service.serviceId} 
                            service={service} 
                            selectedSuppliers={selectedSuppliers}
                            onSupplierSelect={handleSupplierSelect}
                            selectedPackages={selectedPackages}
                            onPackageSelect={handlePackageSelect}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="flex-shrink-0 flex justify-between pt-3 border-t bg-background">
        <Button 
          variant="outline" 
          onClick={() => {
            if (activeTab === 'suppliers') {
              setActiveTab('services');
            } else {
              // Skip Step1 and go directly to Step2
              console.log('Skipping Step1, proceeding to Step2');
              onNext();
            }
          }}
          className="px-4 h-9 text-sm"
          size="sm"
        >
          {activeTab === 'suppliers' ? t('common.back') : t('createEvent.step1.skip')}
        </Button>
        <Button 
          onClick={() => {
            if (activeTab === 'services') {
              setActiveTab('suppliers');
            } else {
              console.log('Proceeding to next step with data:', {
                selectedServices,
                selectedSuppliers
              });
              onNext();
            }
          }}
          disabled={!selectedServices || selectedServices.length === 0 || (activeTab === 'suppliers' && !hasSelectedSuppliers)}
          className="px-4 h-9 text-sm"
          size="sm"
        >
          {activeTab === 'services' ? t('createEvent.step1.chooseSuppliers') : t('createEvent.step2.continue')}
        </Button>
      </div>
    </div>
  );
};

export default Step1_ServicesAndSuppliers;