'use client';

import { useState } from 'react';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';
import styles from './payroll.module.css';

const log = createLogger('PayrollPage');

interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  netPay: number;
  status: 'processed' | 'pending' | 'on-hold';
}

const mockRecords: PayrollRecord[] = [
  {
    id: '1',
    employeeName: 'Sarah Johnson',
    employeeNumber: 'EMP-002',
    department: 'Engineering',
    baseSalary: 8500,
    allowances: 1200,
    deductions: 450,
    tax: 1650,
    netPay: 7600,
    status: 'processed',
  },
  {
    id: '2',
    employeeName: 'Michael Chen',
    employeeNumber: 'EMP-003',
    department: 'Engineering',
    baseSalary: 9200,
    allowances: 1500,
    deductions: 380,
    tax: 1890,
    netPay: 8430,
    status: 'processed',
  },
  {
    id: '3',
    employeeName: 'Emily Williams',
    employeeNumber: 'EMP-004',
    department: 'Marketing',
    baseSalary: 5800,
    allowances: 800,
    deductions: 200,
    tax: 1080,
    netPay: 5320,
    status: 'pending',
  },
  {
    id: '4',
    employeeName: 'James Rodriguez',
    employeeNumber: 'EMP-005',
    department: 'Finance',
    baseSalary: 7200,
    allowances: 1000,
    deductions: 350,
    tax: 1420,
    netPay: 6430,
    status: 'processed',
  },
  {
    id: '5',
    employeeName: 'Aiko Tanaka',
    employeeNumber: 'EMP-006',
    department: 'Operations',
    baseSalary: 8800,
    allowances: 1300,
    deductions: 400,
    tax: 1750,
    netPay: 7950,
    status: 'processed',
  },
  {
    id: '6',
    employeeName: 'David Kim',
    employeeNumber: 'EMP-007',
    department: 'Engineering',
    baseSalary: 4200,
    allowances: 600,
    deductions: 180,
    tax: 780,
    netPay: 3840,
    status: 'pending',
  },
  {
    id: '7',
    employeeName: 'Lisa Patel',
    employeeNumber: 'EMP-008',
    department: 'Sales',
    baseSalary: 6500,
    allowances: 2200,
    deductions: 300,
    tax: 1500,
    netPay: 6900,
    status: 'on-hold',
  },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  processed: { label: 'Processed', class: 'badge-success' },
  pending: { label: 'Pending', class: 'badge-warning' },
  'on-hold': { label: 'On Hold', class: 'badge-danger' },
};

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

export default function PayrollPage() {
  const [period, setPeriod] = useState('2026-02');

  const totalGross = mockRecords.reduce((s, r) => s + r.baseSalary + r.allowances, 0);
  const totalDeductions = mockRecords.reduce((s, r) => s + r.deductions + r.tax, 0);
  const totalNet = mockRecords.reduce((s, r) => s + r.netPay, 0);
  const processedCount = mockRecords.filter((r) => r.status === 'processed').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Payroll</h1>
          <p>Process and manage employee compensation</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input
            type="month"
            className="input"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ width: 180 }}
          />
          <button
            className="btn btn-secondary"
            onClick={() => {
              log.info('ExportPayslips', 'Exporting payslips for period', { period });
              toast.success(
                'Payslip Export',
                `Generating payslips for ${new Date(period + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`,
              );
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Payslips
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              log.info('RunPayroll', 'Running payroll', { period });
              toast.success(
                'Payroll Processing',
                `Payroll run initiated for ${mockRecords.length} employees.`,
              );
            }}
          >
            Run Payroll
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className={styles.payrollStat}>
          <div
            className={styles.statIcon}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-tertiary">Total Gross</div>
            <div className={styles.statAmount}>{fmt(totalGross)}</div>
          </div>
        </div>
        <div className={styles.payrollStat}>
          <div
            className={styles.statIcon}
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-tertiary">Total Deductions</div>
            <div className={styles.statAmount}>{fmt(totalDeductions)}</div>
          </div>
        </div>
        <div className={styles.payrollStat}>
          <div
            className={styles.statIcon}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-tertiary">Total Net Pay</div>
            <div className={styles.statAmount}>{fmt(totalNet)}</div>
          </div>
        </div>
        <div className={styles.payrollStat}>
          <div
            className={styles.statIcon}
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-tertiary">Processed</div>
            <div className={styles.statAmount}>
              {processedCount}/{mockRecords.length}
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="card">
        <div className="card-header">
          <h3>
            Payroll —{' '}
            {new Date(period + '-01').toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th style={{ textAlign: 'right' }}>Base Salary</th>
                <th style={{ textAlign: 'right' }}>Allowances</th>
                <th style={{ textAlign: 'right' }}>Deductions</th>
                <th style={{ textAlign: 'right' }}>Tax</th>
                <th style={{ textAlign: 'right' }}>Net Pay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>{record.employeeName}</div>
                      <div className="text-xs text-tertiary font-mono">{record.employeeNumber}</div>
                    </div>
                  </td>
                  <td className="text-sm">{record.department}</td>
                  <td className="font-mono text-sm" style={{ textAlign: 'right' }}>
                    {fmt(record.baseSalary)}
                  </td>
                  <td
                    className="font-mono text-sm"
                    style={{ textAlign: 'right', color: 'var(--success)' }}
                  >
                    +{fmt(record.allowances)}
                  </td>
                  <td
                    className="font-mono text-sm"
                    style={{ textAlign: 'right', color: 'var(--danger)' }}
                  >
                    -{fmt(record.deductions)}
                  </td>
                  <td
                    className="font-mono text-sm"
                    style={{ textAlign: 'right', color: 'var(--danger)' }}
                  >
                    -{fmt(record.tax)}
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {fmt(record.netPay)}
                  </td>
                  <td>
                    <span className={`badge ${statusConfig[record.status]?.class}`}>
                      {statusConfig[record.status]?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 600, background: 'var(--bg-tertiary)' }}>
                <td colSpan={2}>Totals</td>
                <td className="font-mono" style={{ textAlign: 'right' }}>
                  {fmt(mockRecords.reduce((s, r) => s + r.baseSalary, 0))}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', color: 'var(--success)' }}>
                  +{fmt(mockRecords.reduce((s, r) => s + r.allowances, 0))}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', color: 'var(--danger)' }}>
                  -{fmt(mockRecords.reduce((s, r) => s + r.deductions, 0))}
                </td>
                <td className="font-mono" style={{ textAlign: 'right', color: 'var(--danger)' }}>
                  -{fmt(mockRecords.reduce((s, r) => s + r.tax, 0))}
                </td>
                <td className="font-mono" style={{ textAlign: 'right' }}>
                  {fmt(totalNet)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
