import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff, Star, Tag, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Package } from '@/services/api';
import { autoTranslate } from '@/utils/autoTranslate';
import { getImageUrl } from '@/utils/imageUtils';

interface PackageCardProps {
  package: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (packageId: string) => void;
  onToggleAvailability: (packageId: string, isAvailable: boolean) => void;
}

export default function PackageCard({
  package: pkg,
  onEdit,
  onDelete,
  onToggleAvailability
}: PackageCardProps) {
  const { t, i18n } = useTranslation();

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      dj: 'bg-purple-100 text-purple-800',
      photography: 'bg-blue-100 text-blue-800',
      catering: 'bg-green-100 text-green-800',
      location: 'bg-indigo-100 text-indigo-800',
      security: 'bg-red-100 text-red-800',
      scenery: 'bg-pink-100 text-pink-800',
      sounds_lights: 'bg-yellow-100 text-yellow-800',
      bar: 'bg-orange-100 text-orange-800',
      first_aid: 'bg-red-100 text-red-800',
      musicians: 'bg-purple-100 text-purple-800',
      insurance: 'bg-slate-100 text-slate-800',
      transportation: 'bg-cyan-100 text-cyan-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const formatPrice = (price: any) => {
    if (typeof price === 'object' && price !== null) {
      return `${price.currency || '$'}${price.amount || 0}`;
    }
    return `$${price || 0}`;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${!pkg.available ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {autoTranslate(pkg.name, i18n.language)}
              </CardTitle>
              {pkg.isPopular && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {t('packages.popular', 'Popular')}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1 line-clamp-2">
              {autoTranslate(pkg.description, i18n.language)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge className={getCategoryColor(pkg.category)}>
              {t(`categories.${pkg.category}`, pkg.category)}
            </Badge>
            {!pkg.available && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {t('packages.unavailable', 'Unavailable')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Package Image */}
        {(pkg.imageUrl || pkg.image) && (
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={getImageUrl(pkg.imageUrl || pkg.image) || '/placeholder.svg'}
              alt={pkg.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="text-lg font-bold text-green-600">
            {formatPrice(pkg.price)}
          </span>
          {pkg.duration && (
            <span className="text-sm text-muted-foreground">
              / {pkg.duration} {t('packages.hours', 'hours')}
            </span>
          )}
        </div>

        {/* Rating */}
        {pkg.rating && pkg.rating.count > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{pkg.rating.average.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({pkg.rating.count} {t('packages.reviews', 'reviews')})
            </span>
          </div>
        )}

        {/* Features */}
        {pkg.features && pkg.features.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">{t('packages.features', 'Features')}:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {pkg.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span className="line-clamp-1">{autoTranslate(feature, i18n.language)}</span>
                </li>
              ))}
              {pkg.features.length > 3 && (
                <li className="text-xs text-muted-foreground italic">
                  +{pkg.features.length - 3} {t('packages.moreFeatures', 'more features')}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Availability */}
        {pkg.availability && (
          <div className="p-3 bg-muted/30 dark:bg-muted/20 rounded-lg space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('packages.availability', 'Availability')}
            </p>
            {pkg.availability.days && pkg.availability.days.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {pkg.availability.days.map((day: string) => (
                  <Badge key={day} variant="outline" className="text-xs">
                    {t(`days.${day}`, day)}
                  </Badge>
                ))}
              </div>
            )}
            {pkg.availability.hours && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="truncate">
                  {pkg.availability.hours.start} - {pkg.availability.hours.end}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(pkg)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {t('common.edit', 'Edit')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAvailability(pkg._id, !pkg.available)}
            className="flex items-center gap-2"
          >
            {pkg.available ? (
              <>
                <EyeOff className="h-4 w-4" />
                {t('packages.disable', 'Disable')}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                {t('packages.enable', 'Enable')}
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(pkg._id)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t('common.delete', 'Delete')}
          </Button>
        </div>

        {/* Package Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            {t('packages.views', 'Views')}: {pkg.views || 0}
          </span>
          <span>
            {t('packages.created', 'Created')}: {new Date(pkg.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
