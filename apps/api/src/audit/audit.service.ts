import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly prisma: PrismaService) { }

    async log(data: {
        userId?: string;
        action: string;
        resource: string;
        resourceId?: string;
        oldValue?: object;
        newValue?: object;
        ipAddress?: string;
        userAgent?: string;
        metadata?: object;
    }) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    resource: data.resource,
                    resourceId: data.resourceId,
                    oldValue: data.oldValue as any,
                    newValue: data.newValue as any,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    metadata: data.metadata as any,
                },
            });
        } catch (error) {
            // Never let audit logging failures break the application
            this.logger.error(`Failed to create audit log: ${(error as Error).message}`);
        }
    }

    async getAuditTrail(params: {
        userId?: string;
        resource?: string;
        resourceId?: string;
        action?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }) {
        const { userId, resource, resourceId, action, startDate, endDate, page = 1, limit = 50 } = params;
        const skip = (page - 1) * limit;
        const where: Record<string, unknown> = {};

        if (userId) where.userId = userId;
        if (resource) where.resource = resource;
        if (resourceId) where.resourceId = resourceId;
        if (action) where.action = action;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) (where.createdAt as any).gte = startDate;
            if (endDate) (where.createdAt as any).lte = endDate;
        }

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: { select: { email: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            data: logs,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
}
