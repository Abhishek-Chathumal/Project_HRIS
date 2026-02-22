import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PolicyService {
    private readonly logger = new Logger(PolicyService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(data: {
        organizationId: string;
        category: string;
        name: string;
        description?: string;
        content: string;
        rules?: object;
        appliesTo?: object;
        effectiveDate?: Date;
        requiresAcknowledgment?: boolean;
        createdBy: string;
    }) {
        const slug = this.generateSlug(data.name);

        const policy = await this.prisma.policy.create({
            data: {
                organizationId: data.organizationId,
                category: data.category,
                name: data.name,
                slug,
                description: data.description,
                content: data.content,
                rules: data.rules as any,
                appliesTo: data.appliesTo as any,
                effectiveDate: data.effectiveDate,
                requiresAcknowledgment: data.requiresAcknowledgment ?? false,
                createdBy: data.createdBy,
                status: 'draft',
            },
        });

        // Create initial version
        await this.prisma.policyVersion.create({
            data: {
                policyId: policy.id,
                version: 1,
                content: data.content,
                rules: data.rules as any,
                changeLog: 'Initial version',
                createdBy: data.createdBy,
            },
        });

        this.logger.log(`Policy created: ${policy.name} (${policy.category})`);
        return policy;
    }

    async update(id: string, data: {
        content?: string;
        rules?: object;
        appliesTo?: object;
        changeLog?: string;
        updatedBy: string;
    }) {
        const existing = await this.prisma.policy.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Policy not found');

        const newVersion = existing.version + 1;

        const policy = await this.prisma.$transaction(async (tx) => {
            // Create new version
            await tx.policyVersion.create({
                data: {
                    policyId: id,
                    version: newVersion,
                    content: data.content || existing.content,
                    rules: data.rules as any,
                    changeLog: data.changeLog || `Version ${newVersion}`,
                    createdBy: data.updatedBy,
                },
            });

            // Update current policy
            return tx.policy.update({
                where: { id },
                data: {
                    content: data.content,
                    rules: data.rules as any,
                    appliesTo: data.appliesTo as any,
                    version: newVersion,
                },
            });
        });

        this.logger.log(`Policy updated: ${policy.name} → v${newVersion}`);
        return policy;
    }

    async activate(id: string, approvedBy: string) {
        const policy = await this.prisma.policy.update({
            where: { id },
            data: {
                status: 'active',
                approvedBy,
                effectiveDate: new Date(),
            },
        });

        this.logger.log(`Policy activated: ${policy.name}`);
        return policy;
    }

    async findAll(params: {
        organizationId: string;
        category?: string;
        status?: string;
        page?: number;
        limit?: number;
    }) {
        const { organizationId, category, status, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const where: Record<string, unknown> = { organizationId };

        if (category) where.category = category;
        if (status) where.status = status;

        const [policies, total] = await Promise.all([
            this.prisma.policy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.policy.count({ where }),
        ]);

        return {
            data: policies,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async getVersionHistory(policyId: string) {
        return this.prisma.policyVersion.findMany({
            where: { policyId },
            orderBy: { version: 'desc' },
        });
    }

    /**
     * Evaluate policy rules against context — used by the policy engine
     * to dynamically adapt application behavior
     */
    async evaluateRules(category: string, organizationId: string, context: Record<string, unknown>) {
        const policies = await this.prisma.policy.findMany({
            where: {
                organizationId,
                category,
                status: 'active',
            },
            select: { rules: true, name: true },
        });

        const results: Array<{ policy: string; matched: boolean; actions: unknown[] }> = [];

        for (const policy of policies) {
            if (!policy.rules) continue;

            const rules = policy.rules as { conditions?: unknown[]; actions?: unknown[] };
            // Simple rule evaluation — in production, use a proper rules engine
            const matched = this.evaluateConditions(rules.conditions || [], context);

            results.push({
                policy: policy.name,
                matched,
                actions: matched ? (rules.actions || []) : [],
            });
        }

        return results;
    }

    private evaluateConditions(conditions: unknown[], context: Record<string, unknown>): boolean {
        // Simplified rule evaluation — extensible for complex policy engine
        // In production: integrate with a proper rules engine (e.g., json-rules-engine)
        return conditions.every((condition: any) => {
            const { field, operator, value } = condition;
            const contextValue = context[field];

            switch (operator) {
                case 'equals': return contextValue === value;
                case 'not_equals': return contextValue !== value;
                case 'greater_than': return (contextValue as number) > value;
                case 'less_than': return (contextValue as number) < value;
                case 'in': return Array.isArray(value) && value.includes(contextValue);
                case 'contains': return String(contextValue).includes(String(value));
                default: return false;
            }
        });
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
}
