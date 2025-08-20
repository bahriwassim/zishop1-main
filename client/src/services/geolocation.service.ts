export interface Location {
  latitude: number;
  longitude: number;
}

export interface GeolocationResult {
  success: boolean;
  location?: Location;
  error?: string;
}

export interface DistanceResult {
  distance: number; // en kilomètres
  isWithinRadius: boolean;
}

/**
 * Service de géolocalisation pour Zishop
 */
export class GeolocationService {
  private static readonly EARTH_RADIUS = 6371; // Rayon de la Terre en km
  private static readonly DEFAULT_RADIUS = 3; // Rayon par défaut en km

  /**
   * Obtenir la position actuelle de l'utilisateur
   */
  static async getCurrentLocation(): Promise<GeolocationResult> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          success: false,
          error: "La géolocalisation n'est pas supportée par ce navigateur"
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            success: true,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => {
          let errorMessage = "Erreur de géolocalisation";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permission de géolocalisation refusée";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Position non disponible";
              break;
            case error.TIMEOUT:
              errorMessage = "Délai de géolocalisation dépassé";
              break;
          }
          
          resolve({
            success: false,
            error: errorMessage
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  /**
   * Calculer la distance entre deux points (formule de Haversine)
   */
  static calculateDistance(point1: Location, point2: Location): number {
    const lat1Rad = this.degreesToRadians(point1.latitude);
    const lat2Rad = this.degreesToRadians(point2.latitude);
    const deltaLat = this.degreesToRadians(point2.latitude - point1.latitude);
    const deltaLon = this.degreesToRadians(point2.longitude - point1.longitude);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS * c;
  }

  /**
   * Vérifier si un point est dans le rayon d'un autre point
   */
  static isWithinRadius(
    center: Location, 
    point: Location, 
    radius: number = this.DEFAULT_RADIUS
  ): DistanceResult {
    const distance = this.calculateDistance(center, point);
    return {
      distance,
      isWithinRadius: distance <= radius
    };
  }

  /**
   * Filtrer les commerçants dans un rayon donné
   */
  static filterMerchantsByDistance(
    userLocation: Location,
    merchants: any[],
    radius: number = this.DEFAULT_RADIUS
  ): any[] {
    return merchants.filter(merchant => {
      if (!merchant.latitude || !merchant.longitude) {
        return false; // Exclure les commerçants sans coordonnées
      }

      const merchantLocation: Location = {
        latitude: parseFloat(merchant.latitude),
        longitude: parseFloat(merchant.longitude)
      };

      const result = this.isWithinRadius(userLocation, merchantLocation, radius);
      return result.isWithinRadius;
    });
  }

  /**
   * Trier les commerçants par distance
   */
  static sortMerchantsByDistance(
    userLocation: Location,
    merchants: any[]
  ): any[] {
    return merchants
      .filter(merchant => merchant.latitude && merchant.longitude)
      .map(merchant => {
        const merchantLocation: Location = {
          latitude: parseFloat(merchant.latitude),
          longitude: parseFloat(merchant.longitude)
        };
        
        const distance = this.calculateDistance(userLocation, merchantLocation);
        
        return {
          ...merchant,
          distance,
          distanceFormatted: this.formatDistance(distance)
        };
      })
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Formater la distance pour l'affichage
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  }

  /**
   * Convertir les degrés en radians
   */
  private static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Obtenir la position depuis une adresse (géocodage inversé)
   * Note: Nécessite une API de géocodage comme Google Maps ou OpenStreetMap
   */
  static async geocodeAddress(address: string): Promise<GeolocationResult> {
    try {
      // Utilisation de l'API Nominatim (OpenStreetMap) - gratuite
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors du géocodage');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        return {
          success: false,
          error: "Adresse non trouvée"
        };
      }

      const result = data[0];
      
      return {
        success: true,
        location: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur de géocodage"
      };
    }
  }

  /**
   * Vérifier si la géolocalisation est disponible
   */
  static isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Demander la permission de géolocalisation
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isGeolocationSupported()) {
      return false;
    }

    try {
      const result = await this.getCurrentLocation();
      return result.success;
    } catch {
      return false;
    }
  }
}

// Export d'une instance par défaut
export const geolocationService = new GeolocationService(); 