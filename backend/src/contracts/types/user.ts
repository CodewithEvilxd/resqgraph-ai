import { UserRole } from '../constants/roles.js';

export interface Organization {
  id: string;
  name: string;
  code: string;
  jurisdictionGeofence?: Record<string, unknown>; // GeoJSON Polygon
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  organizationId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresIn: number;
}
