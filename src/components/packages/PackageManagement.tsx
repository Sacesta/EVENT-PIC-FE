import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import apiService, { type Package } from '@/services/api';
import PackageCard from './PackageCard';
import AddPackageModal from './AddPackageModal';
import EditPackageModal from './EditPackageModal';

const PACKAGE_CATEGORIES = [
  'all', 'dj', 'security', 'scenery', 'sounds_lights', 'catering', 'bar',
  'first_aid', 'musicians', 'insurance', 'photography', 'location', 'transportation', 'other'
];

interface PackageManagementProps {
  onDataUpdated?: () => void;
}

export default function PackageManagement({ onDataUpdated }: PackageManagementProps = {}) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      // Using new /packages backend endpoint
      const response = await apiService.getMyPackages();
      const packagesData = response.data as Package[] | { packages: Package[] };
      const packagesList = Array.isArray(packagesData) ? packagesData : packagesData.packages || [];
      setPackages(packagesList);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('packages.fetchError', 'Failed to load packages'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsEditModalOpen(true);
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm(t('packages.confirmDelete', 'Are you sure you want to delete this package?'))) {
      return;
    }

    try {
      // Using new /packages backend endpoint
      await apiService.deletePackage(packageId);
      toast({
        title: t('common.success', 'Success'),
        description: t('packages.packageDeleted', 'Package deleted successfully')
      });
      await fetchPackages();
      // Also refresh parent dashboard data
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('packages.deleteError', 'Failed to delete package'),
        variant: 'destructive'
      });
    }
  };

  const handleToggleAvailability = async (packageId: string, isAvailable: boolean) => {
    try {
      // Using new /packages backend endpoint
      await apiService.togglePackageAvailability(packageId, isAvailable);
      toast({
        title: t('common.success', 'Success'),
        description: t('packages.availabilityUpdated', 'Package availability updated')
      });
      await fetchPackages();
      // Also refresh parent dashboard data
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('packages.availabilityError', 'Failed to update availability'),
        variant: 'destructive'
      });
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPackageStats = () => {
    const total = packages.length;
    const active = packages.filter(p => p.available).length;
    const inactive = total - active;
    return { total, active, inactive };
  };

  const stats = getPackageStats();

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
            {t('packages.managePackages', 'Manage Packages')}
          </h2>
          <p className="text-muted-foreground">
            {t('packages.manageDescription', 'Create and manage your package offerings')}
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('packages.addPackage', 'Add Package')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalPackages', 'Total Packages')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.activePackages', 'Active Packages')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.inactivePackages', 'Inactive Packages')}
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
            {t('packages.filtersAndSearch', 'Filters & Search')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('packages.searchPackages', 'Search packages...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('packages.selectCategory', 'Select category')} />
              </SelectTrigger>
              <SelectContent>
                {PACKAGE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all'
                      ? t('packages.allCategories', 'All Categories')
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

      {/* Packages List */}
      {filteredPackages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || selectedCategory !== 'all'
                  ? t('packages.noPackagesFound', 'No packages found')
                  : t('packages.noPackages', 'No packages yet')
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? t('packages.tryDifferentSearch', 'Try adjusting your search or filters')
                  : t('packages.createFirstPackage', 'Create your first package to get started')
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('packages.addFirstPackage', 'Add Your First Package')}
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
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg._id}
              package={pkg}
              onEdit={handleEditPackage}
              onDelete={handleDeletePackage}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      )}

      {/* Add Package Modal */}
      <AddPackageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPackageAdded={async () => {
          await fetchPackages();
          if (onDataUpdated) {
            onDataUpdated();
          }
        }}
      />

      {/* Edit Package Modal */}
      <EditPackageModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        package={selectedPackage}
        onPackageUpdated={async () => {
          await fetchPackages();
          if (onDataUpdated) {
            onDataUpdated();
          }
        }}
      />
    </div>
  );
}
