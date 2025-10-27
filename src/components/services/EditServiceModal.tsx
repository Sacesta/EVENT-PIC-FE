import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, MapPin, DollarSign, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import apiService, { type Service, type ServiceData } from '@/services/api';

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onServiceUpdated: () => void;
}

const SERVICE_CATEGORIES = [
  'dj', 'security', 'scenery', 'sounds_lights', 'catering', 'bar',
  'first_aid', 'musicians', 'insurance', 'photography', 'location', 'transportation', "other"
];

const PRICING_TYPES = ['fixed', 'per_hour', 'starting_from', 'negotiable'];
const CURRENCIES = ['ILS', 'USD', 'EUR'];

export default function EditServiceModal({ isOpen, onClose, service, onServiceUpdated }: EditServiceModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<ServiceData>>({
    title: '',
    description: '',
    category: ''
  });

  // Populate form when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        category: service.category || ''
      });
    }
  }, [service]);

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service) return;

    // Enhanced validation matching backend requirements
    const errors = [];
    
    if (formData.description && formData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    } else if (formData.description && formData.description.trim().length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }

    if (formData.title && formData.title.trim().length < 2) {
      errors.push('Title must be at least 2 characters');
    } else if (formData.title && formData.title.trim().length > 200) {
      errors.push('Title must be less than 200 characters');
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
    const cleanedData: Partial<ServiceData> = {};

    if (formData.title?.trim()) cleanedData.title = formData.title.trim();
    if (formData.description?.trim()) cleanedData.description = formData.description.trim();
    if (formData.category) cleanedData.category = formData.category;

    console.log('Updating service with data:', cleanedData);

    setIsLoading(true);
    try {
      const response = await apiService.updateService(service._id, cleanedData);
      console.log('Service update response:', response);
      
      toast({
        title: t('common.success', 'Success'),
        description: t('services.serviceUpdated', 'Service updated successfully')
      });
      onServiceUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating service:', error);
      
      // Parse error message for better user feedback
      let errorMessage = t('services.updateError', 'Failed to update service. Please try again.');
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

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {t('services.editService', 'Edit Service')} - {service.title}
          </DialogTitle>
          <DialogDescription>
            {t('services.editServiceDescription', 'Update your service information')}
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
                <Label htmlFor="title">{t('services.title', 'Service Title')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('services.titlePlaceholder', 'Enter service title')}
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
                <Label htmlFor="category">{t('services.category', 'Category')}</Label>
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

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.updating', 'Updating...') : t('services.updateService', 'Update Service')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
