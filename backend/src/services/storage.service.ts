import { env } from '../config/env.js';
import { ValidationError } from '../utils/errors.js';
import { generateUUID } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

const log = logger.child('StorageService');

const ALLOWED_MIME_TYPES = new Map<string, { type: 'image' | 'audio' | 'video'; maxSize: number }>([
  ['image/jpeg', { type: 'image', maxSize: 10 * 1024 * 1024 }],
  ['image/png', { type: 'image', maxSize: 10 * 1024 * 1024 }],
  ['image/webp', { type: 'image', maxSize: 10 * 1024 * 1024 }],
  ['audio/mpeg', { type: 'audio', maxSize: 15 * 1024 * 1024 }],
  ['audio/wav', { type: 'audio', maxSize: 15 * 1024 * 1024 }],
  ['audio/ogg', { type: 'audio', maxSize: 15 * 1024 * 1024 }],
  ['video/mp4', { type: 'video', maxSize: 50 * 1024 * 1024 }],
  ['video/webm', { type: 'video', maxSize: 50 * 1024 * 1024 }],
]);

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  storageKey: string;
  expiresInSeconds: number;
  mimeType: string;
  maxSizeBytes: number;
}

export class StorageService {
  private bucket: string;

  constructor() {
    this.bucket = env.STORAGE_BUCKET_INCIDENT_EVIDENCE;
  }

  validateMedia(mimeType: string, fileSizeBytes?: number): { mediaType: 'image' | 'audio' | 'video' } {
    const config = ALLOWED_MIME_TYPES.get(mimeType.toLowerCase());
    if (!config) {
      log.warn('Rejected upload with unauthorized MIME type', { mimeType });
      throw new ValidationError(
        `Unsupported media type: ${mimeType}. Allowed formats: JPEG, PNG, WEBP, MP3, WAV, OGG, MP4, WEBM`
      );
    }

    if (fileSizeBytes && fileSizeBytes > config.maxSize) {
      log.warn('Rejected upload exceeding size limit', { mimeType, fileSizeBytes, maxSize: config.maxSize });
      throw new ValidationError(
        `File size (${(fileSizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${(config.maxSize / (1024 * 1024))}MB for ${config.type}`
      );
    }

    return { mediaType: config.type };
  }

  generatePresignedUploadUrl(
    organizationId: string,
    incidentId: string,
    mimeType: string,
    fileSizeBytes?: number
  ): PresignedUploadResult {
    this.validateMedia(mimeType, fileSizeBytes);
    const mediaConfig = ALLOWED_MIME_TYPES.get(mimeType.toLowerCase())!;

    const fileExt = mimeType.split('/')[1] || 'bin';
    const storageKey = `${this.bucket}/${organizationId}/${incidentId}/${generateUUID()}.${fileExt}`;
    const uploadUrl = `${env.API_BASE_URL}/api/v1/storage/upload/${encodeURIComponent(storageKey)}`;
    const publicUrl = `${env.API_BASE_URL}/api/v1/storage/media/${encodeURIComponent(storageKey)}`;

    return {
      uploadUrl,
      publicUrl,
      storageKey,
      expiresInSeconds: 900, // 15 minutes
      mimeType,
      maxSizeBytes: mediaConfig.maxSize,
    };
  }
}

export const storageService = new StorageService();
