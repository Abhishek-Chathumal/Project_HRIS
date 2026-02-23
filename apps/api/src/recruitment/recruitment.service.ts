import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class RecruitmentService {
    private readonly logger = new Logger(RecruitmentService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getJobPostings(params: { status?: string; page?: number; limit?: number } = {}) {
        const { status, page = 1, limit = 20 } = params;
        const where: Record<string, unknown> = {};
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.jobPosting.findMany({
                where,
                include: {
                    position: { select: { title: true, department: { select: { name: true } } } },
                    _count: { select: { applications: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.jobPosting.count({ where }),
        ]);

        return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    async getJobPosting(id: string) {
        const posting = await this.prisma.jobPosting.findUnique({
            where: { id },
            include: {
                position: { select: { title: true, department: { select: { name: true } } } },
                applications: {
                    include: {
                        interviews: { orderBy: { scheduledAt: 'asc' } },
                    },
                    orderBy: { appliedAt: 'desc' },
                },
            },
        });
        if (!posting) throw new NotFoundException('Job posting not found');
        return posting;
    }

    async createJobPosting(data: {
        title: string; description: string; requirements?: string; benefits?: string;
        employmentType: string; experienceLevel?: string; salaryMin?: number; salaryMax?: number;
        location?: string; isRemote?: boolean; openings?: number; positionId?: string;
        createdBy: string;
    }) {
        const posting = await this.prisma.jobPosting.create({
            data: {
                title: data.title,
                description: data.description,
                requirements: data.requirements,
                benefits: data.benefits,
                employmentType: data.employmentType,
                experienceLevel: data.experienceLevel,
                salaryMin: data.salaryMin,
                salaryMax: data.salaryMax,
                location: data.location,
                isRemote: data.isRemote ?? false,
                openings: data.openings ?? 1,
                positionId: data.positionId,
                createdBy: data.createdBy,
                status: 'draft',
            },
        });
        this.logger.log(`Job posting created: ${posting.id} — ${data.title}`);
        return posting;
    }

    async updateJobPostingStatus(id: string, status: string) {
        const posting = await this.prisma.jobPosting.findUnique({ where: { id } });
        if (!posting) throw new NotFoundException('Job posting not found');

        const update: Record<string, unknown> = { status };
        if (status === 'open') update.publishedAt = new Date();

        return this.prisma.jobPosting.update({ where: { id }, data: update });
    }

    async getApplications(jobPostingId: string, params: { status?: string } = {}) {
        const where: Record<string, unknown> = { jobPostingId };
        if (params.status) where.status = params.status;

        return this.prisma.jobApplication.findMany({
            where,
            include: {
                interviews: { orderBy: { scheduledAt: 'asc' } },
            },
            orderBy: { appliedAt: 'desc' },
        });
    }

    async updateApplicationStatus(id: string, status: string, notes?: string) {
        const app = await this.prisma.jobApplication.findUnique({ where: { id } });
        if (!app) throw new NotFoundException('Application not found');

        const data: Record<string, unknown> = { status };
        if (notes) data.notes = notes;
        if (status === 'rejected' && notes) data.rejectionReason = notes;

        return this.prisma.jobApplication.update({ where: { id }, data });
    }

    async getRecruitmentSummary() {
        const [openJobs, totalApplicants, interviewsScheduled, hiredThisMonth] = await Promise.all([
            this.prisma.jobPosting.count({ where: { status: 'open' } }),
            this.prisma.jobApplication.count({ where: { status: { not: 'rejected' } } }),
            this.prisma.interview.count({ where: { status: 'scheduled' } }),
            this.prisma.jobApplication.count({
                where: {
                    status: 'hired',
                    updatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
                },
            }),
        ]);
        return { openJobs, totalApplicants, interviewsScheduled, hiredThisMonth };
    }
}
