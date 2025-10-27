import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertCircle, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { POPULAR_LOCATIONS } from '../constants';
import { MapboxLocationPicker } from './MapboxLocationPicker';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const LocationInput = React.memo<LocationInputProps>(({
  value,
  onChange,
  error
}) => {
  const { t } = useTranslation();
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleLocationSelect = (address: string, coordinates: { lat: number; lng: number }) => {
    onChange(address);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {t('createEvent.step2.location')} <span className="text-red-500">*</span>
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t('createEvent.step2.locationPlaceholder')}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn("pl-10", error ? "border-red-500" : "")}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsMapOpen(true)}
          className="flex-shrink-0"
          title={t('createEvent.step2.openMap') || 'Open map'}
        >
          <Map className="w-4 h-4" />
        </Button>
      </div>

      <MapboxLocationPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectLocation={handleLocationSelect}
        initialLocation={value}
      />
      
      {/* Popular Locations */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">{t('createEvent.step2.popular')}</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_LOCATIONS.map((location) => (
            <Button
              key={location.value}
              variant="outline"
              size="sm"
              onClick={() => onChange(t(location.labelKey))}
              className="text-xs h-7"
            >
              {t(location.labelKey)}
            </Button>
          ))}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
});

LocationInput.displayName = 'LocationInput';
