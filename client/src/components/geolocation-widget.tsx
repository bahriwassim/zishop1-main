import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { GeolocationService, Location } from '@/services/geolocation.service';
import { toast } from 'sonner';

interface GeolocationWidgetProps {
  onLocationUpdate?: (location: Location) => void;
  showDetails?: boolean;
  className?: string;
}

export function GeolocationWidget({ 
  onLocationUpdate, 
  showDetails = true,
  className = '' 
}: GeolocationWidgetProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(GeolocationService.isGeolocationSupported());
  }, []);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await GeolocationService.getCurrentLocation();
      
      if (result.success && result.location) {
        setLocation(result.location);
        onLocationUpdate?.(result.location);
        toast.success('Position obtenue avec succès');
      } else {
        setError(result.error || 'Impossible d\'obtenir la position');
        toast.error(result.error || 'Erreur de géolocalisation');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle size={16} />
            <span className="text-sm">Géolocalisation non supportée</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MapPin size={16} />
          Géolocalisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {location ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm font-medium">Position actuelle</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {formatCoordinates(location.latitude, location.longitude)}
              </Badge>
            </div>
            
            {showDetails && (
              <div className="text-xs text-gray-600 space-y-1">
                <p>Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
              </div>
            )}
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Actualisation...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-3 w-3" />
                  Actualiser
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {error ? (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Cliquez pour obtenir votre position
              </p>
            )}
            
            <Button 
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Obtention de la position...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Obtenir ma position
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Composant pour afficher la distance vers un commerçant
interface DistanceDisplayProps {
  userLocation: Location | null;
  merchantLocation: Location;
  merchantName: string;
  className?: string;
}

export function DistanceDisplay({ 
  userLocation, 
  merchantLocation, 
  merchantName,
  className = '' 
}: DistanceDisplayProps) {
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState(false);

  useEffect(() => {
    if (userLocation) {
      const result = GeolocationService.isWithinRadius(userLocation, merchantLocation);
      setDistance(result.distance);
      setIsWithinRadius(result.isWithinRadius);
    }
  }, [userLocation, merchantLocation]);

  if (!userLocation || distance === null) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <MapPin size={14} className="text-gray-500" />
      <span className="text-sm text-gray-600">
        {merchantName}: {GeolocationService.formatDistance(distance)}
      </span>
      {isWithinRadius && (
        <Badge variant="outline" className="text-xs text-green-600">
          Dans le rayon
        </Badge>
      )}
    </div>
  );
} 