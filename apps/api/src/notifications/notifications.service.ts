import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async send(data: {
        type: string;
        title: string;
        message: string;
        recipientUserIds: string[];
        priority?: string;
        data?: object;
        channels?: string[];
    }) {
        const notification = await this.prisma.notification.create({
            data: {
                type: data.type,
                title: data.title,
                message: data.message,
                priority: data.priority || 'normal',
                data: data.data as any,
                recipients: {
                    create: data.recipientUserIds.map((userId) => ({
                        userId,
                        channel: 'in_app',
                    })),
                },
            },
        });

        this.logger.log(`Notification sent: "${data.title}" to ${data.recipientUserIds.length} recipients`);
        return notification;
    }

    async getUserNotifications(userId: string, params: { unreadOnly?: boolean; page?: number; limit?: number }) {
        const { unreadOnly = false, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const where: Record<string, unknown> = { userId };

        if (unreadOnly) where.isRead = false;

        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.userNotification.findMany({
                where,
                skip,
                take: limit,
                include: {
                    notification: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.userNotification.count({ where }),
            this.prisma.userNotification.count({ where: { userId, isRead: false } }),
        ]);

        return {
            data: notifications,
            unreadCount,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async markAsRead(userId: string, notificationId: string) {
        return this.prisma.userNotification.updateMany({
            where: { userId, notificationId },
            data: { isRead: true, readAt: new Date() },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.userNotification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }
}
