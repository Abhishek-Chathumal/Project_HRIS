import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';

export interface ServiceHealth {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    details?: Record<string, unknown>;
}

export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    services: ServiceHealth[];
    memory: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
}

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);
    private readonly startTime = Date.now();

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    async getSystemHealth(): Promise<SystemHealth> {
        const services = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
        ]);

        const overallStatus = services.every((s) => s.status === 'healthy')
            ? 'healthy'
            : services.some((s) => s.status === 'unhealthy')
                ? 'unhealthy'
                : 'degraded';

        const memUsage = process.memoryUsage();

        const health: SystemHealth = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            version: process.env.npm_package_version || '0.1.0',
            services,
            memory: {
                rss: Math.round(memUsage.rss / 1024 / 1024),
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                external: Math.round(memUsage.external / 1024 / 1024),
            },
        };

        // Log health to database for diagnostics
        try {
            await this.prisma.systemHealthLog.create({
                data: {
                    service: 'api',
                    status: overallStatus,
                    responseTime: services.reduce((sum, s) => sum + s.responseTime, 0),
                    details: health as any,
                },
            });
        } catch (e) {
            this.logger.warn('Failed to log health check to database');
        }

        return health;
    }

    private async checkDatabase(): Promise<ServiceHealth> {
        const start = Date.now();
        try {
            const isHealthy = await this.prisma.isHealthy();
            return {
                service: 'postgresql',
                status: isHealthy ? 'healthy' : 'unhealthy',
                responseTime: Date.now() - start,
            };
        } catch (error) {
            return {
                service: 'postgresql',
                status: 'unhealthy',
                responseTime: Date.now() - start,
                details: { error: (error as Error).message },
            };
        }
    }

    private async checkRedis(): Promise<ServiceHealth> {
        const start = Date.now();
        try {
            const isHealthy = await this.redis.isHealthy();
            return {
                service: 'redis',
                status: isHealthy ? 'healthy' : 'unhealthy',
                responseTime: Date.now() - start,
            };
        } catch (error) {
            return {
                service: 'redis',
                status: 'unhealthy',
                responseTime: Date.now() - start,
                details: { error: (error as Error).message },
            };
        }
    }
}
