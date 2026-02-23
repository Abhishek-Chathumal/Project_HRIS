'use client';

import { useState } from 'react';
import styles from './leave.module.css';

interface LeaveBalance {
    type: string;
    code: string;
    color: string;
    total: number;
    used: number;
    pending: number;
    available: number;
}

interface LeaveRequest {
    id: string;
    employeeName: string;
    employeeNumber: string;
    type: string;
    typeColor: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedOn: string;
}

const mockBalances: LeaveBalance[] = [
    { type: 'Annual Leave', code: 'AL', color: '#3B82F6', total: 20, used: 5, pending: 2, available: 13 },
    { type: 'Sick Leave', code: 'SL', color: '#EF4444', total: 10, used: 2, pending: 0, available: 8 },
    { type: 'Casual Leave', code: 'CL', color: '#F59E0B', total: 5, used: 1, pending: 0, available: 4 },
    { type: 'Compensatory Off', code: 'CO', color: '#10B981', total: 3, used: 1, pending: 0, available: 2 },
];

const mockRequests: LeaveRequest[] = [
    { id: '1', employeeName: 'Sarah Johnson', employeeNumber: 'EMP-002', type: 'Annual Leave', typeColor: '#3B82F6', startDate: '2026-03-10', endDate: '2026-03-14', days: 5, reason: 'Family vacation', status: 'pending', appliedOn: '2026-02-22' },
    { id: '2', employeeName: 'Michael Chen', employeeNumber: 'EMP-003', type: 'Sick Leave', typeColor: '#EF4444', startDate: '2026-02-24', endDate: '2026-02-24', days: 1, reason: 'Medical appointment', status: 'pending', appliedOn: '2026-02-23' },
    { id: '3', employeeName: 'Emily Williams', employeeNumber: 'EMP-004', type: 'Casual Leave', typeColor: '#F59E0B', startDate: '2026-02-28', endDate: '2026-02-28', days: 1, reason: 'Personal work', status: 'pending', appliedOn: '2026-02-22' },
    { id: '4', employeeName: 'David Kim', employeeNumber: 'EMP-007', type: 'Annual Leave', typeColor: '#3B82F6', startDate: '2026-02-15', endDate: '2026-02-19', days: 5, reason: 'Winter holiday', status: 'approved', appliedOn: '2026-02-05' },
    { id: '5', employeeName: 'Aiko Tanaka', employeeNumber: 'EMP-006', type: 'Sick Leave', typeColor: '#EF4444', startDate: '2026-02-10', endDate: '2026-02-11', days: 2, reason: 'Flu recovery', status: 'approved', appliedOn: '2026-02-10' },
    { id: '6', employeeName: 'Lisa Patel', employeeNumber: 'EMP-008', type: 'Annual Leave', typeColor: '#3B82F6', startDate: '2026-01-20', endDate: '2026-01-22', days: 3, reason: 'Travel plans', status: 'rejected', appliedOn: '2026-01-10' },
];

const statusConfig: Record<string, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'badge-warning' },
    approved: { label: 'Approved', class: 'badge-success' },
    rejected: { label: 'Rejected', class: 'badge-danger' },
};

export default function LeavePage() {
    const [activeTab, setActiveTab] = useState<'my-balance' | 'requests' | 'approvals'>('my-balance');
    const [showApplyForm, setShowApplyForm] = useState(false);

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Leave Management</h1>
                    <p>View balances, apply for leave, and manage requests</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowApplyForm(!showApplyForm)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Apply for Leave
                </button>
            </div>

            {/* Apply Form */}
            {showApplyForm && (
                <div className={styles.applyCard}>
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>New Leave Request</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formField}>
                            <label className="label">Leave Type</label>
                            <select className="input">
                                <option value="">Select leave type</option>
                                {mockBalances.map((b) => (
                                    <option key={b.code} value={b.code}>{b.type} ({b.available} days available)</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formField}>
                            <label className="label">Start Date</label>
                            <input type="date" className="input" />
                        </div>
                        <div className={styles.formField}>
                            <label className="label">End Date</label>
                            <input type="date" className="input" />
                        </div>
                        <div className={styles.formField}>
                            <label className="label">Half Day</label>
                            <select className="input">
                                <option value="">No</option>
                                <option value="first">First Half</option>
                                <option value="second">Second Half</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.formField} style={{ marginTop: 'var(--space-4)' }}>
                        <label className="label">Reason</label>
                        <textarea className="input" rows={3} placeholder="Briefly describe the reason for leave..." />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={() => setShowApplyForm(false)}>Cancel</button>
                        <button className="btn btn-primary">Submit Request</button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'my-balance' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('my-balance')}
                >
                    My Balance
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Leave Requests
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'approvals' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('approvals')}
                >
                    Pending Approvals
                    <span className={styles.tabBadge}>3</span>
                </button>
            </div>

            {/* My Balance Tab */}
            {activeTab === 'my-balance' && (
                <div className={styles.balanceGrid}>
                    {mockBalances.map((balance) => (
                        <div key={balance.code} className={styles.balanceCard}>
                            <div className={styles.balanceHeader}>
                                <div className={styles.balanceDot} style={{ background: balance.color }} />
                                <span className={styles.balanceType}>{balance.type}</span>
                                <span className={styles.balanceCode}>{balance.code}</span>
                            </div>
                            <div className={styles.balanceStats}>
                                <div className={styles.balanceMain}>
                                    <span className={styles.balanceValue}>{balance.available}</span>
                                    <span className={styles.balanceLabel}>Available</span>
                                </div>
                                <div className={styles.balanceBreakdown}>
                                    <div><span className="text-tertiary">Total:</span> <strong>{balance.total}</strong></div>
                                    <div><span className="text-tertiary">Used:</span> <strong>{balance.used}</strong></div>
                                    <div><span className="text-tertiary">Pending:</span> <strong>{balance.pending}</strong></div>
                                </div>
                            </div>
                            <div className={styles.balanceBar}>
                                <div
                                    className={styles.balanceBarFill}
                                    style={{
                                        width: `${(balance.used / balance.total) * 100}%`,
                                        background: balance.color,
                                    }}
                                />
                                <div
                                    className={styles.balanceBarPending}
                                    style={{
                                        width: `${(balance.pending / balance.total) * 100}%`,
                                        background: balance.color,
                                        opacity: 0.3,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Leave Requests Tab */}
            {(activeTab === 'requests' || activeTab === 'approvals') && (
                <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                    <div className="table-wrapper" style={{ border: 'none' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Leave Type</th>
                                    <th>Duration</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    {activeTab === 'approvals' && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {mockRequests
                                    .filter((r) => (activeTab === 'approvals' ? r.status === 'pending' : true))
                                    .map((request) => (
                                        <tr key={request.id}>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{request.employeeName}</div>
                                                    <div className="text-xs text-tertiary">{request.employeeNumber}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: request.typeColor }} />
                                                    {request.type}
                                                </div>
                                            </td>
                                            <td className="text-sm">
                                                {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                {request.startDate !== request.endDate && (
                                                    <> — {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                                                )}
                                            </td>
                                            <td className="font-mono">{request.days}</td>
                                            <td className="text-sm text-secondary" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {request.reason}
                                            </td>
                                            <td>
                                                <span className={`badge ${statusConfig[request.status]?.class}`}>
                                                    {statusConfig[request.status]?.label}
                                                </span>
                                            </td>
                                            {activeTab === 'approvals' && (
                                                <td>
                                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                        <button className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff', border: 'none' }}>
                                                            Approve
                                                        </button>
                                                        <button className="btn btn-sm btn-danger">
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
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
