'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/components/toast';

interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: string;
  totalGross: string | null;
  totalNet: string | null;
  totalDeductions: string | null;
  processedAt: string | null;
  _count: { records: number };
}

interface PayrollRecord {
  id: string;
  basicSalary: string;
  grossSalary: string;
  netSalary: string;
  taxAmount: string;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  status: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department?: { name: string };
    position?: { title: string };
  };
}

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'badge-neutral' },
  processing: { label: 'Processing', class: 'badge-warning' },
  approved: { label: 'Approved', class: 'badge-info' },
  paid: { label: 'Paid', class: 'badge-success' },
  cancelled: { label: 'Cancelled', class: 'badge-danger' },
};

function formatCurrency(val: string | number | null): string {
  if (!val) return '$0.00';
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export default function PayrollPage() {
  const queryClient = useQueryClient();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', payDate: '' });

  // Fetch periods
  const { data: periodsData, isLoading } = useQuery<{ data: PayrollPeriod[] }>({
    queryKey: ['payroll', 'periods'],
    queryFn: () => api.get('/payroll/periods'),
  });
  const periods = periodsData?.data ?? [];

  // Fetch selected period details
  const { data: periodDetail } = useQuery<{ data: PayrollPeriod & { records: PayrollRecord[] } }>({
    queryKey: ['payroll', 'periods', selectedPeriodId],
    queryFn: () => api.get(`/payroll/periods/${selectedPeriodId}`),
    enabled: !!selectedPeriodId,
  });
  const records = periodDetail?.data?.records ?? [];

  // Create period
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post('/payroll/periods', data),
    onSuccess: () => {
      toast.success('Period Created', 'Payroll period has been created.');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      setShowCreate(false);
      setFormData({ name: '', startDate: '', endDate: '', payDate: '' });
    },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  // Process payroll
  const processMutation = useMutation({
    mutationFn: (id: string) => api.post(`/payroll/periods/${id}/process`),
    onSuccess: (data: { data: { recordsGenerated: number; totalNet: number } }) => {
      toast.success(
        'Payroll Processed',
        `${data.data.recordsGenerated} payslips generated. Total net: ${formatCurrency(data.data.totalNet)}`,
      );
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  // Approve
  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/payroll/periods/${id}/approve`),
    onSuccess: () => {
      toast.success('Payroll Approved', 'Payroll has been approved.');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  // Mark as Paid
  const payMutation = useMutation({
    mutationFn: (id: string) => api.post(`/payroll/periods/${id}/pay`),
    onSuccess: () => {
      toast.success('Payroll Paid', 'All payslips marked as paid.');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Payroll</h1>
          <p>Manage payroll periods, process salaries, and view payslips</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Period
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Create Payroll Period</h3>
          <div className="grid grid-cols-4" style={{ gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Period Name</label>
              <input
                className="input"
                placeholder="e.g. February 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">End Date</label>
              <input
                type="date"
                className="input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Pay Date</label>
              <input
                type="date"
                className="input"
                value={formData.payDate}
                onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
              />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-4)',
              justifyContent: 'flex-end',
            }}
          >
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Period'}
            </button>
          </div>
        </div>
      )}

      {/* Periods Table */}
      <div className="card">
        <div className="card-header">
          <h3>Payroll Periods</h3>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Duration</th>
                <th>Pay Date</th>
                <th>Employees</th>
                <th>Gross Total</th>
                <th>Net Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: 'center',
                      padding: 'var(--space-6)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : periods.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: 'center',
                      padding: 'var(--space-6)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    No payroll periods yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                periods.map((period) => (
                  <tr
                    key={period.id}
                    style={{
                      cursor: 'pointer',
                      background:
                        selectedPeriodId === period.id ? 'var(--bg-secondary)' : undefined,
                    }}
                    onClick={() =>
                      setSelectedPeriodId(period.id === selectedPeriodId ? null : period.id)
                    }
                  >
                    <td style={{ fontWeight: 500 }}>{period.name}</td>
                    <td className="text-sm">
                      {new Date(period.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      —{' '}
                      {new Date(period.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="text-sm">
                      {new Date(period.payDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="font-mono">{period._count.records}</td>
                    <td className="font-mono">{formatCurrency(period.totalGross)}</td>
                    <td className="font-mono" style={{ fontWeight: 600 }}>
                      {formatCurrency(period.totalNet)}
                    </td>
                    <td>
                      <span
                        className={`badge ${statusConfig[period.status]?.class || 'badge-neutral'}`}
                      >
                        {statusConfig[period.status]?.label || period.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {period.status === 'draft' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => processMutation.mutate(period.id)}
                            disabled={processMutation.isPending}
                          >
                            Process
                          </button>
                        )}
                        {period.status === 'processing' && (
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--success)', color: '#fff', border: 'none' }}
                            onClick={() => approveMutation.mutate(period.id)}
                            disabled={approveMutation.isPending}
                          >
                            Approve
                          </button>
                        )}
                        {period.status === 'approved' && (
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--info)', color: '#fff', border: 'none' }}
                            onClick={() => payMutation.mutate(period.id)}
                            disabled={payMutation.isPending}
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Period Detail — Payslips */}
      {selectedPeriodId && records.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div className="card-header">
            <h3>Payslips — {periodDetail?.data?.name}</h3>
            <span className="text-sm text-secondary">{records.length} records</span>
          </div>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Basic</th>
                  <th>Allowances</th>
                  <th>Gross</th>
                  <th>Tax</th>
                  <th>Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {r.employee.firstName} {r.employee.lastName}
                      </div>
                      <div className="text-xs text-tertiary">{r.employee.employeeNumber}</div>
                    </td>
                    <td className="text-sm">{r.employee.department?.name || '—'}</td>
                    <td className="font-mono text-sm">{formatCurrency(r.basicSalary)}</td>
                    <td className="font-mono text-sm">
                      {formatCurrency(Number(r.grossSalary) - Number(r.basicSalary))}
                    </td>
                    <td className="font-mono text-sm">{formatCurrency(r.grossSalary)}</td>
                    <td className="font-mono text-sm" style={{ color: 'var(--danger)' }}>
                      {formatCurrency(r.taxAmount)}
                    </td>
                    <td className="font-mono" style={{ fontWeight: 600 }}>
                      {formatCurrency(r.netSalary)}
                    </td>
                    <td>
                      <span className={`badge ${statusConfig[r.status]?.class || 'badge-neutral'}`}>
                        {statusConfig[r.status]?.label || r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
