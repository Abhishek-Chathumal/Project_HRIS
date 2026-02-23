'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './employees.module.css';

interface Employee {
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    departmentId: string;
    positionId: string;
    employmentStatus: string;
    employmentType: string;
    joiningDate: string;
    avatar?: string;
    department?: { name: string };
    position?: { title: string };
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

// Mock data for development
const mockEmployees: Employee[] = [
    { id: '1', employeeNumber: 'EMP-001', firstName: 'System', lastName: 'Administrator', employmentStatus: 'active', employmentType: 'full-time', joiningDate: '2024-01-01', departmentId: '1', positionId: '1', department: { name: 'Human Resources' }, position: { title: 'System Admin' } },
    { id: '2', employeeNumber: 'EMP-002', firstName: 'Sarah', lastName: 'Johnson', employmentStatus: 'active', employmentType: 'full-time', joiningDate: '2024-03-15', departmentId: '2', positionId: '2', department: { name: 'Engineering' }, position: { title: 'Senior Developer' }, email: 'sarah.j@hris-demo.com' },
    { id: '3', employeeNumber: 'EMP-003', firstName: 'Michael', lastName: 'Chen', employmentStatus: 'active', employmentType: 'full-time', joiningDate: '2024-06-01', departmentId: '2', positionId: '3', department: { name: 'Engineering' }, position: { title: 'Tech Lead' }, email: 'michael.c@hris-demo.com' },
    { id: '4', employeeNumber: 'EMP-004', firstName: 'Emily', lastName: 'Williams', employmentStatus: 'probation', employmentType: 'full-time', joiningDate: '2025-11-01', departmentId: '3', positionId: '4', department: { name: 'Marketing' }, position: { title: 'Marketing Analyst' }, email: 'emily.w@hris-demo.com' },
    { id: '5', employeeNumber: 'EMP-005', firstName: 'James', lastName: 'Rodriguez', employmentStatus: 'active', employmentType: 'contract', joiningDate: '2025-01-10', departmentId: '4', positionId: '5', department: { name: 'Finance' }, position: { title: 'Financial Analyst' }, email: 'james.r@hris-demo.com' },
    { id: '6', employeeNumber: 'EMP-006', firstName: 'Aiko', lastName: 'Tanaka', employmentStatus: 'active', employmentType: 'full-time', joiningDate: '2024-08-20', departmentId: '5', positionId: '6', department: { name: 'Operations' }, position: { title: 'Operations Manager' }, email: 'aiko.t@hris-demo.com' },
    { id: '7', employeeNumber: 'EMP-007', firstName: 'David', lastName: 'Kim', employmentStatus: 'active', employmentType: 'part-time', joiningDate: '2025-05-01', departmentId: '2', positionId: '7', department: { name: 'Engineering' }, position: { title: 'QA Engineer' }, email: 'david.k@hris-demo.com' },
    { id: '8', employeeNumber: 'EMP-008', firstName: 'Lisa', lastName: 'Patel', employmentStatus: 'notice_period', employmentType: 'full-time', joiningDate: '2023-09-15', departmentId: '6', positionId: '8', department: { name: 'Sales' }, position: { title: 'Sales Executive' }, email: 'lisa.p@hris-demo.com' },
];

export default function EmployeesPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [page, setPage] = useState(1);

    // Use mock data for now — will connect to API when backend is running
    const employees = mockEmployees.filter((emp) => {
        const matchesSearch =
            !search ||
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
            emp.employeeNumber.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || emp.employmentStatus === statusFilter;
        const matchesDept = !departmentFilter || emp.department?.name === departmentFilter;
        return matchesSearch && matchesStatus && matchesDept;
    });

    const departments = [...new Set(mockEmployees.map((e) => e.department?.name).filter(Boolean))];

    const getInitials = (first: string, last: string) =>
        `${first[0]}${last[0]}`.toUpperCase();

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

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Employees</h1>
                    <p>Manage your organization's workforce</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export
                    </button>
                    <button className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className={styles.filtersBar}>
                <div className={styles.searchBox}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or employee ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input"
                    />
                </div>

                <div className={styles.filterGroup}>
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.viewBtn} ${viewMode === 'table' ? styles.active : ''}`}
                            onClick={() => setViewMode('table')}
                            aria-label="Table view"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                        </button>
                        <button
                            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid view"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className={styles.summaryRow}>
                <span className="text-secondary text-sm">
                    Showing <strong>{employees.length}</strong> of <strong>{mockEmployees.length}</strong> employees
                </span>
                <div className={styles.summaryBadges}>
                    <span className="badge badge-success">{mockEmployees.filter((e) => e.employmentStatus === 'active').length} Active</span>
                    <span className="badge badge-warning">{mockEmployees.filter((e) => e.employmentStatus === 'probation').length} Probation</span>
                    <span className="badge badge-danger">{mockEmployees.filter((e) => e.employmentStatus === 'notice_period').length} Notice</span>
                </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
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
                                                        <Link href={`/dashboard/employees/${emp.id}`} style={{ color: 'inherit' }}>
                                                            {emp.firstName} {emp.lastName}
                                                        </Link>
                                                    </div>
                                                    {emp.email && (
                                                        <div className="text-xs text-tertiary">{emp.email}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td><code className="font-mono text-sm">{emp.employeeNumber}</code></td>
                                        <td>{emp.department?.name || '—'}</td>
                                        <td>{emp.position?.title || '—'}</td>
                                        <td>
                                            <span className="text-sm" style={{ textTransform: 'capitalize' }}>
                                                {emp.employmentType.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${statusColors[emp.employmentStatus] || 'badge-neutral'}`}>
                                                {statusLabels[emp.employmentStatus] || emp.employmentStatus}
                                            </span>
                                        </td>
                                        <td className="text-sm text-secondary">
                                            {new Date(emp.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <button className="btn btn-ghost btn-icon btn-sm" aria-label="Actions">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className={styles.gridView}>
                    {employees.map((emp) => (
                        <Link
                            key={emp.id}
                            href={`/dashboard/employees/${emp.id}`}
                            className={styles.employeeCard}
                        >
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
                                {emp.firstName} {emp.lastName}
                            </h4>
                            <p className={styles.cardPosition}>{emp.position?.title}</p>
                            <div className={styles.cardMeta}>
                                <span>{emp.department?.name}</span>
                                <span className="font-mono">{emp.employeeNumber}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
