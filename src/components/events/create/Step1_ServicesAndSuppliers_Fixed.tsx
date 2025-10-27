import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  Disc3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import apiService from "@/services/api";

// Service categories with icons - using translation keys (12 categories)
const SERVICE_CATEGORIES = [
  {
    key: "dj",
    icon: Disc3,
    labelKey: "categories.dj",
    color: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  },
  {
    key: "location",
    icon: MapPin,
    labelKey: "categories.location",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  },
  {
    key: "security",
    icon: Shield,
    labelKey: "categories.security",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  {
    key: "scenery",
    icon: Image,
    labelKey: "categories.scenery",
    color:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
  },
  {
    key: "sounds_lights",
    icon: Zap,
    labelKey: "categories.sounds_lights",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
  {
    key: "catering",
    icon: UtensilsCrossed,
    labelKey: "categories.catering",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  {
    key: "bar",
    icon: Wine,
    labelKey: "categories.bar",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
  {
    key: "first_aid",
    icon: Heart,
    labelKey: "categories.first_aid",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  {
    key: "musicians",
    icon: Music2,
    labelKey: "categories.musicians",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  },
  {
    key: "insurance",
    icon: ShieldCheck,
    labelKey: "categories.insurance",
    color:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  },
  {
    key: "photography",
    icon: Camera,
    labelKey: "categories.photography",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    key: "transportation",
    icon: Car,
    labelKey: "categories.transportation",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  {
    key: "other",
    icon: Grid3X3,
    labelKey: "categories.other",
    color: "bg-muted text-muted-foreground",
  },
];

// Types
interface PackageInfo {
  packageId: string;
  name: string;
  description: string;
  category: string;
  price: {
    amount: number;
    currency: string;
    pricingType: string;
  };
  features: string[];
  duration?: number;
  isPopular: boolean;
  image?: string;
  available: boolean;
  rating: {
    average: number;
    count: number;
  };
}

interface SupplierWithPackages {
  supplierId: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  isVerified: boolean;
  memberSince: string;
  companyName?: string;
  description?: string;
  rating: {
    average: number;
    count: number;
  };
  location: {
    city: string;
    address?: string;
  };
  categories: string[];
  packages: PackageInfo[];
  // Aggregated package info
  packageCount: number;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
}

interface Step1Props {
  eventData?: {
    categories?: string[];
    selectedPackages?: { [packageId: string]: { packageId: string; packageDetails: Record<string, unknown> } };
  };
  onUpdate?: (field: string, value: unknown) => void;
  selectedServices?: string[];
  onServicesChange?: (services: string[]) => void;
  selectedSuppliers?: { [service: string]: { [supplierId: string]: string[] } };
  onSuppliersChange?: (suppliers: {
    [service: string]: { [supplierId: string]: string[] };
  }) => void;
  selectedPackages?: {
    [packageId: string]: {
      packageId: string;
      packageDetails: Record<string, unknown>;
    };
  };
  onPackagesChange?: (packages: {
    [packageId: string]: {
      packageId: string;
      packageDetails: Record<string, unknown>;
    };
  }) => void;
  onNext?: () => void;
  isEditMode?: boolean;
}

// Service Category Card Component
const ServiceCategoryCard = React.memo(
  ({
    category,
    isSelected,
    onToggle,
  }: {
    category: (typeof SERVICE_CATEGORIES)[0];
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
          <div
            className={cn(
              "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2",
              category.color
            )}
          >
            <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </div>
          <h3 className="font-semibold text-xs sm:text-sm mb-1">
            {t(category.labelKey)}
          </h3>
          <div className="flex justify-center">
            {isSelected && (
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#31A7FF]" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

// Enhanced Package Card Component - Fully Clickable with Complete Details
// Supplier Card Component - Compact for Scalability
const SupplierCard = React.memo(
  ({
    supplier,
    selectedPackages,
    onOpenModal,
  }: {
    supplier: SupplierWithPackages;
    selectedPackages: {
      [packageId: string]: {
        packageId: string;
        packageDetails: Record<string, unknown>;
      };
    };
    onOpenModal: (supplier: SupplierWithPackages) => void;
  }) => {
    const { t } = useTranslation();

    // Count selected packages from this supplier
    const selectedCount = supplier.packages.filter((pkg) =>
      Object.keys(selectedPackages).includes(pkg.packageId)
    ).length;

    const formatPrice = (amount: number, currency: string) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    return (
      <Card
        className={cn(
          "overflow-hidden transition-all duration-200 border-2 bg-card mb-2 cursor-pointer hover:shadow-lg",
          selectedCount > 0
            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
            : "border-border hover:border-primary/30"
        )}
        onClick={() => onOpenModal(supplier)}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Supplier Profile Image */}
            <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded-lg">
              {supplier.profileImage ? (
                <img
                  src={supplier.profileImage}
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                  <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              )}
              {supplier.isVerified && (
                <div className="absolute -top-1 -right-1">
                  <CheckCircle className="w-5 h-5 text-green-500 bg-white dark:bg-gray-900 rounded-full" />
                </div>
              )}
            </div>

            {/* Supplier Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground truncate">
                  {supplier.companyName || supplier.name}
                </h3>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.floor(supplier.rating.average)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {supplier.rating.average.toFixed(1)} ({supplier.rating.count})
                </span>
              </div>

              {/* Location & Package Count */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{supplier.location.city}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  <span>
                    {supplier.packageCount} {t("packages.packages", "Packages")}
                  </span>
                </div>
              </div>

              {/* Categories */}
              {supplier.categories && supplier.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {supplier.categories.map((cat, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Price Range */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("common.priceRange", "Price Range")}:
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(
                    supplier.priceRange.min,
                    supplier.priceRange.currency
                  )}
                  {" - "}
                  {formatPrice(
                    supplier.priceRange.max,
                    supplier.priceRange.currency
                  )}
                </span>
              </div>
            </div>

            {/* Selection Indicator */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              {selectedCount > 0 && (
                <Badge className="bg-green-500 text-white">
                  {selectedCount} {t("common.selected", "Selected")}
                </Badge>
              )}
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

// Compact Filters Component
const CompactFilters = ({
  searchTerm,
  setSearchTerm,
  cityFilter,
  setCityFilter,
  priceFilter,
  setPriceFilter,
  ratingFilter,
  setRatingFilter,
  categoryFilter,
  setCategoryFilter,
  onClearFilters,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
  priceFilter: string;
  setPriceFilter: (value: string) => void;
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  categoryFilter: string[];
  setCategoryFilter: (value: string[]) => void;
  onClearFilters: () => void;
}) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters =
    searchTerm || cityFilter || priceFilter || ratingFilter || categoryFilter.length > 0;

  return (
    <div className="flex-shrink-0 mb-3">
      {/* Search Bar - Always Visible */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder={t("createEvent.step1.searchSuppliers")}
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
          {t("createEvent.step1.filters")}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-4 text-xs">
              {
                [searchTerm, cityFilter, priceFilter, ratingFilter].filter(Boolean).length +
                (categoryFilter.length > 0 ? 1 : 0)
              }
            </Badge>
          )}
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform",
              showFilters ? "rotate-180" : ""
            )}
          />
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="flex items-center gap-1 h-8 text-xs text-gray-600 hover:text-gray-900"
          >
            <X className="w-3 h-3" />
            {t("createEvent.step1.clear")}
          </Button>
        )}
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="mt-2 space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block">
              {t("createEvent.step1.filterByCategory", "Filter by Category")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {SERVICE_CATEGORIES.map((category) => {
                const isSelected = categoryFilter.includes(category.key);
                const Icon = category.icon;
                return (
                  <div
                    key={category.key}
                    onClick={() => {
                      if (isSelected) {
                        setCategoryFilter(categoryFilter.filter(c => c !== category.key));
                      } else {
                        setCategoryFilter([...categoryFilter, category.key]);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all text-xs",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => {}}
                      className="pointer-events-none"
                    />
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{t(category.labelKey)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">
              {t("auth.city")}
            </label>
            <Input
              placeholder={t("createEvent.step1.enterCity")}
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">
              {t("createEvent.step1.priceRange")}
            </label>
            <Select
              value={priceFilter || undefined}
              onValueChange={(value) => setPriceFilter(value || "")}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={t("createEvent.step1.anyPrice")} />
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
            <label className="text-xs font-medium mb-1 block">
              {t("createEvent.step1.minRating")}
            </label>
            <Select
              value={ratingFilter || undefined}
              onValueChange={(value) => setRatingFilter(value || "")}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={t("createEvent.step1.anyRating")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">
                  4+ {t("createEvent.step1.stars")}
                </SelectItem>
                <SelectItem value="4.5">
                  4.5+ {t("createEvent.step1.stars")}
                </SelectItem>
                <SelectItem value="5">
                  5 {t("createEvent.step1.stars")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoized Package Card Component - Prevents unnecessary re-renders
const PackageCard = React.memo(({
  pkg,
  isSelected,
  onToggle,
  getCategoryBadgeClass,
  t
}: {
  pkg: PackageInfo;
  isSelected: boolean;
  onToggle: (packageId: string) => void;
  getCategoryBadgeClass: (category: string) => string;
  t: ReturnType<typeof useTranslation>['t'];
}) => {
  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-md group",
        isSelected ? "ring-2 ring-primary" : "hover:border-primary/50"
      )}
      onClick={() => onToggle(pkg.packageId)}
    >
      {/* Package Image */}
      <div className="relative h-36 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
        {pkg.image ? (
          <img
            src={pkg.image}
            alt={pkg.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-primary/30" />
          </div>
        )}
        {/* Status Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {pkg.isPopular && (
            <Badge className="bg-blue-500 text-white text-xs shadow-lg">
              Popular
            </Badge>
          )}
          {!pkg.available && (
            <Badge className="bg-red-500 text-white text-xs shadow-lg">
              Unavailable
            </Badge>
          )}
        </div>
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
          {pkg.name}
        </h3>

        {/* Category */}
        {pkg.category && (
          <Badge variant="secondary" className="text-xs">
            {t(`categories.${pkg.category}`, pkg.category)}
          </Badge>
        )}

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {pkg.description}
        </p>

        {/* Price & Rating */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xl font-bold text-primary">
            {pkg.price.currency}{pkg.price.amount}
          </span>
          {pkg.rating && pkg.rating.count > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{pkg.rating.average.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Availability */}
        {pkg.available && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            <span>Available</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Only re-render if isSelected changes for this specific package
  return prevProps.isSelected === nextProps.isSelected &&
         prevProps.pkg.packageId === nextProps.pkg.packageId;
});

PackageCard.displayName = 'PackageCard';

// Main Component
const Step1_ServicesAndSuppliers: React.FC<Step1Props> = ({
  selectedServices: propSelectedServices = [],
  onServicesChange = () => {},
  selectedSuppliers: propSelectedSuppliers = {},
  onSuppliersChange = () => {},
  selectedPackages: propSelectedPackages = {},
  onPackagesChange = () => {},
  onNext = () => {},
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const [activeTab, setActiveTab] = useState("services");
  const [suppliers, setSuppliers] = useState<SupplierWithPackages[]>([]);
  const [selectedSupplierForModal, setSelectedSupplierForModal] =
    useState<SupplierWithPackages | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // Internal state for selected services (fallback if no props provided)
  const [internalSelectedServices, setInternalSelectedServices] = useState<
    string[]
  >([]);
  const [internalSelectedSuppliers, setInternalSelectedSuppliers] = useState<{
    [service: string]: { [supplierId: string]: string[] };
  }>({});
  const [internalSelectedPackages, setInternalSelectedPackages] = useState<{
    [packageId: string]: {
      packageId: string;
      packageDetails: Record<string, unknown>;
    };
  }>({});

  // Use prop services if provided, otherwise use internal state
  const selectedServices =
    propSelectedServices.length > 0
      ? propSelectedServices
      : internalSelectedServices;
  const selectedSuppliers =
    Object.keys(propSelectedSuppliers).length > 0
      ? propSelectedSuppliers
      : internalSelectedSuppliers;
  const selectedPackages =
    Object.keys(propSelectedPackages).length > 0
      ? propSelectedPackages
      : internalSelectedPackages;

  // Check if at least one supplier is selected
  const hasSelectedSuppliers = useMemo(() => {
    return Object.values(selectedSuppliers).some((serviceSuppliers) =>
      Object.values(serviceSuppliers).some((services) => services.length > 0)
    );
  }, [selectedSuppliers]);

  // Handle service category toggle
  const handleServiceToggle = useCallback(
    (categoryKey: string) => {
      const currentServices = selectedServices || [];
      const newServices = currentServices.includes(categoryKey)
        ? currentServices.filter((s) => s !== categoryKey)
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
    },
    [selectedServices, onServicesChange, selectedSuppliers, onSuppliersChange]
  );
  // Package Selection Modal Component - Memoized to prevent re-renders
const PackageSelectionModal = React.memo(({
  supplier,
  isOpen,
  onClose,
  selectedPackages,
  onPackageSelect
}: {
  supplier: SupplierWithPackages | null;
  isOpen: boolean;
  onClose: () => void;
  selectedPackages: { [packageId: string]: { packageId: string; packageDetails: Record<string, unknown> } };
  onPackageSelect: (packageId: string, packageId2: string | null, packageDetails: Record<string, unknown> | null) => void;
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 6;

  // Reset to page 1 when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Get category color - Memoized to prevent recreation
  const getCategoryBadgeClass = useCallback((category: string) => {
    const categoryObj = SERVICE_CATEGORIES.find(c => c.key === category);
    return categoryObj?.color || "bg-muted text-muted-foreground";
  }, []);

  // Memoized toggle handler to prevent recreation on every render
  const handleTogglePackage = useCallback((pkg: PackageInfo, isSelected: boolean) => {
    if (isSelected) {
      onPackageSelect(pkg.packageId, null, null);
    } else {
      onPackageSelect(pkg.packageId, pkg.packageId, {
        name: pkg.name,
        description: pkg.description,
        price: pkg.price.amount,
        features: pkg.features,
        duration: pkg.duration,
        category: pkg.category
      });
    }
  }, [onPackageSelect]);

  // Early return after all hooks have been called
  if (!supplier) return null;

  // Calculate pagination - Memoized
  const totalPackages = supplier.packages.length;
  const totalPages = Math.ceil(totalPackages / packagesPerPage);
  const startIndex = (currentPage - 1) * packagesPerPage;
  const endIndex = startIndex + packagesPerPage;
  const currentPackages = supplier.packages.slice(startIndex, endIndex);

  // Memoize selected count to prevent recalculation
  const selectedCount = useMemo(() =>
    Object.keys(selectedPackages).filter(id =>
      supplier.packages.some(p => p.packageId === id)
    ).length,
    [selectedPackages, supplier.packages]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Instagram-like Header */}
        <div className="flex items-start gap-4 pb-4 border-b">
          {/* Profile Image */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0 overflow-hidden flex items-center justify-center border-2 border-border">
            {supplier.profileImage ? (
              <img
                src={supplier.profileImage}
                alt={supplier.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Users className="w-6 h-6 text-primary" />
            )}
          </div>

          {/* Supplier Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold">{supplier.companyName || supplier.name}</h2>
              {supplier.isVerified && (
                <CheckCircle className="w-4 h-4 text-blue-500" />
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm mb-2">
              <div>
                <span className="font-semibold">{supplier.packages.length}</span>
                <span className="text-muted-foreground ml-1">packages</span>
              </div>
              {supplier.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{supplier.rating.average.toFixed(1)}</span>
                  <span className="text-muted-foreground">({supplier.rating.count})</span>
                </div>
              )}
              {selectedCount > 0 && (
                <div>
                  <span className="font-semibold text-primary">{selectedCount}</span>
                  <span className="text-muted-foreground ml-1">selected</span>
                </div>
              )}
            </div>

            {/* Categories */}
            {supplier.categories && supplier.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {supplier.categories.slice(0, 3).map((cat, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
                {supplier.categories.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{supplier.categories.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Packages Grid - 3 Columns */}
        <div className="flex-1 overflow-y-auto px-1 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentPackages.map((pkg) => {
              const isSelected = pkg.packageId in selectedPackages;

              return (
                <PackageCard
                  key={pkg.packageId}
                  pkg={pkg}
                  isSelected={isSelected}
                  onToggle={() => handleTogglePackage(pkg, isSelected)}
                  getCategoryBadgeClass={getCategoryBadgeClass}
                  t={t}
                />
              );
            })}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="flex-shrink-0 pt-3 border-t">
          {/* Pagination - Only if needed */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                {t('common.previous', 'Previous')}
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                {t('common.next', 'Next')}
              </Button>
            </div>
          )}

          {/* Done Button */}
          <Button onClick={onClose} className="w-full">
            {t('common.done', 'Done')} {selectedCount > 0 && `(${selectedCount})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-render
  // Only re-render if selectedPackages, isOpen, or supplier changes
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.supplier?.supplierId === nextProps.supplier?.supplierId &&
    JSON.stringify(prevProps.selectedPackages) === JSON.stringify(nextProps.selectedPackages)
  );
});

PackageSelectionModal.displayName = 'PackageSelectionModal';

  // Handle supplier selection
  const handleSupplierSelect = useCallback(
    (
      service: string,
      supplierId: string,
      packageId: string,
      isSelected: boolean
    ) => {
      const updatedSuppliers = { ...selectedSuppliers };

      if (!updatedSuppliers[service]) {
        updatedSuppliers[service] = {};
      }

      if (!updatedSuppliers[service][supplierId]) {
        updatedSuppliers[service][supplierId] = [];
      }

      if (isSelected) {
        if (!updatedSuppliers[service][supplierId].includes(packageId)) {
          updatedSuppliers[service][supplierId].push(packageId);
        }
      } else {
        updatedSuppliers[service][supplierId] = updatedSuppliers[service][
          supplierId
        ].filter((id) => id !== packageId);

        if (updatedSuppliers[service][supplierId].length === 0) {
          delete updatedSuppliers[service][supplierId];
        }

        if (Object.keys(updatedSuppliers[service]).length === 0) {
          delete updatedSuppliers[service];
        }

        // Also remove package selection when deselected
        const updatedPackages = { ...selectedPackages };
        if (updatedPackages[packageId]) {
          delete updatedPackages[packageId];
          setInternalSelectedPackages(updatedPackages);
          onPackagesChange(updatedPackages);
        }
      }

      setInternalSelectedSuppliers(updatedSuppliers);
      onSuppliersChange(updatedSuppliers);
    },
    [selectedSuppliers, selectedPackages, onSuppliersChange, onPackagesChange]
  );

  // Handle package selection
  const handlePackageSelect = useCallback(
    (
      packageId: string,
      packageId2: string | null,
      packageDetails: Record<string, unknown> | null
    ) => {
      const updatedPackages = { ...selectedPackages };

      if (packageId2 && packageDetails) {
        updatedPackages[packageId] = { packageId: packageId2, packageDetails };
      } else {
        delete updatedPackages[packageId];
      }

      setInternalSelectedPackages(updatedPackages);
      onPackagesChange(updatedPackages);
    },
    [selectedPackages, onPackagesChange]
  );

  // Fetch suppliers based on selected services
  const fetchSuppliers = useCallback(async () => {
    if (!selectedServices || selectedServices.length === 0) {
      setSuppliers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: {
        category: string;
        limit: number;
        page: number;
        search?: string;
        city?: string;
        minPrice?: number;
        maxPrice?: number;
        minRating?: number;
      } = {
        category: selectedServices.join(","),
        limit: 50,
        page: 1,
      };

      if (searchTerm) params.search = searchTerm;
      if (cityFilter) params.city = cityFilter;
      if (priceFilter) {
        const [min, max] = priceFilter.split("-").map(Number);
        if (min) params.minPrice = min;
        if (max) params.maxPrice = max;
      }
      if (ratingFilter) params.minRating = parseFloat(ratingFilter);

      const response = await apiService.getPackagesWithSuppliers(params);

      if (response.success && response.data) {
        // Group packages by supplier
        const supplierMap = new Map<string, SupplierWithPackages>();

        // Type definition for the response data items
        type PackageWithSupplierData = {
          packageId: string;
          name: string;
          description: string;
          category: string;
          price: { amount: number; currency: string; pricingType: string };
          features?: string[];
          duration?: number;
          isPopular?: boolean;
          image?: string;
          available: boolean;
          rating?: { average: number; count: number };
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
            rating: { average: number; count: number };
            location: { city: string; address?: string };
            categories: string[];
          };
        };

        (response.data as PackageWithSupplierData[]).forEach((item) => {
          const supplierId = item.supplier?.supplierId;
          if (!supplierId) return;

          if (!supplierMap.has(supplierId)) {
            supplierMap.set(supplierId, {
              supplierId: item.supplier.supplierId,
              name: item.supplier.name,
              email: item.supplier.email,
              phone: item.supplier.phone,
              profileImage: item.supplier.profileImage,
              isVerified: item.supplier.isVerified,
              memberSince: item.supplier.memberSince,
              companyName: item.supplier.companyName,
              description: item.supplier.description,
              rating: item.supplier.rating || { average: 0, count: 0 },
              location: item.supplier.location || { city: "" },
              categories: item.supplier.categories || [],
              packages: [],
              packageCount: 0,
              priceRange: {
                min: Infinity,
                max: 0,
                currency: "ILS",
              },
            });
          }

          const supplier = supplierMap.get(supplierId)!;

          // Add package to supplier
          supplier.packages.push({
            packageId: item.packageId,
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            features: item.features || [],
            duration: item.duration,
            isPopular: item.isPopular,
            image: item.image,
            available: item.available,
            rating: item.rating || { average: 0, count: 0 },
          });

          // Update price range
          if (item.price?.amount < supplier.priceRange.min) {
            supplier.priceRange.min = item.price.amount;
            supplier.priceRange.currency = item.price.currency;
          }
          if (item.price?.amount > supplier.priceRange.max) {
            supplier.priceRange.max = item.price.amount;
          }

          supplier.packageCount = supplier.packages.length;
        });

        setSuppliers(Array.from(supplierMap.values()));
      } else {
        setError("Failed to fetch suppliers");
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError("Failed to fetch suppliers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedServices, searchTerm, cityFilter, priceFilter, ratingFilter]);

  // Effect to fetch suppliers when filters change
  useEffect(() => {
    if (activeTab === "suppliers") {
      fetchSuppliers();
    }
  }, [activeTab, fetchSuppliers]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setCityFilter("");
    setPriceFilter("");
    setRatingFilter("");
    setCategoryFilter([]);
  }, []);

  // Filter suppliers by category (client-side)
  const filteredSuppliers = useMemo(() => {
    if (categoryFilter.length === 0) {
      return suppliers;
    }

    return suppliers.filter(supplier => {
      // Check if supplier has any packages in the selected categories
      return supplier.packages.some(pkg =>
        categoryFilter.includes(pkg.category)
      );
    });
  }, [suppliers, categoryFilter]);

  return (
    <div className="flex flex-col h-auto">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 text-center pb-3 md:pb-4">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">
          {t("createEvent.step1.title")}
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          {t("createEvent.step1.subtitle")}
        </p>
      </div>

      {/* Content - No internal scrolling */}
      <div className="flex-1 min-h-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex flex-col"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0 mb-3">
            <TabsTrigger
              value="services"
              className="flex items-center gap-1 md:gap-2"
            >
              <Palette className="w-3 h-3 md:w-4 md:h-4 p-2" />
              <span className="text-xs md:text-sm">
                {t("createEvent.services.title")}
              </span>
              {selectedServices && selectedServices.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 text-xs">
                  {selectedServices.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="suppliers"
              className="flex items-center gap-1 md:gap-2"
            >
              <Users className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">
                {t("createEvent.suppliers.title")}
              </span>
              {Object.values(selectedSuppliers).reduce(
                (total, serviceSuppliers) =>
                  total +
                  Object.values(serviceSuppliers).reduce(
                    (sum, services) => sum + services.length,
                    0
                  ),
                0
              ) > 0 && (
                <Badge
                  variant="default"
                  className="ml-1 h-4 text-xs bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground font-bold"
                >
                  {Object.values(selectedSuppliers).reduce(
                    (total, serviceSuppliers) =>
                      total +
                      Object.values(serviceSuppliers).reduce(
                        (sum, services) => sum + services.length,
                        0
                      ),
                    0
                  )}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="flex-1">
            <div className="p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 pb-4 px-1">
                {SERVICE_CATEGORIES.map((category) => (
                  <ServiceCategoryCard
                    key={category.key}
                    category={category}
                    isSelected={
                      selectedServices?.includes(category.key) || false
                    }
                    onToggle={handleServiceToggle}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="flex-1">
            {!selectedServices || selectedServices.length === 0 ? (
              <Card className="flex items-center justify-center">
                <CardContent className="text-center py-8">
                  <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    {t("createEvent.step1.noSuppliers")}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t("createEvent.step1.selectServicesFirst")}
                  </p>
                  <Button onClick={() => setActiveTab("services")} size="sm">
                    {t("createEvent.services.title")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col">
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
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  onClearFilters={clearAllFilters}
                />

                {/* Suppliers List - No internal scroll */}
                <div className="flex-1">
                  <div>
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
                            {t("common.error")}
                          </h3>
                          <p className="text-xs text-gray-600 mb-3">{error}</p>
                          <Button onClick={fetchSuppliers} size="sm">
                            {t("common.continue")}
                          </Button>
                        </CardContent>
                      </Card>
                    ) : filteredSuppliers.length === 0 ? (
                      <Card className="m-2">
                        <CardContent className="text-center py-6">
                          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            {t("createEvent.step1.noSuppliers")}
                          </h3>
                          <p className="text-xs text-gray-600 mb-3">
                            {categoryFilter.length > 0
                              ? t("createEvent.step1.noSuppliersInCategory", "No suppliers found in selected categories")
                              : t("createEvent.step1.selectServicesFirst")}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                          >
                            {t("common.cancel")}
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="px-1 pb-4">
                        {filteredSuppliers.map((supplier) => (
                          <SupplierCard
                            key={supplier.supplierId}
                            supplier={supplier}
                            selectedPackages={selectedPackages}
                            onOpenModal={(sup) => {
                              setSelectedSupplierForModal(sup);
                              setIsPackageModalOpen(true);
                            }}
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
      <div className="flex-shrink-0 flex justify-between pt-3 border-t nav-wrapper-dark">
        <Button
          variant="outline"
          onClick={() => {
            if (activeTab === "suppliers") {
              setActiveTab("services");
            } else {
              // Skip Step1 and go directly to Step2
              console.log("Skipping Step1, proceeding to Step2");
              onNext();
            }
          }}
          className="px-4 h-9 text-sm"
          size="sm"
        >
          {activeTab === "suppliers"
            ? t("common.back")
            : t("createEvent.step1.skip")}
        </Button>
        <Button
          onClick={() => {
            if (activeTab === "services") {
              setActiveTab("suppliers");
            } else {
              console.log("Proceeding to next step with data:", {
                selectedServices,
                selectedSuppliers,
              });
              onNext();
            }
          }}
          disabled={
            !selectedServices ||
            selectedServices.length === 0
          }
          className="px-4 h-9 text-sm"
          size="sm"
        >
          {activeTab === "services"
            ? t("createEvent.step1.chooseSuppliers")
            : t("createEvent.step2.continue")}
        </Button>
      </div>

      {/* Package Selection Modal */}
      <PackageSelectionModal
        supplier={selectedSupplierForModal}
        isOpen={isPackageModalOpen}
        onClose={() => {
          setIsPackageModalOpen(false);
          setSelectedSupplierForModal(null);
        }}
        selectedPackages={selectedPackages}
        onPackageSelect={handlePackageSelect}
      />
    </div>
  );
};

export default Step1_ServicesAndSuppliers;
