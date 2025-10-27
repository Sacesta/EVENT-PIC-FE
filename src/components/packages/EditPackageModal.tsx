import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { X, DollarSign, Edit, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import apiService, { type Package, type PackageData } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';

interface EditPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package | null;
  onPackageUpdated: () => void;
}

const ALL_PACKAGE_CATEGORIES = [
  'dj', 'security', 'scenery', 'sounds_lights', 'catering', 'bar',
  'first_aid', 'musicians', 'insurance', 'photography', 'location', 'transportation', 'other'
];

const PRICING_TYPES = ['fixed', 'per_hour', 'starting_from', 'negotiable'];
const CURRENCIES = ['ILS', 'USD', 'EUR'];
const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Form data type that uses File instead of string for image
type PackageFormData = {
  name?: string;
  description?: string;
  category?: string;
  price?: {
    amount: number;
    currency: string;
    pricingType: string;
    minPrice?: number;
    maxPrice?: number;
  };
  duration?: number;
  isPopular?: boolean;
  image?: File;
  availability?: {
    days?: string[];
    hours?: {
      start: string;
      end: string;
    };
  };
};

export default function EditPackageModal({ isOpen, onClose, package: pkg, onPackageUpdated }: EditPackageModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Filter categories based on supplier's registered categories
  const supplierCategories = user?.supplierDetails?.categories || [];
  const PACKAGE_CATEGORIES = supplierCategories.length > 0
    ? ALL_PACKAGE_CATEGORIES.filter(cat => supplierCategories.includes(cat))
    : ALL_PACKAGE_CATEGORIES;

  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    category: '',
    price: {
      amount: 0,
      currency: 'ILS',
      pricingType: 'fixed'
    },
    duration: 0,
    isPopular: false,
    image: undefined,
    availability: {
      days: [],
      hours: {
        start: '09:00',
        end: '17:00'
      }
    }
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);

  // Populate form when package changes
  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name || '',
        description: pkg.description || '',
        category: pkg.category || '',
        price: pkg.price || {
          amount: 0,
          currency: 'ILS',
          pricingType: 'fixed'
        },
        duration: pkg.duration || 0,
        isPopular: pkg.isPopular || false,
        image: undefined,
        availability: pkg.availability || {
          days: [],
          hours: {
            start: '09:00',
            end: '17:00'
          }
        }
      });
      // Set existing image if available (prefer imageUrl for full URL)
      if (pkg.imageUrl || pkg.image) {
        setImagePreview(pkg.imageUrl || pkg.image);
      } else {
        setImagePreview(null);
      }
      setShouldRemoveImage(false);
    }
  }, [pkg]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PackageFormData] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setShouldRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: undefined
    }));
    setImagePreview(null);
    setShouldRemoveImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pkg) return;

    // Validation
    const errors = [];

    if (formData.description && formData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    } else if (formData.description && formData.description.trim().length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }

    if (formData.name && formData.name.trim().length < 2) {
      errors.push('Package name must be at least 2 characters');
    } else if (formData.name && formData.name.trim().length > 200) {
      errors.push('Package name must be less than 200 characters');
    }

    if (formData.price && formData.price.amount < 0) {
      errors.push('Price must be 0 or greater');
    }

    if (errors.length > 0) {
      toast({
        title: t('common.error', 'Error'),
        description: errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    // Clean the data before sending
    const cleanedData: Omit<Partial<PackageData>, 'image'> & { image?: File | null } = {};

    if (formData.name?.trim()) cleanedData.name = formData.name.trim();
    if (formData.description?.trim()) cleanedData.description = formData.description.trim();
    if (formData.category) cleanedData.category = formData.category;
    if (formData.price) cleanedData.price = formData.price;
    if (formData.duration !== undefined) cleanedData.duration = formData.duration;
    if (formData.isPopular !== undefined) cleanedData.isPopular = formData.isPopular;

    // Handle image update/removal
    if (formData.image) {
      cleanedData.image = formData.image;
    } else if (shouldRemoveImage) {
      // Send null to indicate image should be removed
      cleanedData.image = null;
    }

    console.log('Updating package with data:', cleanedData, 'shouldRemoveImage:', shouldRemoveImage);

    setIsLoading(true);
    try {
      // Update package using new /packages backend endpoint
      const response = await apiService.updatePackage(pkg._id, cleanedData as Partial<PackageData> & { image?: File });
      console.log('Package update response:', response);

      toast({
        title: t('common.success', 'Success'),
        description: t('packages.packageUpdated', 'Package updated successfully')
      });
      onPackageUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating package:', error);

      // Parse error message for better user feedback
      let errorMessage = t('packages.updateError', 'Failed to update package. Please try again.');
      try {
        const errorData = JSON.parse((error as Error).message);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        }
      } catch {
        // Use default error message
      }

      toast({
        title: t('common.error', 'Error'),
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!pkg) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {t('packages.editPackage', 'Edit Package')} - {pkg.name}
          </DialogTitle>
          <DialogDescription>
            {t('packages.editPackageDescription', 'Update your package information')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('packages.basicInfo', 'Basic Information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">{t('packages.name', 'Package Name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('packages.namePlaceholder', 'Enter package name')}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">{t('packages.description', 'Description')} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('packages.descriptionPlaceholder', 'Describe your package in detail')}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">{t('packages.image', 'Package Image')}</Label>
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Package preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {t('common.remove', 'Remove')}
                      </Button>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label htmlFor="image">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute bottom-2 right-2"
                          asChild
                        >
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-1" />
                            {t('packages.changeImage', 'Change Image')}
                          </span>
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label htmlFor="image">
                        <Button type="button" variant="outline" className="mb-2" asChild>
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            {t('packages.uploadImage', 'Upload Image')}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('packages.imageHint', 'PNG, JPG up to 3MB')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="category">{t('packages.category', 'Category')} *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('packages.selectCategory', 'Select category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(`categories.${category}`, category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t('packages.pricingInfo', 'Pricing Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="amount">{t('packages.price', 'Price')} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price?.amount}
                    onChange={(e) => handleInputChange('price.amount', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">{t('packages.currency', 'Currency')}</Label>
                  <Select value={formData.price?.currency} onValueChange={(value) => handleInputChange('price.currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricingType">{t('packages.pricingType', 'Pricing Type')}</Label>
                  <Select value={formData.price?.pricingType} onValueChange={(value) => handleInputChange('price.pricingType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`pricing.${type}`, type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">{t('packages.duration', 'Duration (hours)')}</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('packages.additionalSettings', 'Additional Settings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPopular">{t('packages.markAsPopular', 'Mark as Popular')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('packages.popularDescription', 'Popular packages are highlighted to customers')}
                  </p>
                </div>
                <Switch
                  id="isPopular"
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => handleInputChange('isPopular', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('packages.availability', 'Availability')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Days of Week */}
              <div className="space-y-2">
                <Label>{t('packages.availableDays', 'Available Days')}</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const currentDays = formData.availability?.days || [];
                        const newDays = currentDays.includes(day)
                          ? currentDays.filter(d => d !== day)
                          : [...currentDays, day];
                        setFormData({
                          ...formData,
                          availability: {
                            ...formData.availability,
                            days: newDays,
                            hours: formData.availability?.hours || { start: '09:00', end: '17:00' }
                          }
                        });
                      }}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.availability?.days?.includes(day)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {t(`days.${day}`, day.charAt(0).toUpperCase() + day.slice(1, 3))}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">{t('packages.startTime', 'Start Time')}</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.availability?.hours?.start || '09:00'}
                    onChange={(e) => setFormData({
                      ...formData,
                      availability: {
                        ...formData.availability,
                        days: formData.availability?.days || [],
                        hours: {
                          start: e.target.value,
                          end: formData.availability?.hours?.end || '17:00'
                        }
                      }
                    })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">{t('packages.endTime', 'End Time')}</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.availability?.hours?.end || '17:00'}
                    onChange={(e) => setFormData({
                      ...formData,
                      availability: {
                        ...formData.availability,
                        days: formData.availability?.days || [],
                        hours: {
                          start: formData.availability?.hours?.start || '09:00',
                          end: e.target.value
                        }
                      }
                    })}
                    className="w-full"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {t('packages.availabilityHint', 'Set your general availability. This helps customers know when you\'re typically available for bookings.')}
              </p>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.updating', 'Updating...') : t('packages.updatePackage', 'Update Package')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
