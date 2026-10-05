import { FastifyInstance } from 'fastify';
import { devicesService } from './devices.service.js';
import { authenticate, requireRole } from '../../api/middlewares/auth.middleware.js';
import { validateBody } from '../../api/middlewares/validate.middleware.js';
import { USER_ROLES } from '../../contracts/constants/roles.js';
import {
  registerDeviceSchema,
  deviceEventSchema,
  deviceHeartbeatSchema,
  RegisterDeviceInput,
  DeviceEventInput,
  DeviceHeartbeatInput,
} from '../../contracts/schemas/device.schema.js';

export async function devicesRouter(fastify: FastifyInstance): Promise<void> {
  // 1. Register Edge Device
  fastify.post('/api/v1/devices/register', {
    preHandler: [
      authenticate,
      requireRole([USER_ROLES.COMMANDER, USER_ROLES.ADMIN]),
      validateBody(registerDeviceSchema),
    ],
  }, async (request, reply) => {
    const input = request.body as RegisterDeviceInput;
    const user = request.user!;
    const device = await devicesService.registerDevice(input, user.organizationId);
    return reply.status(201).send({
      success: true,
      data: device,
    });
  });

  // 2. Ingest Hardware Device Event (SOS / Sensor threshold breach)
  fastify.post('/api/v1/devices/events', {
    preHandler: [validateBody(deviceEventSchema)],
  }, async (request, reply) => {
    const input = request.body as DeviceEventInput;
    const event = await devicesService.ingestEvent(input);
    return reply.status(200).send({
      success: true,
      data: event,
    });
  });

  // 3. Edge Node Heartbeat Telemetry
  fastify.post('/api/v1/devices/heartbeat', {
    preHandler: [validateBody(deviceHeartbeatSchema)],
  }, async (request, reply) => {
    const input = request.body as DeviceHeartbeatInput;
    const device = await devicesService.heartbeat(input);
    return reply.status(200).send({
      success: true,
      data: device,
    });
  });

  // 4. List Devices
  fastify.get('/api/v1/devices', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const user = request.user!;
    const devices = await devicesService.listDevices(user.organizationId);
    return reply.status(200).send({
      success: true,
      data: devices,
    });
  });
}
