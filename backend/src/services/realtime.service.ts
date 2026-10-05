import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { RealtimeEvent } from '../contracts/constants/events.js';
import { AuthTokenPayload } from '../contracts/types/user.js';

const log = logger.child('RealtimeService');

export interface RealtimeMessage {
  id: string;
  event: RealtimeEvent;
  data: unknown;
  organizationId?: string;
  incidentId?: string;
  targetUserId?: string;
  timestamp: string;
}

export interface ConnectedClient {
  id: string;
  user: AuthTokenPayload;
  subscribedIncidents: Set<string>;
  connectedAt: string;
  send: (payload: string) => void;
  close: () => void;
}

export class RealtimeService extends EventEmitter {
  private clients: Map<string, ConnectedClient> = new Map();
  private eventHistory: RealtimeMessage[] = []; // In-memory ring buffer for reconnect replay
  private readonly maxHistoryLength = 200;

  constructor() {
    super();
  }

  registerClient(client: ConnectedClient): void {
    this.clients.set(client.id, client);
    log.info('Realtime client connected', {
      clientId: client.id,
      userId: client.user.userId,
      role: client.user.role,
    });

    // Send connection acknowledgement
    client.send(
      JSON.stringify({
        event: 'connection:established',
        data: {
          clientId: client.id,
          userId: client.user.userId,
          organizationId: client.user.organizationId,
        },
        timestamp: new Date().toISOString(),
      })
    );
  }

  unregisterClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      log.info('Realtime client disconnected', {
        clientId,
        userId: client.user.userId,
      });
    }
  }

  subscribeIncident(clientId: string, incidentId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscribedIncidents.add(incidentId);
      client.send(
        JSON.stringify({
          event: 'subscription:confirmed',
          data: { incidentId },
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  unsubscribeIncident(clientId: string, incidentId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscribedIncidents.delete(incidentId);
    }
  }

  private recordEvent(message: RealtimeMessage): void {
    this.eventHistory.push(message);
    if (this.eventHistory.length > this.maxHistoryLength) {
      this.eventHistory.shift();
    }
    this.emit('realtime_event', message);
  }

  broadcastToOrg(organizationId: string, event: RealtimeEvent, data: unknown): void {
    const message: RealtimeMessage = {
      id: crypto.randomUUID(),
      event,
      data,
      organizationId,
      timestamp: new Date().toISOString(),
    };

    this.recordEvent(message);
    const serialized = JSON.stringify(message);

    for (const client of this.clients.values()) {
      if (client.user.organizationId === organizationId) {
        try {
          client.send(serialized);
        } catch (err) {
          log.warn('Failed to send to client', { clientId: client.id, error: (err as Error).message });
        }
      }
    }
  }

  broadcastToIncident(incidentId: string, event: RealtimeEvent, data: unknown): void {
    const message: RealtimeMessage = {
      id: crypto.randomUUID(),
      event,
      data,
      incidentId,
      timestamp: new Date().toISOString(),
    };

    this.recordEvent(message);
    const serialized = JSON.stringify(message);

    for (const client of this.clients.values()) {
      const isCommanderOrDispatcher = ['commander', 'dispatcher', 'admin'].includes(client.user.role);
      const isSubscribed = client.subscribedIncidents.has(incidentId);

      if (isCommanderOrDispatcher || isSubscribed) {
        try {
          client.send(serialized);
        } catch (err) {
          log.warn('Failed to send to client', { clientId: client.id, error: (err as Error).message });
        }
      }
    }
  }

  sendToUser(userId: string, event: RealtimeEvent, data: unknown): void {
    const message: RealtimeMessage = {
      id: crypto.randomUUID(),
      event,
      data,
      targetUserId: userId,
      timestamp: new Date().toISOString(),
    };

    this.recordEvent(message);
    const serialized = JSON.stringify(message);

    for (const client of this.clients.values()) {
      if (client.user.userId === userId) {
        try {
          client.send(serialized);
        } catch (err) {
          log.warn('Failed to send to client', { clientId: client.id, error: (err as Error).message });
        }
      }
    }
  }

  getRecentEvents(organizationId: string, sinceIso?: string): RealtimeMessage[] {
    const sinceTimestamp = sinceIso ? new Date(sinceIso).getTime() : 0;
    return this.eventHistory.filter((msg) => {
      const isOrg = !msg.organizationId || msg.organizationId === organizationId;
      const isNew = new Date(msg.timestamp).getTime() > sinceTimestamp;
      return isOrg && isNew;
    });
  }

  getConnectedCount(): number {
    return this.clients.size;
  }
}

export const realtimeService = new RealtimeService();
