import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class TrainingService {
    private readonly logger = new Logger(TrainingService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getCourses(params: { category?: string; isActive?: boolean; page?: number; limit?: number } = {}) {
        const { category, isActive = true, page = 1, limit = 20 } = params;
        const where: Record<string, unknown> = { isActive };
        if (category) where.category = category;

        const [data, total] = await Promise.all([
            this.prisma.trainingCourse.findMany({
                where,
                include: { _count: { select: { enrollments: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.trainingCourse.count({ where }),
        ]);

        return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    async getCourse(id: string) {
        const course = await this.prisma.trainingCourse.findUnique({
            where: { id },
            include: {
                enrollments: {
                    include: {
                        employee: { select: { firstName: true, lastName: true, employeeNumber: true, department: { select: { name: true } } } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async createCourse(data: {
        title: string; description?: string; category: string; provider?: string;
        format: string; duration?: number; maxParticipants?: number; cost?: number;
        currency?: string; isMandatory?: boolean; skills?: string[];
    }) {
        const course = await this.prisma.trainingCourse.create({ data });
        this.logger.log(`Training course created: ${course.id} — ${data.title}`);
        return course;
    }

    async enrollEmployee(courseId: string, employeeId: string) {
        const existing = await this.prisma.trainingEnrollment.findUnique({
            where: { courseId_employeeId: { courseId, employeeId } },
        });
        if (existing) throw new NotFoundException('Employee is already enrolled');

        return this.prisma.trainingEnrollment.create({
            data: {
                courseId, employeeId,
                status: 'enrolled',
                startDate: new Date(),
            },
        });
    }

    async updateEnrollment(id: string, data: { progress?: number; status?: string; score?: number; feedback?: string; rating?: number }) {
        const update: Record<string, unknown> = { ...data };
        if (data.status === 'completed') update.completionDate = new Date();

        return this.prisma.trainingEnrollment.update({ where: { id }, data: update });
    }

    async getMyEnrollments(employeeId: string) {
        return this.prisma.trainingEnrollment.findMany({
            where: { employeeId },
            include: {
                course: { select: { title: true, category: true, format: true, duration: true, provider: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getTrainingSummary() {
        const [totalCourses, activeCourses, totalEnrollments, completedEnrollments, avgCompletion] = await Promise.all([
            this.prisma.trainingCourse.count(),
            this.prisma.trainingCourse.count({ where: { isActive: true } }),
            this.prisma.trainingEnrollment.count(),
            this.prisma.trainingEnrollment.count({ where: { status: 'completed' } }),
            this.prisma.trainingEnrollment.aggregate({ _avg: { progress: true } }),
        ]);

        return {
            totalCourses,
            activeCourses,
            totalEnrollments,
            completedEnrollments,
            completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
            avgProgress: Math.round(avgCompletion._avg.progress || 0),
        };
    }
}
