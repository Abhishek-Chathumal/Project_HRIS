'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';

const log = createLogger('DashboardPage');

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  attendanceRate: number;
  pendingLeaves: number;
  departments: { name: string; count: number }[];
  recentHires: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
    createdAt: string;
    employmentStatus: string;
    department: { name: string } | null;
    position: { title: string } | null;
  }[];
}

const avatarGradients = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#10b981,#14b8a6)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#3b82f6,#6366f1)',
];

export default function DashboardPage() {
  const router = useRouter();

  const { data: statsData, isLoading } = useQuery<{ data: DashboardStats }>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/employees/dashboard-stats'),
    refetchInterval: 60000,
  });

  const stats = statsData?.data;

  const handleExport = () => {
    log.info('Export', 'Exporting dashboard data');
    toast.success('Export Started', 'Dashboard summary is being generated as CSV.');
  };

  const handleAddEmployee = () => {
    log.info('AddEmployee', 'Navigating to add employee');
    router.push('/dashboard/employees');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here&apos;s an overview of your organization.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button className="btn btn-primary" onClick={handleAddEmployee}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{isLoading ? '—' : (stats?.totalEmployees ?? 0)}</div>
            <div className="stat-label">Total Employees</div>
            <div className="stat-change" style={{ color: 'var(--success)' }}>
              {stats?.activeEmployees ?? 0} active
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--success-light)', color: 'var(--success)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{isLoading ? '—' : (stats?.presentToday ?? 0)}</div>
            <div className="stat-label">Present Today</div>
            <div className="stat-change" style={{ color: 'var(--success)' }}>
              {stats?.attendanceRate ?? 0}% attendance rate
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{isLoading ? '—' : (stats?.pendingLeaves ?? 0)}</div>
            <div className="stat-label">Pending Leave Requests</div>
            <div className="stat-change" style={{ color: 'var(--warning)' }}>
              Awaiting approval
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--info-light)', color: 'var(--info)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{isLoading ? '—' : (stats?.departments?.length ?? 0)}</div>
            <div className="stat-label">Departments</div>
            <div className="stat-change" style={{ color: 'var(--info)' }}>
              Active teams
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3">
        {/* Recent Hires */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Recent Hires (Last 30 Days)</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push('/dashboard/employees')}
            >
              View all
            </button>
          </div>
          <div className="card-body">
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: 'center',
                          padding: 'var(--space-6)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : !stats?.recentHires?.length ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: 'center',
                          padding: 'var(--space-6)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        No recent hires in the last 30 days.
                      </td>
                    </tr>
                  ) : (
                    stats.recentHires.map((emp, i) => {
                      const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
                      return (
                        <tr key={emp.employeeNumber}>
                          <td
                            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 'var(--radius-full)',
                                background: avatarGradients[i % avatarGradients.length],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500 }}>
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="text-xs text-tertiary">{emp.employeeNumber}</div>
                            </div>
                          </td>
                          <td className="text-sm">{emp.department?.name || '—'}</td>
                          <td className="text-sm">{emp.position?.title || '—'}</td>
                          <td className="text-secondary text-sm">
                            {new Date(emp.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td>
                            <span
                              className={`badge ${emp.employmentStatus === 'active' ? 'badge-success' : 'badge-warning'}`}
                            >
                              {emp.employmentStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div
            className="card-body"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          >
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => router.push('/dashboard/attendance')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Clock In / Out
            </button>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => router.push('/dashboard/leave')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
              Apply for Leave
            </button>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => router.push('/dashboard/payroll')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              View Payslip
            </button>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={handleAddEmployee}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Add Employee
            </button>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => router.push('/dashboard/policies')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.18V21a2 2 0 0 1-4 0v-.09" />
              </svg>
              Manage Policies
            </button>

            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--border-secondary)',
                margin: 'var(--space-2) 0',
              }}
            />

            {/* Department Breakdown */}
            {stats?.departments && stats.departments.length > 0 && (
              <div
                style={{
                  padding: 'var(--space-3)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  By Department
                </div>
                {stats.departments.map((dept) => (
                  <div
                    key={dept.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8125rem',
                      padding: '2px 0',
                    }}
                  >
                    <span>{dept.name}</span>
                    <strong>{dept.count}</strong>
                  </div>
                ))}
              </div>
            )}

            {/* System Status */}
            <div
              style={{
                padding: 'var(--space-3)',
                background: 'var(--success-light)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--success)',
                }}
              />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--success)' }}>
                  System Healthy
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  All services operational
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
