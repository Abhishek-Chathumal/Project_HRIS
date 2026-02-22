import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Core modules
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';
import { PolicyModule } from './policy/policy.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
    imports: [
        // ── Configuration ───────────────────────
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '../../.env'],
            cache: true,
        }),

        // ── Rate Limiting ───────────────────────
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,   // 1 second
                limit: 10,   // 10 requests
            },
            {
                name: 'medium',
                ttl: 10000,  // 10 seconds
                limit: 50,   // 50 requests
            },
            {
                name: 'long',
                ttl: 60000,  // 1 minute
                limit: 200,  // 200 requests
            },
        ]),

        // ── Core Infrastructure ─────────────────
        PrismaModule,
        RedisModule,

        // ── Feature Modules ─────────────────────
        AuthModule,
        UsersModule,
        EmployeesModule,
        AttendanceModule,
        LeaveModule,
        PolicyModule,
        AuditModule,
        HealthModule,
        NotificationsModule,
    ],
    providers: [
        // Apply rate limiting globally
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
