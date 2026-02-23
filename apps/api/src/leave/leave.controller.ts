import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../common/prisma/prisma.service';

@ApiTags('leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'leave', version: '1' })
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('apply')
  @ApiOperation({ summary: 'Apply for leave' })
  async applyLeave(
    @CurrentUser() user: { id: string },
    @Body()
    data: {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason?: string;
      isHalfDay?: boolean;
      halfDayType?: string;
    },
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId: user.id },
    });
    return this.leaveService.applyLeave({
      employeeId: employee!.id,
      leaveTypeId: data.leaveTypeId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
      isHalfDay: data.isHalfDay,
      halfDayType: data.halfDayType,
    });
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a leave request' })
  async approveLeave(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId: user.id },
    });
    return this.leaveService.approveLeave(id, employee!.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a leave request' })
  async rejectLeave(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body('reason') reason: string,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId: user.id },
    });
    return this.leaveService.rejectLeave(id, employee!.id, reason);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all active leave types' })
  async getLeaveTypes() {
    return this.prisma.leaveType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
        defaultDays: true,
        isPaid: true,
        allowHalfDay: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get current user leave requests' })
  async getMyRequests(@CurrentUser() user: { id: string }, @Query('status') status?: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId: user.id },
    });
    return this.leaveService.getLeaveRequests({
      employeeId: employee!.id,
      status,
    });
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get leave balance for current user' })
  async getBalance(@CurrentUser() user: { id: string }, @Query('year') year?: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId: user.id },
    });
    return this.leaveService.getLeaveBalance(employee!.id, year);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get leave requests' })
  async getRequests(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaveService.getLeaveRequests({ employeeId, status, page, limit });
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get pending leave requests for approval' })
  async getPendingApprovals(@CurrentUser() user: { id: string }) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId: user.id },
    });
    return this.leaveService.getLeaveRequests({
      approverId: employee!.id,
      status: 'pending',
    });
  }
}
