import { SourceType, HazardType, IncidentPriority } from '../constants/priorities.js';
import { LocationPoint } from './incident.js';

export interface ReportExtraction {
  hazardType?: HazardType;
  suggestedPriority?: IncidentPriority;
  peopleAffected?: number;
  extractedLocation?: LocationPoint;
  urgencyKeywords: string[];
  hazardsIdentified: string[];
  accessibilityNotes?: string;
  confidence: number;
}

export interface Report {
  id: string;
  incidentId?: string;
  organizationId: string;
  authorId?: string; // null if anonymous citizen
  sourceType: SourceType;
  clientEventId?: string; // for offline idempotency
  rawContent: string;
  languageDetected?: string;
  transcription?: string; // for audio
  location?: LocationPoint;
  extraction?: ReportExtraction;
  isVerified: boolean;
  verifiedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}
