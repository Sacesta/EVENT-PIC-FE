import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Phone, Mail, SortAsc, SortDesc, Loader2, AlertCircle, RotateCcw, Award, CheckCircle2, Instagram, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiService } from '@/services/api';
import { useTranslation } from 'react-i18next';
import { autoTranslate } from '@/utils/autoTranslate';

interface Supplier {
  supplierId: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  profileImage?: string;
  isVerified: boolean;
  memberSince: string;
  rating: {
    average: number;
    count: number;
  };
  services: any[];
  supplierDetails?: {
    instagramLink?: string;
    website?: string;
  };
}

interface SuppliersResponse {
  success: boolean;
  data: Supplier[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: Record<string, any>;
}

type SortOrder = 'asc' | 'desc';

const SERVICE_CATEGORIES = [
  'photography',
  'catering',
  'decoration',
  'music',
  'venue',
  'transportation',
  'security',
  'florist',
  'cake',
  'invitation',
  'videography',
  'makeup',
  'other'
];

export default function BroadSuppliers() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [minRating, setMinRating] = useState('0');

  // State for API data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationLoading, setPaginationLoading] = useState(false);

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, unknown> = {
        page: currentPage,
        limit,
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (cityFilter.trim()) params.city = cityFilter.trim();
      if (minRating && minRating !== '0') params.minRating = parseFloat(minRating);

      console.log('🔍 Fetching suppliers with params:', params);

      const response = await apiService.request('/suppliers/suppliers-directory', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }) as any;

      // Build query string manually
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      });

      const fullResponse = await fetch(
        `${apiService['baseURL']}/suppliers/suppliers-directory?${queryString}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      ).then(r => r.json());

      console.log('✅ Backend response:', fullResponse);

      if (fullResponse.success && fullResponse.data) {
        setSuppliers(fullResponse.data);
        if (fullResponse.pagination) {
          setPagination(fullResponse.pagination);
        }
      } else {
        setError(fullResponse.message || 'Failed to fetch suppliers');
      }
    } catch (err) {
      console.error('❌ Error fetching suppliers:', err);

      let errorMessage = 'Failed to load suppliers. Please try again.';

      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, cityFilter, minRating]);

  // Fetch suppliers on component mount and when filters change
  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, limit, searchQuery, categoryFilter, cityFilter, minRating]);

  // Sort suppliers client-side
  const sortedSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.rating.average - b.rating.average;
      }
      return b.rating.average - a.rating.average;
    });
  }, [suppliers, sortOrder]);

  const handleViewDetails = (supplierId: string) => {
    console.log('Navigating to supplier:', supplierId);
    navigate(`/supplier/${supplierId}`);
  };

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.pages && page !== currentPage) {
        setPaginationLoading(true);
        setCurrentPage(page);

        setTimeout(() => {
          setPaginationLoading(false);
        }, 300);
      }
    },
    [currentPage, pagination.pages]
  );

  const handleLimitChange = useCallback((newLimit: string) => {
    setLimit(parseInt(newLimit));
    setCurrentPage(1);
    setPaginationLoading(true);
    setTimeout(() => setPaginationLoading(false), 300);
  }, []);

  const SupplierCard: React.FC<{ supplier: Supplier }> = ({ supplier }) => {
    const uniqueServices = supplier.services
      .reduce((acc: any[], service) => {
        if (!acc.find(s => s.category === service.category)) {
          acc.push(service);
        }
        return acc;
      }, [])
      .slice(0, 5);

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/20">
        <CardContent className="p-5">
          <div className="flex gap-4">
            {/* Profile Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              {supplier.profileImage ? (
                <img
                  src={supplier.profileImage}
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Award className="w-8 h-8 text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Header with name and verification */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold group-hover:text-primary transition-all duration-300 text-foreground truncate">
                      {supplier.companyName || supplier.name}
                    </h3>
                    {supplier.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  {supplier.companyName && (
                    <p className="text-xs text-muted-foreground">{supplier.name}</p>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(supplier.rating.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {supplier.rating.average.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({supplier.rating.count} reviews)
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 mb-3 text-xs text-muted-foreground">
                {supplier.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-primary" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-primary" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {/* Social Links */}
                {(supplier.supplierDetails?.instagramLink || supplier.supplierDetails?.website) && (
                  <div className="flex items-center gap-2 mt-2">
                    {supplier.supplierDetails?.instagramLink && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(supplier.supplierDetails.instagramLink, '_blank');
                        }}
                      >
                        <Instagram className="w-3 h-3 mr-1" />
                        Instagram
                      </Button>
                    )}
                    {supplier.supplierDetails?.website && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(supplier.supplierDetails.website, '_blank');
                        }}
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        Website
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Services as Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {uniqueServices.map((service, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs"
                  >
                    {autoTranslate(service.category || service.title, i18n.language)}
                  </Badge>
                ))}
                {supplier.services.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{supplier.services.length - 5}
                  </Badge>
                )}
              </div>

              {/* Footer with member since and action button */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                   {t('suppliers.supplierCard.memberSince')} {new Date(supplier.memberSince).getFullYear()}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleViewDetails(supplier.supplierId)}
                  className="ml-2"
                >
                  {t('suppliers.supplierCard.viewDetails')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState: React.FC = () => (
    <div className="text-center py-12">
      <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <p className="text-lg text-muted-foreground">No suppliers found matching your criteria</p>
      <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="rounded-2xl p-8 glass-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('suppliers.browseSuppliers', 'Browse Suppliers')}
            </h1>
            <p className="text-muted-foreground">
              {t('suppliers.discoverSuppliers', 'Find and connect with professional service providers')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
            {t('suppliers.sortByRating', 'Sort by Rating')}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('suppliers.searchPlaceholder', 'Search suppliers, services...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('suppliers.services.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('suppliers.services.all')}</SelectItem>
              {SERVICE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {autoTranslate(category, i18n.language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Input
            placeholder={t('suppliers.city', 'City')}
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />

          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger>
              <SelectValue placeholder="Min Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t('suppliers.filters.allRatings')}</SelectItem>
              <SelectItem value="3">{t('suppliers.filters.stars3')}</SelectItem>
              <SelectItem value="4">{t('suppliers.filters.stars4')}</SelectItem>
              <SelectItem value="4.5">{t('suppliers.filters.stars45')}</SelectItem>
              <SelectItem value="5">{t('suppliers.filters.stars5')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{t('suppliers.filters.show')}:</span>
            <Select value={limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters Button */}
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setCityFilter('');
                setMinRating('0');
                setCurrentPage(1);
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t('suppliers.filters.reset')}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading || paginationLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              {loading ? 'Loading suppliers...' : 'Loading...'}
            </span>
          </div>
        ) : (
          <>
            {/* Suppliers List */}
            {sortedSuppliers.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="space-y-4">
                  {sortedSuppliers.map((supplier) => (
                    <SupplierCard key={supplier.supplierId} supplier={supplier} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * limit + 1} to{' '}
                      {Math.min(currentPage * limit, pagination.total)} of{' '}
                      {pagination.total} suppliers
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}