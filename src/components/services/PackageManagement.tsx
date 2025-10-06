import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Package, Star, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import apiService, { type Service, type PackageData } from '@/services/api';
import ImageUpload from '@/components/events/create/form-components/ImageUpload';

interface PackageManagementProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onPackagesUpdated: () => void;
}

interface PackageFormData extends PackageData {
  _id?: string;
  image?: File | null;
}

// Helper functions for localStorage image management
const PACKAGE_IMAGES_KEY = 'package_images';

const savePackageImage = (serviceId: string, packageId: string, imageDataUrl: string) => {
  try {
    const images = JSON.parse(localStorage.getItem(PACKAGE_IMAGES_KEY) || '{}');
    const key = `${serviceId}_${packageId}`;
    images[key] = imageDataUrl;
    localStorage.setItem(PACKAGE_IMAGES_KEY, JSON.stringify(images));
  } catch (error) {
    console.error('Error saving package image:', error);
  }
};

const getPackageImage = (serviceId: string, packageId: string): string | null => {
  try {
    const images = JSON.parse(localStorage.getItem(PACKAGE_IMAGES_KEY) || '{}');
    const key = `${serviceId}_${packageId}`;
    return images[key] || null;
  } catch (error) {
    console.error('Error getting package image:', error);
    return null;
  }
};

const deletePackageImage = (serviceId: string, packageId: string) => {
  try {
    const images = JSON.parse(localStorage.getItem(PACKAGE_IMAGES_KEY) || '{}');
    const key = `${serviceId}_${packageId}`;
    delete images[key];
    localStorage.setItem(PACKAGE_IMAGES_KEY, JSON.stringify(images));
  } catch (error) {
    console.error('Error deleting package image:', error);
  }
};

export default function PackageManagement({ isOpen, onClose, service, onPackagesUpdated }: PackageManagementProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageFormData | null>(null);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    price: 0,
    features: [],
    duration: 0,
    isPopular: false,
    image: null
  });
  const [packageImages, setPackageImages] = useState<Record<string, string>>({});

  // Load package images from localStorage when service changes
  useEffect(() => {
    if (service) {
      const images: Record<string, string> = {};
      service.packages?.forEach(pkg => {
        const imageUrl = getPackageImage(service._id, pkg._id);
        if (imageUrl) {
          images[pkg._id] = imageUrl;
        }
      });
      setPackageImages(images);
    }
  }, [service]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      features: [],
      duration: 0,
      isPopular: false,
      image: null
    });
    setEditingPackage(null);
    setIsAddingPackage(false);
    setNewFeature('');
  };

  const handleEditPackage = (pkg: Service['packages'][0]) => {
    setFormData({
      _id: pkg._id,
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      features: pkg.features || [],
      duration: pkg.duration || 0,
      isPopular: pkg.isPopular || false,
      image: null // Will be loaded from localStorage via preview
    });
    setEditingPackage(pkg);
    setIsAddingPackage(true);
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features?.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter(feature => feature !== featureToRemove) || []
    }));
  };

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service || !formData.name || formData.price <= 0) {
      toast({
        title: t('common.error', 'Error'),
        description: t('packages.fillRequiredFields', 'Please fill in all required fields'),
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      let packageId: string;
      
      if (editingPackage && formData._id) {
        // Update existing package - exclude _id and image from request body
        const { _id, image, ...packageDataWithoutId } = formData;
        await apiService.updateServicePackage(service._id, _id, packageDataWithoutId);
        packageId = _id;
        
        toast({
          title: t('common.success', 'Success'),
          description: t('packages.packageUpdated', 'Package updated successfully')
        });
      } else {
        // Add new package - exclude _id and image from request body
        const { _id, image, ...packageDataWithoutId } = formData;
        const response = await apiService.addPackageToService(service._id, packageDataWithoutId);
        
        // Extract package ID from response
        // The response structure may vary, so we try different possible locations
        const responseData = response.data as Record<string, unknown>;
        const pkgData = responseData?.package as { _id?: string } | undefined;
        const packagesArray = responseData?.packages as Array<{ _id?: string }> | undefined;
        
        packageId = pkgData?._id || 
                   (responseData?._id as string) || 
                   (packagesArray && packagesArray.length > 0 ? packagesArray[packagesArray.length - 1]?._id : undefined) || 
                   '';
        
        if (!packageId) {
          console.warn('Could not extract package ID from response, image will not be saved');
        }
        
        toast({
          title: t('common.success', 'Success'),
          description: t('packages.packageAdded', 'Package added successfully')
        });
      }
      
      // Save image to localStorage if provided
      if (formData.image && packageId) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageDataUrl = reader.result as string;
          savePackageImage(service._id, packageId, imageDataUrl);
          
          // Update local state
          setPackageImages(prev => ({
            ...prev,
            [packageId]: imageDataUrl
          }));
        };
        reader.readAsDataURL(formData.image);
      }
      
      onPackagesUpdated();
      resetForm();
    } catch (error) {
      console.error('Error saving package:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('packages.saveError', 'Failed to save package'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!service || !confirm(t('packages.confirmDelete', 'Are you sure you want to delete this package?'))) {
      return;
    }

    setIsLoading(true);
    try {
      await apiService.deleteServicePackage(service._id, packageId);
      
      // Delete image from localStorage
      deletePackageImage(service._id, packageId);
      
      // Update local state
      setPackageImages(prev => {
        const newImages = { ...prev };
        delete newImages[packageId];
        return newImages;
      });
      
      toast({
        title: t('common.success', 'Success'),
        description: t('packages.packageDeleted', 'Package deleted successfully')
      });
      onPackagesUpdated();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('packages.deleteError', 'Failed to delete package'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('packages.managePackages', 'Manage Packages')} - {service.title}
          </DialogTitle>
          <DialogDescription>
            {t('packages.manageDescription', 'Add and manage packages for this service')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Package Form */}
          {isAddingPackage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {editingPackage 
                    ? t('packages.editPackage', 'Edit Package')
                    : t('packages.addNewPackage', 'Add New Package')
                  }
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPackage} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="packageName">{t('packages.name', 'Package Name')} *</Label>
                      <Input
                        id="packageName"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('packages.namePlaceholder', 'Enter package name')}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="packagePrice">{t('packages.price', 'Price')} *</Label>
                   <Input
  id="packagePrice"
  type="number"
  min="0"
  step="0.01"
  value={formData.price === 0 ? '' : formData.price}
  onChange={(e) => {
    const value = e.target.value;
    if (value === '') {
      setFormData(prev => ({ ...prev, price: 0 }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setFormData(prev => ({ ...prev, price: numValue }));
      }
    }
  }}
  onBlur={(e) => {
    if (e.target.value === '') {
      setFormData(prev => ({ ...prev, price: 0 }));
    }
  }}
  placeholder="0.00"
  required
/>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="packageDescription">{t('packages.description', 'Description')}</Label>
                    <Textarea
                      id="packageDescription"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('packages.descriptionPlaceholder', 'Describe what this package includes')}
                      rows={3}
                    />
                  </div>

                  {/* Package Image Upload */}
                  <div>
                    <ImageUpload
                      label={t('packages.image', 'Package Image')}
                      value={formData.image}
                      onChange={(file) => setFormData(prev => ({ ...prev, image: file }))}
                    />
                    {editingPackage && formData._id && packageImages[formData._id] && !formData.image && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('packages.currentImage', 'Current Image')}:
                        </p>
                        <div className="relative rounded-lg overflow-hidden border-2 border-border w-full max-w-xs">
                          <img
                            src={packageImages[formData._id]}
                            alt={formData.name}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="packageDuration">{t('packages.duration', 'Duration (hours)')}</Label>
                             <Input
  id="packageDuration"
  type="number"
  min="0"
  value={formData.duration === 0 ? '' : formData.duration}
  onChange={(e) => {
    const value = e.target.value;
    if (value === '') {
      setFormData(prev => ({ ...prev, duration: 0 }));
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setFormData(prev => ({ ...prev, duration: numValue }));
      }
    }
  }}
  onBlur={(e) => {
    if (e.target.value === '') {
      setFormData(prev => ({ ...prev, duration: 0 }));
    }
  }}
  placeholder={t('packages.durationPlaceholder', 'Duration in hours')}
/>
                  </div>

                  {/* Features */}
                  <div>
                    <Label>{t('packages.features', 'Features')}</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder={t('packages.addFeature', 'Add feature')}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      />
                      <Button type="button" onClick={handleAddFeature} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.features && formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {feature}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveFeature(feature)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Popular Package Toggle */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPopular"
                      checked={formData.isPopular}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked }))}
                    />
                    <Label htmlFor="isPopular" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {t('packages.markAsPopular', 'Mark as popular package')}
                    </Label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading 
                        ? t('common.saving', 'Saving...') 
                        : editingPackage 
                          ? t('packages.updatePackage', 'Update Package')
                          : t('packages.addPackage', 'Add Package')
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Add Package Button */}
          {!isAddingPackage && (
            <div className="flex justify-center">
              <Button onClick={() => setIsAddingPackage(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('packages.addNewPackage', 'Add New Package')}
              </Button>
            </div>
          )}

          {/* Existing Packages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t('packages.existingPackages', 'Existing Packages')} ({service.packages?.length || 0})
            </h3>
            
            {!service.packages || service.packages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h4 className="text-lg font-semibold mb-2">
                    {t('packages.noPackages', 'No packages yet')}
                  </h4>
                  <p className="text-muted-foreground text-center mb-4">
                    {t('packages.noPackagesDescription', 'Create packages to offer different service options to your clients')}
                  </p>
                  <Button onClick={() => setIsAddingPackage(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('packages.createFirstPackage', 'Create Your First Package')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.packages.map((pkg) => (
                  <Card key={pkg._id} className="relative">
                    {pkg.isPopular && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {t('packages.popular', 'Popular')}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Package Image */}
                    {packageImages[pkg._id] && (
                      <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={packageImages[pkg._id]}
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{pkg.name}</span>
                        <span className="text-lg font-bold text-primary">
                          {service.price.currency} {pkg.price}
                        </span>
                      </CardTitle>
                      {pkg.description && (
                        <CardDescription>{pkg.description}</CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {pkg.duration && (
                        <div className="text-sm text-muted-foreground">
                          {t('packages.duration', 'Duration')}: {pkg.duration} {t('packages.hours', 'hours')}
                        </div>
                      )}
                      
                      {pkg.features && pkg.features.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">{t('packages.features', 'Features')}:</h5>
                          <div className="flex flex-wrap gap-1">
                            {pkg.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPackage(pkg)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          {t('common.edit', 'Edit')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePackage(pkg._id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('common.delete', 'Delete')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
