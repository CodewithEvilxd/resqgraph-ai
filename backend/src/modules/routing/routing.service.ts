import { dbStore } from '../../db/index.js';
import { RoadSegment, Route, RouteWaypoint, RouteSafetyAssessment } from '../../contracts/types/route.js';
import { CreateRoadSegmentInput, CalculateRouteInput } from '../../contracts/schemas/route.schema.js';
import { calculateDistanceMeters } from '../../utils/spatial.js';
import { generateUUID } from '../../utils/crypto.js';
import { logger } from '../../utils/logger.js';

export class RoutingService {
  async createRoadSegment(input: CreateRoadSegmentInput): Promise<RoadSegment> {
    const id = generateUUID();
    const segment: RoadSegment = {
      id,
      name: input.name,
      status: input.status,
      blockedReason: input.blockedReason,
      hazardType: input.hazardType,
      startPoint: input.startPoint,
      endPoint: input.endPoint,
      lengthMeters: input.lengthMeters,
      speedLimitKmh: input.speedLimitKmh,
      reportedAt: new Date().toISOString(),
    };

    dbStore.roads.set(id, segment);
    logger.info('Recorded road segment status update', {
      segmentId: id,
      name: segment.name,
      status: segment.status,
    });

    return segment;
  }

  async listRoadSegments(status?: string): Promise<RoadSegment[]> {
    const all = Array.from(dbStore.roads.values());
    if (status) {
      return all.filter(r => r.status === status);
    }
    return all;
  }

  async calculateRoute(input: CalculateRouteInput & { incidentId?: string }): Promise<Route> {
    const origin = input.origin;
    const dest = input.destination;
    const directDistance = calculateDistanceMeters(origin.latitude, origin.longitude, dest.latitude, dest.longitude);

    const hazardsEncountered: string[] = [];
    const warnings: string[] = [];
    let isPassable = true;
    let safetyScore = 1.0;
    let alternativeSuggested = false;

    // Check all known road closures against the path
    const activeRoads = Array.from(dbStore.roads.values());
    const blockedRoads = activeRoads.filter(r => r.status !== 'open');

    // Sample points along direct trajectory (midpoint, 25%, 75%)
    const midLat = (origin.latitude + dest.latitude) / 2;
    const midLon = (origin.longitude + dest.longitude) / 2;

    const detourWaypoints: RouteWaypoint[] = [];

    for (const road of blockedRoads) {
      const distToStart = calculateDistanceMeters(midLat, midLon, road.startPoint.latitude, road.startPoint.longitude);
      const distToOrigin = calculateDistanceMeters(origin.latitude, origin.longitude, road.startPoint.latitude, road.startPoint.longitude);
      const distToDest = calculateDistanceMeters(dest.latitude, dest.longitude, road.startPoint.latitude, road.startPoint.longitude);

      if (distToStart < 600 || distToOrigin < 400 || distToDest < 400) {
        hazardsEncountered.push(`${road.name}: ${road.status} (${road.blockedReason || 'Blocked'})`);
        warnings.push(`Hazard detected along direct route: ${road.name} is ${road.status}.`);
        safetyScore -= 0.35;

        if (input.avoidHazards) {
          alternativeSuggested = true;
          // Compute detour offset waypoint (offset longitude slightly to detour around obstacle)
          detourWaypoints.push({
            latitude: road.startPoint.latitude + 0.003, // ~330m lateral detour
            longitude: road.startPoint.longitude + 0.003,
            order: 2,
            instruction: `Detour around ${road.name} (${road.status})`,
            segmentId: road.id,
          });
        } else {
          isPassable = false;
        }
      }
    }

    safetyScore = Math.max(0.1, parseFloat(safetyScore.toFixed(2)));

    // Assemble waypoints
    const waypoints: RouteWaypoint[] = [
      {
        latitude: origin.latitude,
        longitude: origin.longitude,
        order: 1,
        instruction: `Depart from origin ${origin.address || 'dispatch station'}`,
      },
    ];

    if (detourWaypoints.length > 0) {
      detourWaypoints.forEach(dw => waypoints.push(dw));
    }

    waypoints.push({
      latitude: dest.latitude,
      longitude: dest.longitude,
      order: waypoints.length + 1,
      instruction: `Arrive at incident site ${dest.address || ''}`,
    });

    // Compute route distance and duration (detour adds 15% distance per obstacle)
    const detourMultiplier = detourWaypoints.length > 0 ? 1.25 : 1.0;
    const finalDistanceMeters = Math.round(directDistance * detourMultiplier);
    // Emergency response speed avg 40 km/h = 11.1 m/s
    const estimatedDurationSeconds = Math.round(finalDistanceMeters / 11.1);

    const safety: RouteSafetyAssessment = {
      safetyScore,
      isPassable,
      warnings,
      hazardsEncountered,
      alternativeSuggested,
    };

    const route: Route = {
      id: generateUUID(),
      incidentId: input.incidentId || generateUUID(),
      origin,
      destination: dest,
      distanceMeters: finalDistanceMeters,
      estimatedDurationSeconds,
      waypoints,
      safety,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('Calculated emergency response route', {
      distanceMeters: finalDistanceMeters,
      durationSeconds: estimatedDurationSeconds,
      safetyScore,
      hazardsCount: hazardsEncountered.length,
      detourApplied: alternativeSuggested,
    });

    return route;
  }
}

export const routingService = new RoutingService();
