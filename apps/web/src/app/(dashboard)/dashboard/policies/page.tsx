'use client';

import { useState } from 'react';

interface Policy {
    id: string;
    name: string;
    category: string;
    status: 'draft' | 'active' | 'archived';
    version: number;
    effectiveDate: string;
    lastUpdated: string;
    description: string;
}

const categoryColors: Record<string, string> = {
    'Leave': '#3B82F6',
    'Attendance': '#10B981',
    'Code of Conduct': '#8B5CF6',
    'Compensation': '#F59E0B',
    'Data Privacy': '#EF4444',
    'Remote Work': '#06B6D4',
};

const mockPolicies: Policy[] = [
    { id: '1', name: 'Annual Leave Policy', category: 'Leave', status: 'active', version: 3, effectiveDate: '2025-01-01', lastUpdated: '2026-01-15', description: 'Defines entitlements, carry-over rules, and approval workflows for annual leave.' },
    { id: '2', name: 'Sick Leave Policy', category: 'Leave', status: 'active', version: 2, effectiveDate: '2025-01-01', lastUpdated: '2025-09-10', description: 'Medical leave provisions, documentation requirements, and return-to-work procedures.' },
    { id: '3', name: 'Remote Work Policy', category: 'Remote Work', status: 'active', version: 4, effectiveDate: '2024-06-01', lastUpdated: '2026-02-01', description: 'Guidelines for hybrid and fully remote work arrangements.' },
    { id: '4', name: 'Code of Conduct', category: 'Code of Conduct', status: 'active', version: 5, effectiveDate: '2024-01-01', lastUpdated: '2025-12-01', description: 'Expected behavior standards, ethics, and professional conduct guidelines.' },
    { id: '5', name: 'Attendance & Punctuality', category: 'Attendance', status: 'active', version: 2, effectiveDate: '2025-03-01', lastUpdated: '2025-08-20', description: 'Working hours, break policies, and late arrival escalation procedures.' },
    { id: '6', name: 'Data Protection & Privacy', category: 'Data Privacy', status: 'active', version: 3, effectiveDate: '2024-05-25', lastUpdated: '2026-01-20', description: 'GDPR compliance, data handling procedures, and breach notification protocols.' },
    { id: '7', name: 'Compensation Review', category: 'Compensation', status: 'draft', version: 1, effectiveDate: '', lastUpdated: '2026-02-22', description: 'Annual compensation review cycle, bonus structures, and equity vesting.' },
    { id: '8', name: 'Parental Leave Policy', category: 'Leave', status: 'draft', version: 1, effectiveDate: '', lastUpdated: '2026-02-20', description: 'Maternity, paternity, and adoption leave entitlements and conditions.' },
];

const statusConfig: Record<string, { label: string; class: string }> = {
    draft: { label: 'Draft', class: 'badge-warning' },
    active: { label: 'Active', class: 'badge-success' },
    archived: { label: 'Archived', class: 'badge-neutral' },
};

export default function PoliciesPage() {
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const categories = [...new Set(mockPolicies.map((p) => p.category))];

    const filtered = mockPolicies.filter((p) => {
        return (!categoryFilter || p.category === categoryFilter) &&
            (!statusFilter || p.status === statusFilter);
    });

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Policies</h1>
                    <p>Manage organizational policies and compliance rules</p>
                </div>
                <button className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Create Policy
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <select className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: 180 }}>
                    <option value="">All Categories</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 160 }}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Policy Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-4)' }}>
                {filtered.map((policy) => (
                    <div key={policy.id} className="card" style={{ cursor: 'pointer' }}>
                        <div className="card-body">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 'var(--radius-full)', background: categoryColors[policy.category] || 'var(--text-tertiary)' }} />
                                    <span className="text-xs text-secondary">{policy.category}</span>
                                </div>
                                <span className={`badge ${statusConfig[policy.status]?.class}`}>
                                    {statusConfig[policy.status]?.label}
                                </span>
                            </div>

                            <h4 style={{ marginBottom: 'var(--space-2)' }}>{policy.name}</h4>
                            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                                {policy.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-secondary)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                <span>v{policy.version}</span>
                                {policy.effectiveDate ? (
                                    <span>Effective: {new Date(policy.effectiveDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                ) : (
                                    <span>Not yet effective</span>
                                )}
                                <span>Updated {new Date(policy.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
