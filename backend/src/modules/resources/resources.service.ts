import { resourcesRepository } from './resources.repository.js';
import { auditService } from '../audit/audit.service.js';
import { Resource } from '../../contracts/types/responder.js';
import { AuthTokenPayload } from '../../contracts/types/user.js';
import { AUDIT_ACTIONS } from '../../contracts/constants/events.js';
import { generateUUID } from '../../utils/crypto.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';

export class ResourcesService {
  async list(organizationId: string): Promise<Resource[]> {
    return resourcesRepository.findAll(organizationId);
  }

  async getById(id: string, organizationId: string): Promise<Resource> {
    const res = await resourcesRepository.findById(id);
    if (!res || res.organizationId !== organizationId) {
      throw new NotFoundError(`Resource ${id} not found`);
    }
    return res;
  }

  async create(
    input: Omit<Resource, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>,
    user: AuthTokenPayload
  ): Promise<Resource> {
    if (!['commander', 'admin'].includes(user.role)) {
      throw new ForbiddenError('Creating resources requires commander or admin privileges');
    }

    const now = new Date().toISOString();
    const id = generateUUID();

    const resource: Resource = {
      id,
      organizationId: user.organizationId,
      name: input.name,
      category: input.category,
      quantity: input.quantity,
      availableQuantity: input.availableQuantity,
      location: input.location,
      isDeployable: input.isDeployable,
      createdAt: now,
      updatedAt: now,
    };

    const created = await resourcesRepository.create(resource);

    await auditService.record({
      organizationId: user.organizationId,
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.INCIDENT_UPDATE,
      targetEntity: 'resource',
      targetEntityId: created.id,
      details: { name: created.name, category: created.category, quantity: created.quantity },
    });

    return created;
  }
}

export const resourcesService = new ResourcesService();
