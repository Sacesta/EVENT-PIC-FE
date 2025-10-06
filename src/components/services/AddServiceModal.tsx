import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, MapPin, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import apiService, { type ServiceData } from '@/services/api';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
}

const SERVICE_CATEGORIES = [
  'photography', 'videography', 'catering', 'music', 
  'decoration', 'transportation', 'security', 'lighting',
  'sound', 'furniture', 'tents', 'other'
];

const PRICING_TYPES = ['fixed', 'per_hour', 'per_person', 'negotiable'];
const CURRENCIES = ['ILS', 'USD', 'EUR'];
const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'expert'];

export default function AddServiceModal({ isOpen, onClose, onServiceAdded }: AddServiceModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<ServiceData>({
    title: '',
    description: '',
    category: '',
    subcategories: [],
    price: {
      amount: 0,
      currency: 'ILS',
      pricingType: 'fixed'
    },
    packages: [],
    location: {
      city: ''
    },
    experience: 'intermediate',
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');

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

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addSubcategory = () => {
    if (newSubcategory.trim() && !formData.subcategories?.includes(newSubcategory.trim())) {
      setFormData(prev => ({
        ...prev,
        subcategories: [...(prev.subcategories || []), newSubcategory.trim()]
      }));
      setNewSubcategory('');
    }
  };

  const removeSubcategory = (subcategoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories?.filter(sub => sub !== subcategoryToRemove) || []
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

    // City is required
    if (!formData.location.city?.trim()) {
      errors.push('City is required');
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
      description: formData.description.trim(),
      location: {
        ...formData.location,
        city: formData.location.city.trim()
      }
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
        subcategories: [],
        price: {
          amount: 0,
          currency: 'ILS',
          pricingType: 'fixed'
        },
        packages: [],
        location: {
          city: ''
        },
        experience: 'intermediate',
        tags: []
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

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="experience">{t('services.experience', 'Experience Level')}</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {t(`experience.${level}`, level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subcategories */}
              <div>
                <Label>{t('services.subcategories', 'Subcategories')}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    placeholder={t('services.addSubcategory', 'Add subcategory')}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategory())}
                  />
                  <Button type="button" onClick={addSubcategory} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.subcategories && formData.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.subcategories.map((subcategory, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {subcategory}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSubcategory(subcategory)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('services.location', 'Location')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="city">{t('services.city', 'City')} *</Label>
                <Input
                  id="city"
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  placeholder={t('services.cityPlaceholder', 'Enter your city')}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('services.tags', 'Tags')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={t('services.addTag', 'Add tag')}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
