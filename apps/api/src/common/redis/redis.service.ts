import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private readonly client: Redis;

    constructor(private readonly configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD', undefined),
            retryStrategy: (times: number) => {
                if (times > 5) {
                    this.logger.error('Redis connection failed after 5 retries');
                    return null;
                }
                return Math.min(times * 200, 2000);
            },
            maxRetriesPerRequest: 3,
        });

        this.client.on('connect', () => {
            this.logger.log('Redis connection established');
        });

        this.client.on('error', (err) => {
            this.logger.error(`Redis error: ${err.message}`);
        });
    }

    getClient(): Redis {
        return this.client;
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, value);
        } else {
            await this.client.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async delPattern(pattern: string): Promise<void> {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
            await this.client.del(...keys);
        }
    }

    async isHealthy(): Promise<boolean> {
        try {
            const pong = await this.client.ping();
            return pong === 'PONG';
        } catch {
            return false;
        }
    }

    async onModuleDestroy() {
        await this.client.quit();
        this.logger.log('Redis connection closed');
    }
}
