import { SourceType } from '../constants/priorities.js';
import { LocationPoint } from './incident.js';

export type MediaType = 'text' | 'image' | 'audio' | 'video' | 'sensor_telemetry';

export interface EvidenceObservation {
  label: string;
  confidence: number;
  boundingBox?: [number, number, number, number];
  timestampSec?: number;
}

export interface Evidence {
  id: string;
  incidentId: string;
  reportId?: string;
  organizationId: string;
  sourceType: SourceType;
  mediaType: MediaType;
  mediaUrl?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  sha256Hash?: string;
  location?: LocationPoint;
  locationConfidence: number; // 0.0 - 1.0
  extractionConfidence: number; // 0.0 - 1.0
  observations: EvidenceObservation[];
  contradictionFlags: string[];
  isVerified: boolean;
  verifiedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceLink {
  id: string;
  evidenceIdA: string;
  evidenceIdB: string;
  relationType: 'supports' | 'contradicts' | 'duplicates' | 'corroborates';
  confidence: number;
  reasoning: string;
  createdAt: string;
}
