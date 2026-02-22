import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LeaveService {
    private readonly logger = new Logger(LeaveService.name);

    constructor(private readonly prisma: PrismaService) { }

    async applyLeave(data: {
        employeeId: string;
        leaveTypeId: string;
        startDate: Date;
        endDate: Date;
        reason?: string;
        isHalfDay?: boolean;
        halfDayType?: string;
    }) {
        const leaveType = await this.prisma.leaveType.findUnique({
            where: { id: data.leaveTypeId },
        });

        if (!leaveType || !leaveType.isActive) {
            throw new BadRequestException('Invalid or inactive leave type');
        }

        // Calculate total days
        const totalDays = data.isHalfDay
            ? 0.5
            : this.calculateBusinessDays(data.startDate, data.endDate);

        // Check balance
        const balance = await this.prisma.leaveBalance.findFirst({
            where: {
                employeeId: data.employeeId,
                leaveTypeId: data.leaveTypeId,
                year: new Date().getFullYear(),
            },
        });

        if (!balance) {
            throw new BadRequestException('No leave balance found for this leave type');
        }

        const available = Number(balance.entitled) + Number(balance.carriedOver) + Number(balance.adjusted)
            - Number(balance.used) - Number(balance.pending);

        if (totalDays > available) {
            throw new BadRequestException(
                `Insufficient leave balance. Available: ${available} days, Requested: ${totalDays} days`,
            );
        }

        // Get manager as approver
        const employee = await this.prisma.employee.findUnique({
            where: { id: data.employeeId },
            select: { managerId: true },
        });

        // Create leave request
        const request = await this.prisma.leaveRequest.create({
            data: {
                employeeId: data.employeeId,
                leaveTypeId: data.leaveTypeId,
                startDate: data.startDate,
                endDate: data.endDate,
                totalDays,
                isHalfDay: data.isHalfDay || false,
                halfDayType: data.halfDayType,
                reason: data.reason,
                status: leaveType.requiresApproval ? 'pending' : 'approved',
                approverId: employee?.managerId,
            },
            include: {
                leaveType: { select: { name: true, code: true } },
            },
        });

        // Update pending balance
        await this.prisma.leaveBalance.update({
            where: { id: balance.id },
            data: { pending: { increment: totalDays } },
        });

        this.logger.log(`Leave request created: ${request.id} — ${totalDays} days`);

        return request;
    }

    async approveLeave(requestId: string, approverId: string) {
        const request = await this.prisma.leaveRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) throw new NotFoundException('Leave request not found');
        if (request.status !== 'pending') {
            throw new BadRequestException('Leave request is not pending');
        }

        // Update request status
        const updated = await this.prisma.leaveRequest.update({
            where: { id: requestId },
            data: {
                status: 'approved',
                approverId,
                actionAt: new Date(),
            },
        });

        // Move from pending to used
        const balance = await this.prisma.leaveBalance.findFirst({
            where: {
                employeeId: request.employeeId,
                leaveTypeId: request.leaveTypeId,
                year: new Date().getFullYear(),
            },
        });

        if (balance) {
            await this.prisma.leaveBalance.update({
                where: { id: balance.id },
                data: {
                    pending: { decrement: Number(request.totalDays) },
                    used: { increment: Number(request.totalDays) },
                },
            });
        }

        this.logger.log(`Leave approved: ${requestId}`);
        return updated;
    }

    async rejectLeave(requestId: string, approverId: string, reason: string) {
        const request = await this.prisma.leaveRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) throw new NotFoundException('Leave request not found');
        if (request.status !== 'pending') {
            throw new BadRequestException('Leave request is not pending');
        }

        const updated = await this.prisma.leaveRequest.update({
            where: { id: requestId },
            data: {
                status: 'rejected',
                approverId,
                rejectionReason: reason,
                actionAt: new Date(),
            },
        });

        // Restore pending balance
        const balance = await this.prisma.leaveBalance.findFirst({
            where: {
                employeeId: request.employeeId,
                leaveTypeId: request.leaveTypeId,
                year: new Date().getFullYear(),
            },
        });

        if (balance) {
            await this.prisma.leaveBalance.update({
                where: { id: balance.id },
                data: { pending: { decrement: Number(request.totalDays) } },
            });
        }

        this.logger.log(`Leave rejected: ${requestId}`);
        return updated;
    }

    async getLeaveBalance(employeeId: string, year?: number) {
        const targetYear = year || new Date().getFullYear();

        return this.prisma.leaveBalance.findMany({
            where: { employeeId, year: targetYear },
            include: {
                leaveType: { select: { name: true, code: true, color: true, isPaid: true } },
            },
        });
    }

    async getLeaveRequests(params: {
        employeeId?: string;
        approverId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }) {
        const { employeeId, approverId, status, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const where: Record<string, unknown> = {};

        if (employeeId) where.employeeId = employeeId;
        if (approverId) where.approverId = approverId;
        if (status) where.status = status;

        const [requests, total] = await Promise.all([
            this.prisma.leaveRequest.findMany({
                where,
                skip,
                take: limit,
                include: {
                    employee: { select: { firstName: true, lastName: true, employeeNumber: true } },
                    leaveType: { select: { name: true, code: true, color: true } },
                    approver: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.leaveRequest.count({ where }),
        ]);

        return {
            data: requests,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    private calculateBusinessDays(startDate: Date, endDate: Date): number {
        let count = 0;
        const current = new Date(startDate);

        while (current <= endDate) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }

        return count;
    }
}
