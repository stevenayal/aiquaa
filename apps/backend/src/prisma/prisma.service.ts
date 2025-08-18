import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });

    // Middleware para soft delete
    this.$use(async (params, next) => {
      // Soft delete middleware
      if (params.action === 'delete') {
        params.action = 'update';
        params.args['data'] = { deletedAt: new Date() };
      }
      
      // Soft delete filter middleware
      if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'findUnique') {
        if (params.args?.where && !params.args?.where?.includeDeleted) {
          params.args['where'] = {
            ...params.args.where,
            deletedAt: null,
          };
        }
        // Remove includeDeleted flag from where clause
        if (params.args?.where?.includeDeleted) {
          delete params.args.where.includeDeleted;
        }
      }

      // Audit middleware
      if (['create', 'update', 'delete'].includes(params.action)) {
        const result = await next(params);
        
        // Create audit log entry
        try {
          const auditData = {
            entity: params.model,
            entityId: result?.id || params.args?.where?.id || 'unknown',
            action: params.action.toUpperCase(),
            userId: this.getCurrentUserId(), // This should be implemented based on your auth context
            payload: {
              before: params.action === 'update' ? params.args?.data : null,
              after: params.action === 'create' ? result : null,
              changes: params.action === 'update' ? this.getChanges(params.args?.data) : null,
            },
          };

          await this.auditLog.create({
            data: auditData,
          });
        } catch (error) {
          // Log audit error but don't fail the main operation
          console.error('Audit log creation failed:', error);
        }

        return result;
      }

      return next(params);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private getCurrentUserId(): string | null {
    // This should be implemented based on your authentication context
    // For now, returning null - you'll need to integrate with your auth system
    return null;
  }

  private getChanges(data: any): any {
    // Extract meaningful changes from the update data
    if (!data) return null;
    
    const changes: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'updatedAt' && key !== 'deletedAt') {
        changes[key] = value;
      }
    }
    return changes;
  }
}
