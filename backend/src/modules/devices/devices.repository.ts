import { dbStore } from '../../db/index.js';
import { Device, DeviceEvent } from '../../contracts/types/device.js';
import { DeviceHeartbeatInput } from '../../contracts/schemas/device.schema.js';
import { NotFoundError } from '../../utils/errors.js';

export class DevicesRepository {
  async create(device: Device): Promise<Device> {
    dbStore.devices.set(device.id, device);
    return device;
  }

  async findById(id: string): Promise<Device | null> {
    return dbStore.devices.get(id) || null;
  }

  async findByHardwareUid(hardwareUid: string): Promise<Device | null> {
    for (const device of dbStore.devices.values()) {
      if (device.hardwareUid === hardwareUid) {
        return device;
      }
    }
    return null;
  }

  async findAll(organizationId: string): Promise<Device[]> {
    return Array.from(dbStore.devices.values()).filter(
      d => d.organizationId === organizationId,
    );
  }

  async recordEvent(event: DeviceEvent): Promise<DeviceEvent> {
    dbStore.deviceEvents.set(event.id, event);
    return event;
  }

  async findEventByClientEventId(clientEventId: string): Promise<DeviceEvent | null> {
    for (const ev of dbStore.deviceEvents.values()) {
      if (ev.clientEventId === clientEventId) {
        return ev;
      }
    }
    return null;
  }

  async updateHeartbeat(deviceId: string, heartbeat: DeviceHeartbeatInput): Promise<Device> {
    const device = dbStore.devices.get(deviceId);
    if (!device) {
      throw new NotFoundError(`Device ${deviceId} not found`);
    }

    device.lastHeartbeatAt = heartbeat.timestamp;
    device.status = 'online';
    if (heartbeat.batteryPercentage !== undefined) {
      device.batteryPercentage = heartbeat.batteryPercentage;
    }
    if (heartbeat.location) {
      device.assignedLocation = heartbeat.location;
    }
    if (heartbeat.firmwareVersion) {
      device.firmwareVersion = heartbeat.firmwareVersion;
    }
    device.updatedAt = new Date().toISOString();

    dbStore.devices.set(deviceId, device);
    return device;
  }
}

export const devicesRepository = new DevicesRepository();
