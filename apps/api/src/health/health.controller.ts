import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    @ApiOperation({ summary: 'System health check — all services' })
    async getHealth() {
        return this.healthService.getSystemHealth();
    }

    @Get('ping')
    @ApiOperation({ summary: 'Simple ping/pong check' })
    ping() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
