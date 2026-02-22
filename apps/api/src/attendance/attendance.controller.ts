import {
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../common/prisma/prisma.service';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'attendance', version: '1' })
export class AttendanceController {
    constructor(
        private readonly attendanceService: AttendanceService,
        private readonly prisma: PrismaService,
    ) { }

    @Post('clock-in')
    @ApiOperation({ summary: 'Clock in for the current user' })
    async clockIn(@CurrentUser() user: { id: string }) {
        const employee = await this.prisma.employee.findUnique({
            where: { userId: user.id },
        });
        return this.attendanceService.clockIn(employee!.id, { source: 'web' });
    }

    @Post('clock-out')
    @ApiOperation({ summary: 'Clock out for the current user' })
    async clockOut(@CurrentUser() user: { id: string }) {
        const employee = await this.prisma.employee.findUnique({
            where: { userId: user.id },
        });
        return this.attendanceService.clockOut(employee!.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get attendance records' })
    async getAttendance(
        @Query('employeeId') employeeId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.attendanceService.getAttendance({
            employeeId,
            startDate: startDate ? new Date(startDate) : new Date(new Date().setDate(1)),
            endDate: endDate ? new Date(endDate) : new Date(),
            page,
            limit,
        });
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get monthly attendance summary for an employee' })
    async getSummary(
        @Query('employeeId') employeeId: string,
        @Query('month') month: number,
        @Query('year') year: number,
    ) {
        return this.attendanceService.getAttendanceSummary(
            employeeId,
            month || new Date().getMonth() + 1,
            year || new Date().getFullYear(),
        );
    }
}
