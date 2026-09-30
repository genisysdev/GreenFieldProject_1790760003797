export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  try {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    
    const lat1 = (coord1.latitude * Math.PI) / 180;
    const lat2 = (coord2.latitude * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  } catch (error) {
    console.error("Error in distance calculations:", error);
    throw new Error("Geospatial calculation failure");
  }
}