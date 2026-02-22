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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'employees', version: '1' })
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    @ApiOperation({ summary: 'List all employees with pagination and filters' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'departmentId', required: false })
    @ApiQuery({ name: 'status', required: false })
    async findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('departmentId') departmentId?: string,
        @Query('status') status?: string,
    ) {
        return this.employeesService.findAll({ page, limit, search, departmentId, status });
    }

    @Get('org-chart')
    @ApiOperation({ summary: 'Get organization chart hierarchy' })
    async getOrgChart(@Query('departmentId') departmentId?: string) {
        return this.employeesService.getOrgChart(departmentId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get employee by ID' })
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.employeesService.findById(id);
    }

    @Post()
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Create a new employee' })
    async create(@Body() data: Record<string, unknown>) {
        return this.employeesService.create(data as any);
    }

    @Put(':id')
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Update an employee' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: Record<string, unknown>,
    ) {
        return this.employeesService.update(id, data);
    }
}
