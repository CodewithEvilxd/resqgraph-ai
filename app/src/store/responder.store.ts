import { create } from 'zustand';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracyMeters?: number;
}

export interface FieldAssignment {
  assignmentId: string;
  incidentId: string;
  role: string;
  status: 'proposed' | 'dispatched' | 'en_route' | 'on_scene' | 'completed' | 'cancelled';
  incidentTitle?: string;
  incidentPriority?: 'critical' | 'high' | 'medium' | 'low';
  instructions?: string;
  targetLocation?: LocationPoint;
  assignedAt: string;
}

export interface OperationalAlert {
  alertId: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  message: string;
  areaDescription?: string;
  expiresAt?: string;
}

export interface FieldRouteGuidance {
  routeId: string;
  incidentId: string;
  waypoints: LocationPoint[];
  estimatedDistanceKm: number;
  estimatedDurationMinutes: number;
  avoidRoadIds?: string[];
  hazardsReported?: string[];
}

export interface FieldNotification {
  id: string;
  timestamp: string;
  title: string;
  body: string;
  category: 'assignment' | 'alert' | 'route' | 'system';
}

export interface ResponderState {
  user: {
    userId: string;
    email: string;
    role: string;
    badgeNumber?: string;
  } | null;
  token: string | null;
  status: 'available' | 'assigned' | 'en_route' | 'on_scene' | 'offline';
  location: LocationPoint | null;
  batteryLevel: number;
  isOnline: boolean;
  activeAssignment: FieldAssignment | null;
  activeAlerts: OperationalAlert[];
  routeGuidance: FieldRouteGuidance | null;
  notifications: FieldNotification[];

  setAuth: (user: ResponderState['user'], token: string) => void;
  clearAuth: () => void;
  setStatus: (status: ResponderState['status']) => void;
  setLocation: (location: LocationPoint) => void;
  setBatteryLevel: (level: number) => void;
  setNetworkStatus: (isOnline: boolean) => void;
  setActiveAssignment: (assignment: FieldAssignment | null) => void;
  setActiveAlerts: (alerts: OperationalAlert[]) => void;
  setRouteGuidance: (route: FieldRouteGuidance | null) => void;
  addNotification: (notification: Omit<FieldNotification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
}

export const useResponderStore = create<ResponderState>((set) => ({
  user: null,
  token: null,
  status: 'available',
  location: null,
  batteryLevel: 100,
  isOnline: true,
  activeAssignment: null,
  activeAlerts: [],
  routeGuidance: null,
  notifications: [],

  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
  setStatus: (status) => set({ status }),
  setLocation: (location) => set({ location }),
  setBatteryLevel: (level) => set({ batteryLevel: level }),
  setNetworkStatus: (isOnline) => set({ isOnline }),
  setActiveAssignment: (activeAssignment) => set({ activeAssignment }),
  setActiveAlerts: (activeAlerts) => set({ activeAlerts }),
  setRouteGuidance: (routeGuidance) => set({ routeGuidance }),
  addNotification: (notif) =>
    set((state) => ({
      notifications: [
        {
          ...notif,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
        ...state.notifications.slice(0, 49),
      ],
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

