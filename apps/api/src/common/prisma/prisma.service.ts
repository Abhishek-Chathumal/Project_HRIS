import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'warn'>
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'warn' },
            ],
        });
    }

    async onModuleInit() {
        // Log slow queries in development
        this.$on('query', (event) => {
            if (event.duration > 1000) {
                this.logger.warn(
                    `Slow query (${event.duration}ms): ${event.query}`,
                );
            }
        });

        this.$on('error', (event) => {
            this.logger.error(`Prisma error: ${event.message}`);
        });

        this.$on('warn', (event) => {
            this.logger.warn(`Prisma warning: ${event.message}`);
        });

        await this.$connect();
        this.logger.log('Database connection established');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database connection closed');
    }

    /**
     * Health check — returns true if database is reachable
     */
    async isHealthy(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }
}
