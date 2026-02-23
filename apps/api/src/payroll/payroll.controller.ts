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
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../common/prisma/prisma.service';

@ApiTags('payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'payroll', version: '1' })
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('periods')
  @ApiOperation({ summary: 'Get all payroll periods' })
  async getPeriods() {
    const org = await this.prisma.organization.findFirst();
    return this.payrollService.getPayrollPeriods(org!.id);
  }

  @Get('periods/:id')
  @ApiOperation({ summary: 'Get payroll period with records' })
  async getPeriod(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.getPayrollPeriod(id);
  }

  @Post('periods')
  @ApiOperation({ summary: 'Create a payroll period' })
  async createPeriod(
    @Body() data: { name: string; startDate: string; endDate: string; payDate: string },
  ) {
    const org = await this.prisma.organization.findFirst();
    return this.payrollService.createPayrollPeriod({
      organizationId: org!.id,
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      payDate: new Date(data.payDate),
    });
  }

  @Post('periods/:id/process')
  @ApiOperation({ summary: 'Process payroll — generate records for all employees' })
  async processPayroll(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.payrollService.processPayroll(id, user.id);
  }

  @Post('periods/:id/approve')
  @ApiOperation({ summary: 'Approve processed payroll' })
  async approvePayroll(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.approvePayroll(id);
  }

  @Post('periods/:id/pay')
  @ApiOperation({ summary: 'Mark payroll as paid' })
  async markAsPaid(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.markAsPaid(id);
  }

  @Get('my-payslips')
  @ApiOperation({ summary: 'Get current user payslips' })
  async getMyPayslips(@CurrentUser() user: { id: string }) {
    const employee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
    if (!employee) return [];
    return this.payrollService.getMyPayslips(employee.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get payroll summary stats' })
  async getSummary() {
    const org = await this.prisma.organization.findFirst();
    return this.payrollService.getPayrollSummary(org!.id);
  }
}
