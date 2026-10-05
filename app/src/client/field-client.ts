import { DurableQueue, OfflineSyncItem } from '../sync/durable-queue.js';
import { useResponderStore } from '../store/responder.store.js';
import type { LocationPoint, OperationalAlert, FieldRouteGuidance } from '../store/responder.store.js';

export class FieldClient {
  public queue: DurableQueue;
  public apiBaseUrl: string;

  constructor(apiBaseUrl: string = 'http://localhost:4000') {
    this.apiBaseUrl = apiBaseUrl;
    this.queue = new DurableQueue('FIELD-CLIENT-DEVICE-01', `${apiBaseUrl}/api/v1/sync/batch`);
  }

  async login(email: string = 'responder@resqgraph.local', password: string = 'responder123'): Promise<any> {
    const res = await fetch(`${this.apiBaseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error(`Authentication failed with status ${res.status}`);
    }

    const json = await res.json();
    const { token, user } = json.data;
    useResponderStore.getState().setAuth(
      {
        userId: user.id || user.userId,
        email: user.email,
        role: user.role,
        badgeNumber: user.badgeNumber || 'FLD-109',
      },
      token,
    );
    return user;
  }

  logout(): void {
    useResponderStore.getState().clearAuth();
  }

  async submitReport(
    rawContent: string,
    location?: LocationPoint,
    incidentId?: string,
  ): Promise<OfflineSyncItem> {
    const item = this.queue.enqueue('create_report', 'report', {
      rawContent,
      location,
      incidentId,
      sourceType: 'responder',
    });

    const token = useResponderStore.getState().token;
    if (useResponderStore.getState().isOnline && token) {
      await this.queue.processQueue(token);
    }

    return item;
  }

  async submitEvidence(
    incidentId: string,
    observations: Array<{ label: string; confidence: number }>,
    mediaUrl?: string,
    location?: LocationPoint,
  ): Promise<OfflineSyncItem> {
    const item = this.queue.enqueue('add_evidence', 'evidence', {
      incidentId,
      observations,
      mediaUrl,
      location,
      mediaType: mediaUrl ? 'image' : 'text',
      sourceType: 'responder',
    });

    const token = useResponderStore.getState().token;
    if (useResponderStore.getState().isOnline && token) {
      await this.queue.processQueue(token);
    }

    return item;
  }

  async reportConflict(
    incidentId: string,
    conflictType: string,
    description: string,
    location?: LocationPoint,
  ): Promise<OfflineSyncItem> {
    const item = this.queue.enqueue('report_conflict', 'conflict', {
      incidentId,
      conflictType,
      description,
      location,
      sourceType: 'responder',
    });

    const token = useResponderStore.getState().token;
    if (useResponderStore.getState().isOnline && token) {
      await this.queue.processQueue(token);
    }

    return item;
  }

  async updateResponderStatus(
    status: 'available' | 'assigned' | 'en_route' | 'on_scene' | 'offline',
  ): Promise<OfflineSyncItem> {
    useResponderStore.getState().setStatus(status);

    const item = this.queue.enqueue('update_responder_status', 'responder', {
      status,
      location: useResponderStore.getState().location,
      batteryLevel: useResponderStore.getState().batteryLevel,
    });

    const token = useResponderStore.getState().token;
    if (useResponderStore.getState().isOnline && token) {
      await this.queue.processQueue(token);
    }

    return item;
  }

  async updateAssignmentStatus(
    assignmentId: string,
    incidentId: string,
    status: 'dispatched' | 'en_route' | 'on_scene' | 'completed' | 'cancelled',
    notes?: string,
  ): Promise<OfflineSyncItem> {
    // Update local store assignment if present
    const current = useResponderStore.getState().activeAssignment;
    if (current && current.assignmentId === assignmentId) {
      useResponderStore.getState().setActiveAssignment({
        ...current,
        status,
      });
    }

    const item = this.queue.enqueue('update_assignment_status', 'assignment', {
      assignmentId,
      incidentId,
      status,
      notes,
    });

    const token = useResponderStore.getState().token;
    if (useResponderStore.getState().isOnline && token) {
      await this.queue.processQueue(token);
    }

    return item;
  }

  async fetchAssignedIncident(incidentId: string): Promise<any> {
    const token = useResponderStore.getState().token;
    const res = await fetch(`${this.apiBaseUrl}/api/v1/incidents/${incidentId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`Failed to fetch incident ${incidentId}`);
    const json = await res.json();
    return json.data;
  }

  async fetchActiveAlerts(): Promise<OperationalAlert[]> {
    const token = useResponderStore.getState().token;
    const res = await fetch(`${this.apiBaseUrl}/api/v1/alerts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return [];
    const json = await res.json();
    const alerts: OperationalAlert[] = (json.data || []).map((a: any) => ({
      alertId: a.id,
      severity: a.severity || 'high',
      title: a.title,
      message: a.message,
      areaDescription: a.areaDescription,
      expiresAt: a.expiresAt,
    }));
    useResponderStore.getState().setActiveAlerts(alerts);
    return alerts;
  }

  async fetchRouteGuidance(incidentId: string): Promise<FieldRouteGuidance | null> {
    const token = useResponderStore.getState().token;
    const res = await fetch(`${this.apiBaseUrl}/api/v1/routes/${incidentId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    const json = await res.json();
    const r = json.data;
    if (!r) return null;

    const guidance: FieldRouteGuidance = {
      routeId: r.routeId || r.id || 'computed-route-01',
      incidentId,
      waypoints: r.waypoints || [],
      estimatedDistanceKm: r.distanceKm || 3.8,
      estimatedDurationMinutes: r.etaMinutes || 12,
      hazardsReported: r.hazards || [],
    };
    useResponderStore.getState().setRouteGuidance(guidance);
    return guidance;
  }

  async syncOfflineBuffer(): Promise<void> {
    const token = useResponderStore.getState().token;
    if (!token) throw new Error('Not authenticated');
    await this.queue.processQueue(token);
  }
}

export const fieldClient = new FieldClient();

