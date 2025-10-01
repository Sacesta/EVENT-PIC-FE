import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import apiService, { type Service } from '@/services/api';
import ServiceCard from './ServiceCard';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';
import PackageManagement from './PackageManagement';

const SERVICE_CATEGORIES = [
  'all', 'photography', 'videography', 'catering', 'music', 
  'decoration', 'transportation', 'security', 'lighting',
  'sound', 'furniture', 'tents', 'other'
];

interface ServiceManagementProps {
  onDataUpdated?: () => void;
}

export default function ServiceManagement({ onDataUpdated }: ServiceManagementProps = {}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getMyServices();
      const servicesData = response.data as Service[] | { services: Service[] };
      const servicesList = Array.isArray(servicesData) ? servicesData : servicesData.services || [];
      setServices(servicesList);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('services.fetchError', 'Failed to load services'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm(t('services.confirmDelete', 'Are you sure you want to delete this service?'))) {
      return;
    }

    try {
      await apiService.deleteService(serviceId);
      toast({
        title: t('common.success', 'Success'),
        description: t('services.serviceDeleted', 'Service deleted successfully')
      });
      await fetchServices();
      // Also refresh parent dashboard data
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('services.deleteError', 'Failed to delete service'),
        variant: 'destructive'
      });
    }
  };

  const handleToggleAvailability = async (serviceId: string, isAvailable: boolean) => {
    try {
      await apiService.toggleServiceAvailability(serviceId, isAvailable);
      toast({
        title: t('common.success', 'Success'),
        description: t('services.availabilityUpdated', 'Service availability updated')
      });
      await fetchServices();
      // Also refresh parent dashboard data
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('services.availabilityError', 'Failed to update availability'),
        variant: 'destructive'
      });
    }
  };

  const handleManagePackages = (service: Service) => {
    setSelectedService(service);
    setIsPackageModalOpen(true);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getServiceStats = () => {
    const total = services.length;
    const active = services.filter(s => s.available).length;
    const inactive = total - active;
    return { total, active, inactive };
  };

  const stats = getServiceStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gradient-primary">
            {t('services.manageServices', 'Manage Services')}
          </h2>
          <p className="text-muted-foreground">
            {t('services.manageDescription', 'Create and manage your service offerings')}
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('services.addService', 'Add Service')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalServices', 'Total Services')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.activeServices', 'Active Services')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.inactiveServices', 'Inactive Services')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('services.filtersAndSearch', 'Filters & Search')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('services.searchServices', 'Search services...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('services.selectCategory', 'Select category')} />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' 
                      ? t('services.allCategories', 'All Categories')
                      : t(`categories.${category}`, category)
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || selectedCategory !== 'all' 
                  ? t('services.noServicesFound', 'No services found')
                  : t('services.noServices', 'No services yet')
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? t('services.tryDifferentSearch', 'Try adjusting your search or filters')
                  : t('services.createFirstService', 'Create your first service to get started')
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('services.addFirstService', 'Add Your First Service')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredServices.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
              onToggleAvailability={handleToggleAvailability}
              onManagePackages={handleManagePackages}
            />
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onServiceAdded={async () => {
          await fetchServices();
          if (onDataUpdated) {
            onDataUpdated();
          }
        }}
      />

      {/* Edit Service Modal */}
      <EditServiceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        service={selectedService}
        onServiceUpdated={async () => {
          await fetchServices();
          if (onDataUpdated) {
            onDataUpdated();
          }
        }}
      />

      {/* Package Management Modal */}
      <PackageManagement
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        service={selectedService}
        onPackagesUpdated={async () => {
          await fetchServices();
          if (onDataUpdated) {
            onDataUpdated();
          }
        }}
      />
    </div>
  );
}
