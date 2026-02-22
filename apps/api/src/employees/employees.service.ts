import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class EmployeesService {
    private readonly logger = new Logger(EmployeesService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        departmentId?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page = 1,
            limit = 20,
            search,
            departmentId,
            status = 'active',
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = params;

        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        if (status) {
            where.employmentStatus = status;
        }

        if (departmentId) {
            where.departmentId = departmentId;
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { employeeNumber: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [employees, total] = await Promise.all([
            this.prisma.employee.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: { select: { email: true, isActive: true, lastLoginAt: true } },
                    department: { select: { id: true, name: true } },
                    position: { select: { id: true, title: true } },
                    location: { select: { id: true, name: true } },
                    manager: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.employee.count({ where }),
        ]);

        return {
            data: employees,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: string) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        isActive: true,
                        lastLoginAt: true,
                        roles: { include: { role: true } },
                    },
                },
                department: true,
                position: true,
                location: true,
                manager: {
                    select: { id: true, firstName: true, lastName: true, photoUrl: true },
                },
                subordinates: {
                    select: { id: true, firstName: true, lastName: true, photoUrl: true, employeeNumber: true },
                },
                documents: true,
                skills: true,
                leaveBalances: {
                    include: { leaveType: { select: { name: true, code: true, color: true } } },
                    where: { year: new Date().getFullYear() },
                },
            },
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        return employee;
    }

    async create(data: {
        userId: string;
        employeeNumber: string;
        firstName: string;
        lastName: string;
        joiningDate: Date;
        departmentId?: string;
        positionId?: string;
        locationId?: string;
        managerId?: string;
        employmentType?: string;
        [key: string]: unknown;
    }) {
        const employee = await this.prisma.employee.create({
            data: {
                userId: data.userId,
                employeeNumber: data.employeeNumber,
                firstName: data.firstName,
                lastName: data.lastName,
                joiningDate: data.joiningDate,
                departmentId: data.departmentId,
                positionId: data.positionId,
                locationId: data.locationId,
                managerId: data.managerId,
                employmentType: data.employmentType || 'full-time',
            },
            include: {
                department: { select: { name: true } },
                position: { select: { title: true } },
            },
        });

        this.logger.log(`Employee created: ${employee.employeeNumber} — ${employee.firstName} ${employee.lastName}`);

        return employee;
    }

    async update(id: string, data: Record<string, unknown>) {
        // Track changes for employment history
        const existing = await this.findById(id);

        const employee = await this.prisma.employee.update({
            where: { id },
            data,
            include: {
                department: { select: { name: true } },
                position: { select: { title: true } },
            },
        });

        this.logger.log(`Employee updated: ${employee.employeeNumber}`);

        return employee;
    }

    async getOrgChart(departmentId?: string) {
        const where: Record<string, unknown> = {
            employmentStatus: 'active',
            managerId: null, // Top-level managers
        };

        if (departmentId) {
            where.departmentId = departmentId;
        }

        const topLevel = await this.prisma.employee.findMany({
            where,
            include: {
                position: { select: { title: true } },
                department: { select: { name: true } },
                subordinates: {
                    include: {
                        position: { select: { title: true } },
                        subordinates: {
                            include: {
                                position: { select: { title: true } },
                                subordinates: {
                                    select: { id: true, firstName: true, lastName: true, photoUrl: true },
                                },
                            },
                            select: { id: true, firstName: true, lastName: true, photoUrl: true, position: true, subordinates: true },
                        },
                    },
                    select: { id: true, firstName: true, lastName: true, photoUrl: true, position: true, subordinates: true },
                },
            },
            select: { id: true, firstName: true, lastName: true, photoUrl: true, position: true, department: true, subordinates: true },
        });

        return topLevel;
    }
}
