import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff, Package, MapPin, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Service } from '@/services/api';
import { autoTranslate } from '@/utils/autoTranslate';
import { getImageUrl } from '@/utils/imageUtils';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onToggleAvailability: (serviceId: string, isAvailable: boolean) => void;
  onManagePackages: (service: Service) => void;
}

export default function ServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleAvailability,
  onManagePackages
}: ServiceCardProps) {
  const { t, i18n } = useTranslation();

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      photography: 'bg-blue-100 text-blue-800',
      videography: 'bg-purple-100 text-purple-800',
      catering: 'bg-green-100 text-green-800',
      music: 'bg-yellow-100 text-yellow-800',
      decoration: 'bg-pink-100 text-pink-800',
      transportation: 'bg-indigo-100 text-indigo-800',
      security: 'bg-red-100 text-red-800',
      lighting: 'bg-orange-100 text-orange-800',
      sound: 'bg-cyan-100 text-cyan-800',
      furniture: 'bg-brown-100 text-brown-800',
      tents: 'bg-gray-100 text-gray-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors.other;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${!service.available ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {autoTranslate(service.title, i18n.language)}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {autoTranslate(service.description, i18n.language)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge className={getCategoryColor(service.category)}>
              {t(`categories.${service.category}`, service.category)}
            </Badge>
            {!service.available && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {t('services.unavailable', 'Unavailable')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Image */}
        {service.image && (
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={getImageUrl(service.image) || '/placeholder.svg'}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Rating */}
        {service.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{service.rating.average.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({service.rating.count})
            </span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{autoTranslate(service.location.city, i18n.language)}</span>
          {service.location.serviceRadius && (
            <span>• {service.location.serviceRadius}km radius</span>
          )}
        </div>

        {/* Packages Count */}
        {service.packages && service.packages.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>
              {service.packages.length} {t('services.packages', 'packages')}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(service)}
            className="flex items-center gap-2"
            disabled={!service.available}
            title={!service.available ? t('services.enableToEdit', 'Enable the service to edit') : ''}
          >
            <Edit className="h-4 w-4" />
            {t('common.edit', 'Edit')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onManagePackages(service)}
            className="flex items-center gap-2"
            disabled={!service.available}
            title={!service.available ? t('services.enableToManagePackages', 'Enable the service to manage packages') : ''}
          >
            <Package className="h-4 w-4" />
            {t('services.managePackages', 'Packages')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAvailability(service._id, !service.available)}
            className="flex items-center gap-2"
          >
            {service.available ? (
              <>
                <EyeOff className="h-4 w-4" />
                {t('services.disable', 'Disable')}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                {t('services.enable', 'Enable')}
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(service._id)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t('common.delete', 'Delete')}
          </Button>
        </div>

        {/* Service Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            {t('services.views', 'Views')}: {service.views || 0}
          </span>
          <span>
            {t('services.created', 'Created')}: {new Date(service.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
