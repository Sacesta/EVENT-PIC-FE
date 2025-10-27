import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, MapPin, X } from 'lucide-react';

// Initialize Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapboxLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string, coordinates: { lat: number; lng: number }) => void;
  initialLocation?: string;
}

export const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
}) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize map - wait for container to be available
  useEffect(() => {
    if (!isOpen) {
      console.log('🗺️ Map not initializing - dialog not open');
      return;
    }

    console.log('🗺️ Dialog opened, checking for container...');

    // Wait for the Dialog to render and container to be available
    const initMap = () => {
      if (!mapContainerRef.current) {
        console.log('🗺️ Container ref still null, retrying...');
        return false;
      }

      console.log('🗺️ Starting map initialization...');
      console.log('🗺️ Mapbox token available:', !!mapboxgl.accessToken);
      console.log('🗺️ Token length:', mapboxgl.accessToken?.length);
      console.log('🗺️ Token value (first 20 chars):', mapboxgl.accessToken?.substring(0, 20));
      console.log('🗺️ Container ref exists:', !!mapContainerRef.current);
      console.log('🗺️ Container dimensions:', mapContainerRef.current?.offsetWidth, 'x', mapContainerRef.current?.offsetHeight);

      try {
        // Create map centered on Israel (default)
        console.log('🗺️ Creating new Map instance...');
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [35.2137, 31.7683], // Center of Israel
          zoom: 7,
        });

        console.log('🗺️ Map instance created:', map);

        // Wait for map to load before adding controls
        map.on('load', () => {
          console.log('🗺️ Map loaded successfully!');
          map.resize(); // Force resize after load
        });

        map.on('error', (e) => {
          console.error('🗺️ Map error:', e);
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add click handler to select location
        map.on('click', async (e) => {
          const { lng, lat } = e.lngLat;

          // Update marker
          if (markerRef.current) {
            markerRef.current.setLngLat([lng, lat]);
          } else {
            markerRef.current = new mapboxgl.Marker({ color: '#FF0000' })
              .setLngLat([lng, lat])
              .addTo(map);
          }

          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
              const address = data.features[0].place_name;
              setSelectedAddress(address);
              setSelectedCoordinates({ lat, lng });
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
          }
        });

        mapRef.current = map;

        console.log('🗺️ Map initialized successfully, stored in ref');
        return true;
      } catch (error) {
        console.error('🗺️ Error initializing map:', error);
        console.error('🗺️ Error details:', error);
        return false;
      }
    };

    // Try multiple times to initialize the map, waiting for the container to be ready
    let attempts = 0;
    const maxAttempts = 10;
    const intervalId = setInterval(() => {
      attempts++;
      console.log(`🗺️ Attempt ${attempts}/${maxAttempts} to initialize map`);

      if (initMap()) {
        console.log('🗺️ Map initialization successful!');
        clearInterval(intervalId);
      } else if (attempts >= maxAttempts) {
        console.error('🗺️ Failed to initialize map after', maxAttempts, 'attempts');
        clearInterval(intervalId);
      }
    }, 100); // Try every 100ms

    return () => {
      console.log('🗺️ Cleanup: clearing interval and removing map');
      clearInterval(intervalId);
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  // Search for locations
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxgl.accessToken}&country=IL&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a search result
  const handleSelectSearchResult = (result: any) => {
    const [lng, lat] = result.center;
    const address = result.place_name;

    // Update map view
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        essential: true,
      });

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      }
    }

    setSelectedAddress(address);
    setSelectedCoordinates({ lat, lng });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedAddress && selectedCoordinates) {
      onSelectLocation(selectedAddress, selectedCoordinates);
      onClose();
    }
  };

  // Clear selection
  const handleClear = () => {
    setSelectedAddress('');
    setSelectedCoordinates(null);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t('createEvent.step2.selectLocation') || 'Select Location'}
          </DialogTitle>
          <DialogDescription>
            {t('createEvent.step2.selectLocationDescription') || 'Search for a location or click on the map to select a point'}
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-6 pb-4 space-y-2 flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('createEvent.step2.searchLocation') || 'Search for a location...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? t('common.searching') || 'Searching...' : t('common.search') || 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-start gap-2 border-b last:border-b-0"
                >
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.text}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {result.place_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Location */}
          {selectedAddress && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-900 flex-1 truncate">{selectedAddress}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative px-6 overflow-hidden min-h-0">
          <div
            ref={mapContainerRef}
            className="w-full h-full rounded-md border border-gray-300"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-2 flex-shrink-0 border-t">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAddress || !selectedCoordinates}
          >
            {t('common.confirm') || 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
