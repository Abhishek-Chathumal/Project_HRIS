import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                isActive: true,
                isEmailVerified: true,
                mfaEnabled: true,
                lastLoginAt: true,
                createdAt: true,
                roles: {
                    select: {
                        role: {
                            select: { name: true, displayName: true },
                        },
                    },
                },
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeNumber: true,
                        photoUrl: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
    }

    async findAll(params: { page?: number; limit?: number; search?: string }) {
        const { page = 1, limit = 20, search } = params;
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { email: { contains: search, mode: 'insensitive' as const } },
                    {
                        employee: {
                            OR: [
                                { firstName: { contains: search, mode: 'insensitive' as const } },
                                { lastName: { contains: search, mode: 'insensitive' as const } },
                            ],
                        },
                    },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                    roles: {
                        select: { role: { select: { name: true, displayName: true } } },
                    },
                    employee: {
                        select: {
                            firstName: true,
                            lastName: true,
                            employeeNumber: true,
                            photoUrl: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
