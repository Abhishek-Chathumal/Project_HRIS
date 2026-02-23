'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';
import EmployeeFormModal from '@/components/employee-form-modal';
import styles from './employees.module.css';

const log = createLogger('EmployeesPage');

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  personalEmail?: string;
  workPhone?: string;
  gender?: string;
  dateOfBirth?: string;
  departmentId: string;
  positionId: string;
  employmentStatus: string;
  employmentType: string;
  joiningDate: string;
  avatar?: string;
  department?: { id: string; name: string };
  position?: { id: string; title: string };
  manager?: { firstName: string; lastName: string };
}

interface PaginatedResponse {
  data: Employee[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const statusColors: Record<string, string> = {
  active: 'badge-success',
  probation: 'badge-warning',
  notice_period: 'badge-warning',
  suspended: 'badge-danger',
  terminated: 'badge-danger',
  resigned: 'badge-neutral',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  probation: 'Probation',
  notice_period: 'Notice Period',
  suspended: 'Suspended',
  terminated: 'Terminated',
  resigned: 'Resigned',
  retired: 'Retired',
};

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch employees from API
  const { data: apiData, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['employees', { page, search, status: statusFilter, department: departmentFilter }],
    queryFn: async () => {
      log.info('Fetch', 'Loading employees from API', { page, search, statusFilter });
      const res = await api.get<{ data: PaginatedResponse }>('/employees', {
        page,
        limit: 20,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(departmentFilter && { departmentId: departmentFilter }),
      });
      return res.data;
    },
    retry: 1,
    staleTime: 30 * 1000,
  });

  // Fetch departments for filter dropdown
  const { data: departmentsList = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: { id: string; name: string }[] }>(
          '/employees/departments',
        );
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Deactivate / Activate mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.put(`/employees/${id}`, { employmentStatus: status });
    },
    onSuccess: (_, { status }) => {
      toast.success(
        'Status Updated',
        `Employee ${status === 'active' ? 'activated' : 'deactivated'} successfully.`,
      );
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: Error) => {
      toast.error('Update Failed', err.message);
    },
  });

  const employees = apiData?.data ?? [];
  const totalCount = apiData?.pagination?.total ?? employees.length;
  const totalPages = apiData?.pagination?.totalPages ?? 1;

  // Compute summary stats from current data
  const activeCount = employees.filter((e) => e.employmentStatus === 'active').length;
  const probationCount = employees.filter((e) => e.employmentStatus === 'probation').length;
  const noticeCount = employees.filter((e) => e.employmentStatus === 'notice_period').length;

  // Unique departments from current page data (fallback)
  const departments =
    departmentsList.length > 0
      ? departmentsList
      : [
          ...new Map(
            employees.map((e) => [
              e.department?.name,
              { id: e.departmentId, name: e.department?.name || '' },
            ]),
          ).values(),
        ].filter((d) => d.name);

  const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`.toUpperCase();

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #ec4899, #f43f5e)',
      'linear-gradient(135deg, #10b981, #14b8a6)',
      'linear-gradient(135deg, #f59e0b, #f97316)',
      'linear-gradient(135deg, #3b82f6, #2563eb)',
      'linear-gradient(135deg, #8b5cf6, #a855f7)',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  // ── CSV Export ────────────────────────────
  const handleExport = () => {
    log.info('Export', 'Exporting employee list as CSV');
    const headers = [
      'Employee Number',
      'First Name',
      'Last Name',
      'Department',
      'Position',
      'Type',
      'Status',
      'Joined',
      'Email',
    ];
    const rows = employees.map((emp) => [
      emp.employeeNumber,
      emp.firstName,
      emp.lastName,
      emp.department?.name || '',
      emp.position?.title || '',
      emp.employmentType,
      statusLabels[emp.employmentStatus] || emp.employmentStatus,
      new Date(emp.joiningDate).toLocaleDateString('en-US'),
      emp.personalEmail || '',
    ]);

    const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export Complete', `${employees.length} employees exported as CSV.`);
  };

  // ── Action handlers ──────────────────────
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleToggleStatus = (emp: Employee) => {
    const newStatus = emp.employmentStatus === 'active' ? 'suspended' : 'active';
    toggleStatusMutation.mutate({ id: emp.id, status: newStatus });
    setActiveDropdown(null);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>Manage your organization&apos;s workforce</p>
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

      {/* Filters Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or employee ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input"
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="probation">Probation</option>
            <option value="notice_period">Notice Period</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            className="input"
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.summaryRow}>
        <span className="text-secondary text-sm">
          {isLoading ? (
            'Loading employees...'
          ) : (
            <>
              Showing <strong>{employees.length}</strong> of <strong>{totalCount}</strong> employees
            </>
          )}
        </span>
        <div className={styles.summaryBadges}>
          <span className="badge badge-success">{activeCount} Active</span>
          <span className="badge badge-warning">{probationCount} Probation</span>
          {noticeCount > 0 && <span className="badge badge-danger">{noticeCount} Notice</span>}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          className="card"
          style={{ marginTop: 'var(--space-4)', padding: 'var(--space-8)', textAlign: 'center' }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Loading employees...
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && employees.length === 0 && (
        <div
          className="card"
          style={{ marginTop: 'var(--space-4)', padding: 'var(--space-8)', textAlign: 'center' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>👥</div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No employees found</h3>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
            {search || statusFilter
              ? 'Try adjusting your filters'
              : 'Get started by adding your first employee'}
          </p>
          {!search && !statusFilter && (
            <button className="btn btn-primary" onClick={handleAddEmployee}>
              Add Employee
            </button>
          )}
        </div>
      )}

      {/* Table View */}
      {!isLoading && employees.length > 0 && viewMode === 'table' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--radius-full)',
                            background: getAvatarGradient(emp.firstName),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(emp.firstName, emp.lastName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            <Link
                              href={`/dashboard/employees/${emp.id}`}
                              style={{ color: 'inherit' }}
                            >
                              {emp.firstName} {emp.lastName}
                            </Link>
                          </div>
                          {emp.personalEmail && (
                            <div className="text-xs text-tertiary">{emp.personalEmail}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="font-mono text-sm">{emp.employeeNumber}</code>
                    </td>
                    <td>{emp.department?.name || '—'}</td>
                    <td>{emp.position?.title || '—'}</td>
                    <td>
                      <span className="text-sm" style={{ textTransform: 'capitalize' }}>
                        {emp.employmentType.replace('-', ' ')}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${statusColors[emp.employmentStatus] || 'badge-neutral'}`}
                      >
                        {statusLabels[emp.employmentStatus] || emp.employmentStatus}
                      </span>
                    </td>
                    <td className="text-sm text-secondary">
                      {new Date(emp.joiningDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ position: 'relative' }}>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        aria-label="Actions"
                        onClick={() => setActiveDropdown(activeDropdown === emp.id ? null : emp.id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>

                      {/* Actions Dropdown */}
                      {activeDropdown === emp.id && (
                        <div
                          ref={dropdownRef}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            minWidth: '180px',
                            zIndex: 50,
                            padding: 'var(--space-1)',
                            animation: 'fadeIn 0.15s ease-out',
                          }}
                        >
                          <Link
                            href={`/dashboard/employees/${emp.id}`}
                            className={styles.dropdownItem}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            View Profile
                          </Link>
                          <button
                            className={styles.dropdownItem}
                            onClick={() => handleEditEmployee(emp)}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Details
                          </button>
                          <div
                            style={{
                              borderTop: '1px solid var(--border-secondary)',
                              margin: 'var(--space-1) 0',
                            }}
                          />
                          <button
                            className={styles.dropdownItem}
                            onClick={() => handleToggleStatus(emp)}
                            style={{
                              color:
                                emp.employmentStatus === 'active'
                                  ? 'var(--danger)'
                                  : 'var(--success)',
                            }}
                          >
                            {emp.employmentStatus === 'active' ? (
                              <>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                                Deactivate
                              </>
                            ) : (
                              <>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                  <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Activate
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                padding: 'var(--space-4)',
                borderTop: '1px solid var(--border-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span className="text-sm text-secondary">
                Page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {!isLoading && employees.length > 0 && viewMode === 'grid' && (
        <div className={styles.gridView}>
          {employees.map((emp) => (
            <div key={emp.id} className={styles.employeeCard}>
              <div className={styles.cardTop}>
                <div
                  className={styles.cardAvatar}
                  style={{ background: getAvatarGradient(emp.firstName) }}
                >
                  {getInitials(emp.firstName, emp.lastName)}
                </div>
                <span className={`badge ${statusColors[emp.employmentStatus] || 'badge-neutral'}`}>
                  {statusLabels[emp.employmentStatus]}
                </span>
              </div>
              <h4 className={styles.cardName}>
                <Link
                  href={`/dashboard/employees/${emp.id}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {emp.firstName} {emp.lastName}
                </Link>
              </h4>
              <p className={styles.cardPosition}>{emp.position?.title || '—'}</p>
              <div className={styles.cardMeta}>
                <span>{emp.department?.name}</span>
                <span className="font-mono">{emp.employeeNumber}</span>
              </div>
              <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1, fontSize: '0.75rem' }}
                  onClick={() => handleEditEmployee(emp)}
                >
                  Edit
                </button>
                <Link
                  href={`/dashboard/employees/${emp.id}`}
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1, fontSize: '0.75rem', textAlign: 'center' }}
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee Form Modal */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
      />

      <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </div>
  );
}
