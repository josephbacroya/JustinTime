import { PrismaClient } from '@prisma/client';
import { Result } from '../../shared/core/Result';

export interface CreateTenantDTO {
  name: string;
}

export interface TenantResponse {
  id: string;
  name: string;
  createdAt: Date;
}

export class TenantService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Creates a new isolated tenant.
   */
  public async createTenant(dto: CreateTenantDTO): Promise<Result<TenantResponse, Error>> {
    try {
      if (!dto.name || dto.name.trim() === '') {
        return Result.fail(new Error('Tenant name is required.'));
      }

      const tenant = await this.prisma.tenant.create({
        data: {
          name: dto.name,
        },
      });

      return Result.ok({
        id: tenant.id,
        name: tenant.name,
        createdAt: tenant.createdAt,
      });
    } catch (error) {
      // Log error internally, do not leak sensitive DB info to caller
      console.error('[TenantService] Error creating tenant:', error);
      return Result.fail(new Error('Failed to create tenant due to an internal error.'));
    }
  }

  /**
   * Retrieves a tenant by ID.
   */
  public async getTenantById(id: string): Promise<Result<TenantResponse, Error>> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id },
      });

      if (!tenant) {
        return Result.fail(new Error('Tenant not found.'));
      }

      return Result.ok({
        id: tenant.id,
        name: tenant.name,
        createdAt: tenant.createdAt,
      });
    } catch (error) {
      console.error(`[TenantService] Error retrieving tenant ${id}:`, error);
      return Result.fail(new Error('Failed to retrieve tenant.'));
    }
  }
}
