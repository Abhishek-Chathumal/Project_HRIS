'use client';

export default function DashboardPage() {
    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's an overview of your organization.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export
                    </button>
                    <button className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <div className="stat-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-value">247</div>
                        <div className="stat-label">Total Employees</div>
                        <div className="stat-change" style={{ color: 'var(--success)' }}>↑ 12% from last month</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-value">218</div>
                        <div className="stat-label">Present Today</div>
                        <div className="stat-change" style={{ color: 'var(--success)' }}>88.3% attendance rate</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-value">14</div>
                        <div className="stat-label">Pending Leave Requests</div>
                        <div className="stat-change" style={{ color: 'var(--warning)' }}>5 urgent</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-value">8</div>
                        <div className="stat-label">Open Positions</div>
                        <div className="stat-change" style={{ color: 'var(--info)' }}>32 applicants</div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-3">
                {/* Recent Activity */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <h3>Recent Activity</h3>
                        <button className="btn btn-ghost btn-sm">View all</button>
                    </div>
                    <div className="card-body">
                        <div className="table-wrapper" style={{ border: 'none' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Action</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>JD</div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>John Doe</div>
                                                <div className="text-xs text-tertiary">EMP-042</div>
                                            </div>
                                        </td>
                                        <td>Leave Request — Annual Leave</td>
                                        <td className="text-secondary">Feb 23, 2026</td>
                                        <td><span className="badge badge-warning">Pending</span></td>
                                    </tr>
                                    <tr>
                                        <td style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg,#ec4899,#f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>SM</div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>Sarah Miller</div>
                                                <div className="text-xs text-tertiary">EMP-089</div>
                                            </div>
                                        </td>
                                        <td>Performance Review Submitted</td>
                                        <td className="text-secondary">Feb 22, 2026</td>
                                        <td><span className="badge badge-success">Completed</span></td>
                                    </tr>
                                    <tr>
                                        <td style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg,#10b981,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>AK</div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>Alex Kim</div>
                                                <div className="text-xs text-tertiary">EMP-156</div>
                                            </div>
                                        </td>
                                        <td>New hire onboarding started</td>
                                        <td className="text-secondary">Feb 22, 2026</td>
                                        <td><span className="badge badge-info">In Progress</span></td>
                                    </tr>
                                    <tr>
                                        <td style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>RJ</div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>Rachel Johnson</div>
                                                <div className="text-xs text-tertiary">EMP-023</div>
                                            </div>
                                        </td>
                                        <td>Payroll processed — February</td>
                                        <td className="text-secondary">Feb 21, 2026</td>
                                        <td><span className="badge badge-success">Completed</span></td>
                                    </tr>
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
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            Clock In / Out
                        </button>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>
                            Apply for Leave
                        </button>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            View Payslip
                        </button>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                            Add Employee
                        </button>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.18V21a2 2 0 0 1-4 0v-.09" /></svg>
                            Manage Policies
                        </button>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-secondary)', margin: 'var(--space-2) 0' }} />

                        {/* System Status */}
                        <div style={{ padding: 'var(--space-3)', background: 'var(--success-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: 'var(--success)' }} />
                            <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--success)' }}>System Healthy</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>All services operational</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
