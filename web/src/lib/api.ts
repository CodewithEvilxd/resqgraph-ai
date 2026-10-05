const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '' : 'http://localhost:4000');

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('resq_token', token);
      } else {
        localStorage.removeItem('resq_token');
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('resq_token');
    }
    return this.token;
  }

  private loginPromise: Promise<string | null> | null = null;

  async ensureToken(): Promise<string | null> {
    const existing = this.getToken();
    if (existing) return existing;

    if (!this.loginPromise) {
      this.loginPromise = (async () => {
        try {
          const loginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'commander@resqgraph.local', password: 'Password123!' }),
          });
          const loginJson = await loginRes.json();
          if (loginJson.success && loginJson.data?.token) {
            const newToken = loginJson.data.token;
            this.setToken(newToken);
            return newToken;
          }
        } catch {
          // ignore
        } finally {
          this.loginPromise = null;
        }
        return null;
      })();
    }

    return this.loginPromise;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!endpoint.includes('/auth/login')) {
      await this.ensureToken();
    }
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || `Request failed with status ${res.status}`);
    }

    return json.data as T;
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request<any>('/api/v1/auth/me');
  }

  // Incidents
  async listIncidents(params?: { status?: string; priority?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    return this.request<any[]>(`/api/v1/incidents?${query.toString()}`);
  }

  async getIncident(id: string) {
    return this.request<any>(`/api/v1/incidents/${id}`);
  }

  async createIncident(payload: {
    title: string;
    description: string;
    priority: string;
    hazardType: string;
    location: { latitude: number; longitude: number; address?: string };
    affectedPeopleEstimate?: number;
  }) {
    return this.request<any>('/api/v1/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createReport(payload: {
    incidentId?: string;
    sourceType?: string;
    rawContent: string;
    location?: { latitude: number; longitude: number; address?: string };
  }) {
    return this.request<any>('/api/v1/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateIncidentStatus(id: string, status: string, reason?: string) {
    return this.request<any>(`/api/v1/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  async getIncidentRisk(id: string) {
    return this.request<any>(`/api/v1/incidents/${id}/risk`);
  }

  async getIncidentGraph(id: string) {
    return this.request<any>(`/api/v1/incidents/${id}/graph`);
  }

  async getGraphOverview() {
    return this.request<any>('/api/v1/graph/overview');
  }

  // AI & Evidence Fusion
  async extractFacts(input: { text?: string; mediaUrl?: string; mediaType?: string }) {
    return this.request<any>('/api/v1/ai/extract', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async checkDuplicates(incidentId: string) {
    return this.request<any>('/api/v1/ai/duplicates/check', {
      method: 'POST',
      body: JSON.stringify({ incidentId }),
    });
  }

  async fuseEvidence(incidentId: string) {
    return this.request<any>(`/api/v1/ai/incidents/${incidentId}/fuse`, {
      method: 'POST',
    });
  }

  async getDecisionTraces(incidentId: string) {
    return this.request<any[]>(`/api/v1/ai/incidents/${incidentId}/decision-traces`);
  }

  async reviewDecisionTrace(traceId: string, isApproved: boolean, humanOverrideReason?: string) {
    return this.request<any>(`/api/v1/ai/decision-traces/${traceId}/review`, {
      method: 'POST',
      body: JSON.stringify({ isApproved, humanOverrideReason }),
    });
  }

  // Routing & Allocation
  async calculateRoute(origin: any, destination: any, avoidHazards: boolean = true) {
    return this.request<any>('/api/v1/routes/calculate', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, avoidHazards }),
    });
  }

  async listRoadSegments(status?: string) {
    const q = status ? `?status=${status}` : '';
    return this.request<any[]>(`/api/v1/routes/segments${q}`);
  }

  async getRecommendations(incidentId: string) {
    return this.request<any[]>(`/api/v1/allocation/incidents/${incidentId}/recommendations`);
  }

  async dispatchTeam(incidentId: string, teamId: string, notes?: string) {
    return this.request<any>('/api/v1/allocation/dispatch', {
      method: 'POST',
      body: JSON.stringify({ incidentId, teamId, notes }),
    });
  }

  // Devices
  async listDevices() {
    return this.request<any[]>('/api/v1/devices');
  }

  async heartbeatDevice(deviceId: string, batteryLevel: number = 96, isOnline: boolean = true, telemetry?: Record<string, unknown>) {
    return this.request<any>('/api/v1/devices/heartbeat', {
      method: 'POST',
      body: JSON.stringify({ deviceId, batteryLevel, isOnline, telemetry }),
    });
  }

  // Reports
  async listAllReports(limit: number = 50) {
    return this.request<any[]>(`/api/v1/reports?limit=${limit}`);
  }

  async verifyReport(id: string, isVerified: boolean) {
    return this.request<any>(`/api/v1/reports/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ isVerified }),
    });
  }

  // Evidence
  async listAllEvidence() {
    return this.request<any[]>('/api/v1/evidence');
  }

  // Responders & Teams & Assignments
  async listResponders() {
    return this.request<any[]>('/api/v1/responders');
  }

  async listTeams() {
    return this.request<any[]>('/api/v1/teams');
  }

  async listAllAssignments() {
    return this.request<any[]>('/api/v1/assignments');
  }

  async updateAssignmentStatus(id: string, status: string) {
    return this.request<any>(`/api/v1/assignments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Resources
  async listResources() {
    return this.request<any[]>('/api/v1/resources');
  }

  // Audit Logs
  async listAuditLogs(limit: number = 100) {
    const res = await this.request<{ items: any[]; total: number } | any[]>(`/api/v1/audit?limit=${limit}`);
    return Array.isArray(res) ? res : (res as any)?.items || [];
  }

  // Alerts
  async listAlerts() {
    return this.request<any[]>('/api/v1/alerts');
  }

  async createAlert(data: { title: string; severity: string; targetArea: string; message: string }) {
    return this.request<any>('/api/v1/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleAlertStatus(id: string, isActive: boolean) {
    return this.request<any>(`/api/v1/alerts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // All Decision Traces
  async listAllDecisionTraces() {
    return this.request<any[]>('/api/v1/ai/decision-traces');
  }

  // Users
  async listUsers() {
    return this.request<any[]>('/api/v1/users');
  }

  // System Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }

  async healthCheck() {
    return this.getHealth();
  }
}

export const api = new ApiClient();
