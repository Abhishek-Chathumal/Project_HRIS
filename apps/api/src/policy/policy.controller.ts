import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'policies', version: '1' })
export class PolicyController {
    constructor(private readonly policyService: PolicyService) { }

    @Get()
    @ApiOperation({ summary: 'List policies' })
    async findAll(
        @Query('organizationId') organizationId: string,
        @Query('category') category?: string,
        @Query('status') status?: string,
    ) {
        return this.policyService.findAll({ organizationId, category, status });
    }

    @Post()
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Create a new policy' })
    async create(@Body() data: any) {
        return this.policyService.create(data);
    }

    @Put(':id')
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Update a policy (creates new version)' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: any,
    ) {
        return this.policyService.update(id, data);
    }

    @Post(':id/activate')
    @Roles('admin')
    @ApiOperation({ summary: 'Activate a policy' })
    async activate(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('approvedBy') approvedBy: string,
    ) {
        return this.policyService.activate(id, approvedBy);
    }

    @Get(':id/versions')
    @ApiOperation({ summary: 'Get policy version history' })
    async getVersions(@Param('id', ParseUUIDPipe) id: string) {
        return this.policyService.getVersionHistory(id);
    }

    @Post('evaluate')
    @ApiOperation({ summary: 'Evaluate policy rules against given context' })
    async evaluate(@Body() data: { category: string; organizationId: string; context: Record<string, unknown> }) {
        return this.policyService.evaluateRules(data.category, data.organizationId, data.context);
    }
}
