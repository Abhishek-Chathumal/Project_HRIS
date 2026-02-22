import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AttendanceService {
    private readonly logger = new Logger(AttendanceService.name);

    constructor(private readonly prisma: PrismaService) { }

    async clockIn(employeeId: string, data: { source?: string; ipAddress?: string; geoLocation?: object; locationId?: string }) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already clocked in today
        const existing = await this.prisma.attendanceRecord.findUnique({
            where: { employeeId_date: { employeeId, date: today } },
        });

        if (existing?.clockIn && !existing?.clockOut) {
            throw new BadRequestException('Already clocked in. Please clock out first.');
        }

        if (existing?.clockOut) {
            throw new BadRequestException('Already completed attendance for today.');
        }

        const record = await this.prisma.attendanceRecord.create({
            data: {
                employeeId,
                date: today,
                clockIn: new Date(),
                status: 'present',
                source: data.source || 'web',
                ipAddress: data.ipAddress,
                geoLocation: data.geoLocation as any,
                locationId: data.locationId,
            },
        });

        this.logger.log(`Clock in: ${employeeId}`);
        return record;
    }

    async clockOut(employeeId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const record = await this.prisma.attendanceRecord.findUnique({
            where: { employeeId_date: { employeeId, date: today } },
        });

        if (!record) {
            throw new BadRequestException('No clock-in record found for today.');
        }

        if (record.clockOut) {
            throw new BadRequestException('Already clocked out today.');
        }

        const clockOut = new Date();
        const workMinutes = Math.floor(
            (clockOut.getTime() - record.clockIn!.getTime()) / 60000,
        );
        const breakMinutes = record.breakMinutes || 0;
        const netWorkMinutes = workMinutes - breakMinutes;

        // Calculate overtime (assume 8h / 480min standard work day, policy-driven later)
        const standardMinutes = 480;
        const overtimeMinutes = Math.max(0, netWorkMinutes - standardMinutes);

        const updated = await this.prisma.attendanceRecord.update({
            where: { id: record.id },
            data: {
                clockOut,
                workMinutes: netWorkMinutes,
                overtimeMinutes,
            },
        });

        this.logger.log(`Clock out: ${employeeId} — ${netWorkMinutes} minutes worked`);
        return updated;
    }

    async getAttendance(params: {
        employeeId?: string;
        startDate: Date;
        endDate: Date;
        page?: number;
        limit?: number;
    }) {
        const { employeeId, startDate, endDate, page = 1, limit = 31 } = params;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {
            date: { gte: startDate, lte: endDate },
        };

        if (employeeId) {
            where.employeeId = employeeId;
        }

        const [records, total] = await Promise.all([
            this.prisma.attendanceRecord.findMany({
                where,
                skip,
                take: limit,
                include: {
                    employee: {
                        select: { firstName: true, lastName: true, employeeNumber: true },
                    },
                },
                orderBy: { date: 'desc' },
            }),
            this.prisma.attendanceRecord.count({ where }),
        ]);

        return {
            data: records,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async getAttendanceSummary(employeeId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const records = await this.prisma.attendanceRecord.findMany({
            where: {
                employeeId,
                date: { gte: startDate, lte: endDate },
            },
        });

        const summary = {
            totalDays: endDate.getDate(),
            present: records.filter((r) => r.status === 'present').length,
            absent: records.filter((r) => r.status === 'absent').length,
            late: records.filter((r) => r.status === 'late').length,
            halfDay: records.filter((r) => r.status === 'half-day').length,
            onLeave: records.filter((r) => r.status === 'leave').length,
            totalWorkMinutes: records.reduce((sum, r) => sum + (r.workMinutes || 0), 0),
            totalOvertimeMinutes: records.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0),
            averageWorkHours: 0,
        };

        if (summary.present > 0) {
            summary.averageWorkHours = Math.round(
                (summary.totalWorkMinutes / summary.present / 60) * 10,
            ) / 10;
        }

        return summary;
    }
}
