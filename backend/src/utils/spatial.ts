import { LocationPoint } from '../contracts/types/incident.js';

const EARTH_RADIUS_METERS = 6371000;

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c);
}

export function isPointNear(
  locA: LocationPoint,
  locB: LocationPoint,
  thresholdMeters: number = 500
): boolean {
  const dist = calculateDistanceMeters(locA.latitude, locA.longitude, locB.latitude, locB.longitude);
  return dist <= thresholdMeters;
}

export function pointToWKT(point: LocationPoint): string {
  return `SRID=4326;POINT(${point.longitude} ${point.latitude})`;
}
