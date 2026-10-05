import { dbStore } from '../../db/index.js';
import { DevicesRepository, devicesRepository } from './devices.repository.js';
import { IncidentsRepository, incidentsRepository } from '../incidents/incidents.repository.js';
import { AuditService, auditService } from '../audit/audit.service.js';
import { realtimeService } from '../../services/realtime.service.js';
import { Device, DeviceEvent } from '../../contracts/types/device.js';
import { Incident } from '../../contracts/types/incident.js';
import { Report } from '../../contracts/types/report.js';
import {
  RegisterDeviceInput,
  DeviceEventInput,
  DeviceHeartbeatInput,
} from '../../contracts/schemas/device.schema.js';
import { INCIDENT_PRIORITIES, HAZARD_TYPES } from '../../contracts/constants/priorities.js';
import { REALTIME_EVENTS } from '../../contracts/constants/events.js';
import { env } from '../../config/env.js';
import { NotFoundError, UnauthorizedError, ConflictError } from '../../utils/errors.js';
import { generateUUID, generateIncidentCode, verifyHmacSha256 } from '../../utils/crypto.js';
import { calculateDistanceMeters } from '../../utils/spatial.js';
import { logger } from '../../utils/logger.js';

export class DevicesService {
  constructor(
    private readonly devicesRepo: DevicesRepository = devicesRepository,
    private readonly incidentsRepo: IncidentsRepository = incidentsRepository,
    private readonly audit: AuditService = auditService,
  ) {}

  async registerDevice(input: RegisterDeviceInput, organizationId: string): Promise<Device> {
    const existing = await this.devicesRepo.findByHardwareUid(input.hardwareUid);
    if (existing) {
      throw new ConflictError(`Device with Hardware UID '${input.hardwareUid}' already registered`);
    }

    const now = new Date().toISOString();
    const device: Device = {
      id: generateUUID(),
      hardwareUid: input.hardwareUid,
      organizationId,
      name: input.name,
      deviceType: input.deviceType,
      firmwareVersion: input.firmwareVersion,
      status: 'online',
      assignedLocation: input.assignedLocation,
      isRevoked: false,
      lastHeartbeatAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.devicesRepo.create(device);

    await this.audit.record({
      organizationId,
      action: 'device:register',
      targetEntity: 'device',
      targetEntityId: created.id,
      details: {
        hardwareUid: created.hardwareUid,
        deviceType: created.deviceType,
      },
    });

    logger.info('Edge device successfully registered', {
      deviceId: created.id,
      hardwareUid: created.hardwareUid,
      deviceType: created.deviceType,
    });

    return created;
  }

  async ingestEvent(input: DeviceEventInput): Promise<DeviceEvent> {
    const device = await this.devicesRepo.findById(input.deviceId);
    if (!device) {
      throw new NotFoundError(`Device with ID ${input.deviceId} not found`);
    }

    if (device.isRevoked) {
      throw new UnauthorizedError(`Device ${device.hardwareUid} has been revoked`);
    }

    // Optional cryptographic HMAC signature verification
    if (input.signature) {
      const canonicalPayload = `${input.deviceId}:${input.hardwareUid}:${input.clientEventId}:${input.eventType}:${input.timestamp}`;
      const isValid = verifyHmacSha256(canonicalPayload, input.signature, env.DEVICE_SIGNING_SECRET);
      if (!isValid) {
        logger.warn('Device event HMAC signature verification failed', {
          deviceId: input.deviceId,
          hardwareUid: input.hardwareUid,
        });
        throw new UnauthorizedError('Invalid cryptographic device signature');
      }
    }

    // Idempotency check
    const existingEvent = await this.devicesRepo.findEventByClientEventId(input.clientEventId);
    if (existingEvent) {
      logger.info('Idempotent device event re-acknowledged', {
        clientEventId: input.clientEventId,
      });
      return existingEvent;
    }

    const eventLocation = input.location || device.assignedLocation || {
      latitude: 28.535,
      longitude: 77.271,
      address: 'Edge Sensor Fixed Deployment',
    };

    let associatedIncidentId: string | undefined;
    const now = new Date().toISOString();

    // Event handling based on eventType
    if (input.eventType === 'sos_trigger' || input.eventType === 'threshold_breach') {
      // 1. Check for active incident nearby to correlate
      const allIncidents = Array.from(dbStore.incidents.values()).filter(
        i => i.organizationId === device.organizationId && i.status !== 'closed' && i.status !== 'merged',
      );

      const nearbyIncident = allIncidents.find(inc => {
        const dist = calculateDistanceMeters(
          eventLocation.latitude,
          eventLocation.longitude,
          inc.location.latitude,
          inc.location.longitude,
        );
        return dist <= 300;
      });

      if (nearbyIncident) {
        associatedIncidentId = nearbyIncident.id;
      } else {
        // Automatically spawn verified incident for direct edge SOS trigger
        const count = dbStore.incidents.size + 1;
        const code = generateIncidentCode(count);
        const newIncidentId = generateUUID();

        const hazardType = input.eventType === 'sos_trigger'
          ? HAZARD_TYPES.MEDICAL_EMERGENCY
          : (input.telemetry.smokePpm && input.telemetry.smokePpm > 100 ? HAZARD_TYPES.FIRE : HAZARD_TYPES.OTHER);

        const newIncident: Incident = {
          id: newIncidentId,
          organizationId: device.organizationId,
          code,
          title: `Autonomous Alert: ${device.name} [${input.eventType.toUpperCase()}]`,
          description: `Telemetry alert from edge node ${device.hardwareUid}: smoke=${input.telemetry.smokePpm || 0}ppm, temp=${input.telemetry.temperatureCelsius || 0}°C.`,
          status: 'verified',
          priority: INCIDENT_PRIORITIES.P1_CRITICAL,
          hazardType,
          confidenceScore: 0.95,
          location: eventLocation,
          reporterCount: 1,
          evidenceCount: 1,
          createdAt: now,
          updatedAt: now,
        };

        await this.incidentsRepo.create(newIncident);
        associatedIncidentId = newIncidentId;
      }

      // 2. Generate structured incident report from device
      const reportId = generateUUID();
      const report: Report = {
        id: reportId,
        incidentId: associatedIncidentId,
        organizationId: device.organizationId,
        sourceType: 'iot_device',
        clientEventId: input.clientEventId,
        rawContent: `Hardware edge alert [${input.eventType}]: device=${device.name} (uid:${device.hardwareUid})`,
        location: eventLocation,
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      };
      dbStore.reports.set(reportId, report);
    }

    const eventRecord: DeviceEvent = {
      id: generateUUID(),
      deviceId: device.id,
      hardwareUid: device.hardwareUid,
      organizationId: device.organizationId,
      clientEventId: input.clientEventId,
      eventType: input.eventType,
      timestamp: input.timestamp,
      location: eventLocation,
      telemetry: input.telemetry,
      signature: input.signature,
      acknowledgedByServerAt: now,
      associatedIncidentId,
    };

    const recorded = await this.devicesRepo.recordEvent(eventRecord);

    // Broadcast realtime event
    realtimeService.broadcastToOrg(device.organizationId, REALTIME_EVENTS.DEVICE_EVENT, {
      deviceId: device.id,
      hardwareUid: device.hardwareUid,
      eventType: input.eventType,
      location: eventLocation,
      associatedIncidentId,
    });

    return recorded;
  }

  async heartbeat(input: DeviceHeartbeatInput): Promise<Device> {
    return this.devicesRepo.updateHeartbeat(input.deviceId, input);
  }

  async listDevices(organizationId: string): Promise<Device[]> {
    return this.devicesRepo.findAll(organizationId);
  }
}

export const devicesService = new DevicesService();
