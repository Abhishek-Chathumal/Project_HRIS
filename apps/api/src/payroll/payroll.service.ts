import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPayrollPeriod(data: {
    organizationId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    payDate: Date;
  }) {
    const period = await this.prisma.payrollPeriod.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        payDate: data.payDate,
        status: 'draft',
      },
    });
    this.logger.log(`Payroll period created: ${period.id} — ${data.name}`);
    return period;
  }

  async getPayrollPeriods(organizationId: string) {
    return this.prisma.payrollPeriod.findMany({
      where: { organizationId },
      include: {
        _count: { select: { records: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async getPayrollPeriod(id: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id },
      include: {
        records: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeNumber: true,
                department: { select: { name: true } },
                position: { select: { title: true } },
              },
            },
          },
          orderBy: { employee: { lastName: 'asc' } },
        },
      },
    });
    if (!period) throw new NotFoundException('Payroll period not found');
    return period;
  }

  async processPayroll(periodId: string, processedBy: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });
    if (!period) throw new NotFoundException('Payroll period not found');
    if (period.status !== 'draft') {
      throw new BadRequestException('Payroll period is not in draft status');
    }

    // Get all active employees with their salary info
    const employees = await this.prisma.employee.findMany({
      where: {
        employmentStatus: { in: ['active', 'probation'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeNumber: true,
        currentSalary: true,
        employmentType: true,
      },
    });

    // Generate payroll records
    const records = [];
    for (const emp of employees) {
      const basic = Number(emp.currentSalary || 0);
      const allowances = {
        housing: Math.round(basic * 0.15),
        transport: Math.round(basic * 0.05),
        meal: Math.round(basic * 0.03),
      };
      const totalAllowances = Object.values(allowances).reduce((s, v) => s + v, 0);
      const gross = basic + totalAllowances;
      const deductions = {
        epf: Math.round(basic * 0.08),
        etf: Math.round(basic * 0.03),
        paye: Math.round(gross * 0.06),
      };
      const totalDeductions = Object.values(deductions).reduce((s, v) => s + v, 0);
      const net = gross - totalDeductions;

      records.push({
        payrollPeriodId: periodId,
        employeeId: emp.id,
        basicSalary: basic,
        allowances,
        deductions,
        grossSalary: gross,
        taxAmount: deductions.paye,
        netSalary: net,
        status: 'draft',
      });
    }

    // Bulk create records
    await this.prisma.payrollRecord.createMany({ data: records });

    // Compute totals
    const totalGross = records.reduce((s, r) => s + r.grossSalary, 0);
    const totalNet = records.reduce((s, r) => s + r.netSalary, 0);
    const totalDeductions = records.reduce((s, r) => s + (r.grossSalary - r.netSalary), 0);

    // Update period
    await this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: 'processing',
        processedAt: new Date(),
        processedBy,
        totalGross,
        totalNet,
        totalDeductions,
      },
    });

    this.logger.log(`Payroll processed: ${periodId} — ${records.length} records`);
    return { recordsGenerated: records.length, totalGross, totalNet, totalDeductions };
  }

  async approvePayroll(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new NotFoundException('Payroll period not found');
    if (period.status !== 'processing') {
      throw new BadRequestException('Payroll must be in processing status to approve');
    }
    return this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { status: 'approved' },
    });
  }

  async markAsPaid(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new NotFoundException('Payroll period not found');
    if (period.status !== 'approved') {
      throw new BadRequestException('Payroll must be approved before marking as paid');
    }
    await this.prisma.payrollRecord.updateMany({
      where: { payrollPeriodId: periodId },
      data: { status: 'paid' },
    });
    return this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { status: 'paid' },
    });
  }

  async getMyPayslips(employeeId: string) {
    return this.prisma.payrollRecord.findMany({
      where: { employeeId, status: { in: ['approved', 'paid'] } },
      include: {
        payrollPeriod: {
          select: { name: true, startDate: true, endDate: true, payDate: true, status: true },
        },
      },
      orderBy: { payrollPeriod: { startDate: 'desc' } },
    });
  }

  async getPayrollSummary(organizationId: string) {
    const latestPeriod = await this.prisma.payrollPeriod.findFirst({
      where: { organizationId, status: { in: ['approved', 'paid'] } },
      orderBy: { startDate: 'desc' },
    });

    const totalPeriods = await this.prisma.payrollPeriod.count({ where: { organizationId } });
    const totalPaid = await this.prisma.payrollPeriod.count({
      where: { organizationId, status: 'paid' },
    });
    const pendingPeriods = await this.prisma.payrollPeriod.count({
      where: { organizationId, status: { in: ['draft', 'processing'] } },
    });

    return {
      latestPeriod,
      totalPeriods,
      totalPaid,
      pendingPeriods,
    };
  }
}
