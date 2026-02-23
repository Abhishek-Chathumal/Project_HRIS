import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PerformanceService {
    private readonly logger = new Logger(PerformanceService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getReviews(params: { employeeId?: string; status?: string; reviewType?: string; page?: number; limit?: number } = {}) {
        const { employeeId, status, reviewType, page = 1, limit = 20 } = params;
        const where: Record<string, unknown> = {};
        if (employeeId) where.employeeId = employeeId;
        if (status) where.status = status;
        if (reviewType) where.reviewType = reviewType;

        const [data, total] = await Promise.all([
            this.prisma.performanceReview.findMany({
                where,
                include: {
                    employee: { select: { firstName: true, lastName: true, employeeNumber: true, department: { select: { name: true } } } },
                    reviewer: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.performanceReview.count({ where }),
        ]);

        return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    async getReview(id: string) {
        const review = await this.prisma.performanceReview.findUnique({
            where: { id },
            include: {
                employee: { select: { firstName: true, lastName: true, employeeNumber: true, department: { select: { name: true } }, position: { select: { title: true } } } },
                reviewer: { select: { firstName: true, lastName: true } },
            },
        });
        if (!review) throw new NotFoundException('Performance review not found');
        return review;
    }

    async createReview(data: {
        employeeId: string; reviewerId: string; reviewType: string; period: string;
        goals?: unknown; competencies?: unknown;
    }) {
        const review = await this.prisma.performanceReview.create({
            data: {
                employeeId: data.employeeId,
                reviewerId: data.reviewerId,
                reviewType: data.reviewType,
                period: data.period,
                goals: data.goals as never,
                competencies: data.competencies as never,
                status: 'draft',
            },
        });
        this.logger.log(`Performance review created: ${review.id}`);
        return review;
    }

    async updateReviewRatings(id: string, data: { selfRating?: number; reviewerRating?: number; finalRating?: number; strengths?: string; improvements?: string; comments?: string; status?: string }) {
        return this.prisma.performanceReview.update({
            where: { id },
            data: {
                ...data,
                ...(data.status === 'completed' ? { completedAt: new Date() } : {}),
            },
        });
    }

    async getPerformanceSummary() {
        const [total, completed, inProgress, averageRating] = await Promise.all([
            this.prisma.performanceReview.count(),
            this.prisma.performanceReview.count({ where: { status: 'completed' } }),
            this.prisma.performanceReview.count({ where: { status: { in: ['draft', 'self_review', 'manager_review'] } } }),
            this.prisma.performanceReview.aggregate({ _avg: { finalRating: true }, where: { status: 'completed' } }),
        ]);

        return {
            totalReviews: total,
            completed,
            inProgress,
            averageRating: averageRating._avg.finalRating ? Number(averageRating._avg.finalRating).toFixed(1) : 'N/A',
        };
    }
}
