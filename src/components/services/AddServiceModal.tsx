import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Plus, X, MapPin, DollarSign, ChevronDown, Package, Upload, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import apiService, { type ServiceData, type PackageData } from '@/services/api';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
}

const SERVICE_CATEGORIES = [
  'dj', 'security', 'scenery', 'sounds_lights', 'catering', 'bar',
  'first_aid', 'musicians', 'insurance', 'photography', 'location', 'transportation' ,"other"
];

const PRICING_TYPES = ['fixed', 'per_hour', 'per_person', 'negotiable'];
const CURRENCIES = ['ILS', 'USD', 'EUR'];

export default function AddServiceModal({ isOpen, onClose, onServiceAdded }: AddServiceModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<ServiceData>({
    title: '',
    description: '',
    category: '',
    price: {
      amount: 0,
      currency: 'ILS',
      pricingType: 'fixed'
    },
    packages: []
  });

  const [isPackagesSectionOpen, setIsPackagesSectionOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<PackageData>({
    name: '',
    description: '',
    price: 0,
    features: [],
    duration: 0,
    isPopular: false
  });
  const [newFeature, setNewFeature] = useState('');
  const [currentPackageImage, setCurrentPackageImage] = useState<File | null>(null);
  const [currentPackageImagePreview, setCurrentPackageImagePreview] = useState<string>('');

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ServiceData] as object),
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

  const handleAddFeature = () => {
    if (newFeature.trim() && !currentPackage.features?.includes(newFeature.trim())) {
      setCurrentPackage(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setCurrentPackage(prev => ({
      ...prev,
      features: prev.features?.filter(feature => feature !== featureToRemove) || []
    }));
  };

  const handlePackageImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (3MB limit)
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: t('common.error', 'Error'),
          description: 'Image size must be less than 3MB',
          variant: 'destructive'
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('common.error', 'Error'),
          description: 'Only image files are allowed',
          variant: 'destructive'
        });
        return;
      }

      setCurrentPackageImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentPackageImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePackageImage = () => {
    setCurrentPackageImage(null);
    setCurrentPackageImagePreview('');
  };

  const handleAddPackage = () => {
    if (!currentPackage.name || currentPackage.price <= 0) {
      toast({
        title: t('common.error', 'Error'),
        description: 'Package name and price are required',
        variant: 'destructive'
      });
      return;
    }

    // Store the package with image data
    const packageWithImage = {
      ...currentPackage,
      imageFile: currentPackageImage,
      imagePreview: currentPackageImagePreview
    };

    setFormData(prev => ({
      ...prev,
      packages: [...(prev.packages || []), packageWithImage]
    }));

    // Reset current package and image
    setCurrentPackage({
      name: '',
      description: '',
      price: 0,
      features: [],
      duration: 0,
      isPopular: false
    });
    setCurrentPackageImage(null);
    setCurrentPackageImagePreview('');

    toast({
      title: t('common.success', 'Success'),
      description: 'Package added to service'
    });
  };

  const handleRemovePackage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation matching backend Joi schema requirements
    const errors = [];
    
    // Title is optional in backend, but if provided must be 2-200 chars
    if (formData.title?.trim() && formData.title.trim().length < 2) {
      errors.push('Title must be at least 2 characters');
    } else if (formData.title?.trim() && formData.title.trim().length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    // Description is required and must be 10-2000 chars
    if (!formData.description?.trim()) {
      errors.push('Description is required');
    } else if (formData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    } else if (formData.description.trim().length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }

    // Category is required
    if (!formData.category) {
      errors.push('Category is required');
    }

    // Price amount must be >= 0
    if (formData.price.amount < 0) {
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
    const cleanedData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim()
    };

    console.log('Submitting service data:', cleanedData);

    setIsLoading(true);
    try {
      const response = await apiService.createService(cleanedData);
      console.log('Service creation response:', response);
      
      toast({
        title: t('common.success', 'Success'),
        description: t('services.serviceCreated', 'Service created successfully')
      });
      onServiceAdded();
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        price: {
          amount: 0,
          currency: 'ILS',
          pricingType: 'fixed'
        },
        packages: []
      });
    } catch (error) {
      console.error('Error creating service:', error);
      
      // Parse error message for better user feedback
      let errorMessage = t('services.createError', 'Failed to create service. Please try again.');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('services.addNewService', 'Add New Service')}
          </DialogTitle>
          <DialogDescription>
            {t('services.addServiceDescription', 'Create a new service offering for your clients')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('services.basicInfo', 'Basic Information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">{t('services.title', 'Service Title')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('services.titlePlaceholder', 'Enter service title')}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">{t('services.description', 'Description')} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('services.descriptionPlaceholder', 'Describe your service in detail')}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">{t('services.category', 'Category')} *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('services.selectCategory', 'Select category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(`categories.${category}`, category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Packages Section - Collapsible */}
          <Collapsible open={isPackagesSectionOpen} onOpenChange={setIsPackagesSectionOpen}>
            <Card>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {t('services.packages', 'Packages')} {formData.packages && formData.packages.length > 0 && `(${formData.packages.length})`}
                    </CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isPackagesSectionOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* Current Packages List */}
                  {formData.packages && formData.packages.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <Label>{t('packages.addedPackages', 'Added Packages')}</Label>
                      {formData.packages.map((pkg, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          {(pkg as any).imagePreview && (
                            <img
                              src={(pkg as any).imagePreview}
                              alt={pkg.name}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold">{pkg.name}</div>
                            <div className="text-sm text-muted-foreground">{pkg.description}</div>
                            <div className="text-sm font-bold text-primary">${pkg.price}</div>
                            {pkg.features && pkg.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {pkg.features.map((feature, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePackage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Package Form */}
                  <div className="space-y-4 pt-4 border-t">
                    <Label className="text-base font-semibold">{t('packages.addNewPackage', 'Add New Package')}</Label>

                    <div>
                      <Label htmlFor="packageName">{t('packages.name', 'Package Name')} *</Label>
                      <Input
                        id="packageName"
                        value={currentPackage.name}
                        onChange={(e) => setCurrentPackage(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('packages.namePlaceholder', 'e.g., Basic Package')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="packageDescription">{t('packages.description', 'Description')}</Label>
                      <Textarea
                        id="packageDescription"
                        value={currentPackage.description}
                        onChange={(e) => setCurrentPackage(prev => ({ ...prev, description: e.target.value }))}
                        placeholder={t('packages.descriptionPlaceholder', 'Describe what this package includes')}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="packagePrice">{t('packages.price', 'Price')} *</Label>
                        <Input
                          id="packagePrice"
                          type="number"
                          min="0"
                          value={currentPackage.price}
                          onChange={(e) => setCurrentPackage(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="packageDuration">{t('packages.duration', 'Duration (hours)')}</Label>
                        <Input
                          id="packageDuration"
                          type="number"
                          min="0"
                          value={currentPackage.duration}
                          onChange={(e) => setCurrentPackage(prev => ({ ...prev, duration: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    {/* Package Image Upload */}
                    <div>
                      <Label htmlFor="packageImage">{t('packages.image', 'Package Image')}</Label>
                      <div className="mt-2">
                        {currentPackageImagePreview ? (
                          <div className="relative inline-block">
                            <img
                              src={currentPackageImagePreview}
                              alt="Package preview"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2"
                              onClick={handleRemovePackageImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              id="packageImage"
                              type="file"
                              accept="image/*"
                              onChange={handlePackageImageChange}
                              className="hidden"
                            />
                            <label htmlFor="packageImage">
                              <Button
                                type="button"
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => document.getElementById('packageImage')?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {t('packages.uploadImage', 'Upload Image')}
                              </Button>
                            </label>
                            <span className="text-sm text-muted-foreground">
                              {t('packages.maxSize', 'Max 3MB')}
                            </span>
                          </div>
                        )}
                      </div>
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
                      {currentPackage.features && currentPackage.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentPackage.features.map((feature, index) => (
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

                    {/* Is Popular Switch */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isPopular">{t('packages.markAsPopular', 'Mark as Popular')}</Label>
                      <Switch
                        id="isPopular"
                        checked={currentPackage.isPopular}
                        onCheckedChange={(checked) => setCurrentPackage(prev => ({ ...prev, isPopular: checked }))}
                      />
                    </div>

                    <Button type="button" onClick={handleAddPackage} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('packages.addPackage', 'Add Package')}
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.creating', 'Creating...') : t('services.createService', 'Create Service')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
