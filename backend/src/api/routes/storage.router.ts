import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { storageService } from '../../services/storage.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';

const requestUploadUrlSchema = z.object({
  incidentId: z.string().uuid(),
  mimeType: z.string(),
  fileSizeBytes: z.number().int().positive().optional(),
});

type RequestUploadUrlInput = z.infer<typeof requestUploadUrlSchema>;

export async function storageRouter(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: RequestUploadUrlInput }>(
    '/api/v1/storage/presigned-url',
    {
      preHandler: [authenticate, validateBody(requestUploadUrlSchema)],
    },
    async (request, reply) => {
      const orgId = request.user!.organizationId;
      const { incidentId, mimeType, fileSizeBytes } = request.body;

      const presigned = storageService.generatePresignedUploadUrl(
        orgId,
        incidentId,
        mimeType,
        fileSizeBytes
      );

      return reply.status(200).send({
        success: true,
        data: presigned,
      });
    }
  );
}
