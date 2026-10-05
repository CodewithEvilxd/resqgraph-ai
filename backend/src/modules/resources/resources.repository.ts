import { dbStore } from '../../db/index.js';
import { Resource } from '../../contracts/types/responder.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

export class ResourcesRepository {
  async findAll(organizationId: string): Promise<Resource[]> {
    return Array.from(dbStore.resources.values()).filter(
      (r) => r.organizationId === organizationId
    );
  }

  async findById(id: string): Promise<Resource | null> {
    return dbStore.resources.get(id) || null;
  }

  async create(resource: Resource): Promise<Resource> {
    dbStore.resources.set(resource.id, resource);
    return resource;
  }

  async allocate(id: string, count: number): Promise<Resource> {
    const resource = dbStore.resources.get(id);
    if (!resource) {
      throw new NotFoundError(`Resource ${id} not found`);
    }

    if (resource.availableQuantity < count) {
      throw new ConflictError(
        `Insufficient available quantity for ${resource.name}. Requested: ${count}, Available: ${resource.availableQuantity}`
      );
    }

    resource.availableQuantity -= count;
    resource.updatedAt = new Date().toISOString();
    return resource;
  }

  async release(id: string, count: number): Promise<Resource> {
    const resource = dbStore.resources.get(id);
    if (!resource) {
      throw new NotFoundError(`Resource ${id} not found`);
    }

    resource.availableQuantity = Math.min(resource.quantity, resource.availableQuantity + count);
    resource.updatedAt = new Date().toISOString();
    return resource;
  }
}

export const resourcesRepository = new ResourcesRepository();
