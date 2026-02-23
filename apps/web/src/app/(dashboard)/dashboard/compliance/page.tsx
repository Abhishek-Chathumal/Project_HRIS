'use client';

import { useState } from 'react';
import styles from './compliance.module.css';

interface ComplianceCheck {
    id: string;
    category: 'gdpr' | 'ccpa' | 'soc2' | 'hipaa';
    name: string;
    description: string;
    status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
    lastAudit: string;
    criticality: 'high' | 'medium' | 'low';
}

interface RetentionPolicy {
    resource: string;
    retentionDays: number;
    action: 'delete' | 'anonymize' | 'archive';
    description: string;
    recordCount: number;
    nextEnforcement: string;
}

const complianceChecks: ComplianceCheck[] = [
    { id: '1', category: 'gdpr', name: 'Data Encryption at Rest', description: 'All PII fields encrypted with AES-256-GCM', status: 'compliant', lastAudit: '2026-02-20', criticality: 'high' },
    { id: '2', category: 'gdpr', name: 'Right to Access (Art. 15)', description: 'Users can export all personal data in machine-readable format', status: 'compliant', lastAudit: '2026-02-20', criticality: 'high' },
    { id: '3', category: 'gdpr', name: 'Right to Erasure (Art. 17)', description: 'Personal data anonymization and deletion on request', status: 'compliant', lastAudit: '2026-02-20', criticality: 'high' },
    { id: '4', category: 'gdpr', name: 'Data Portability (Art. 20)', description: 'Structured JSON export of user data', status: 'compliant', lastAudit: '2026-02-20', criticality: 'medium' },
    { id: '5', category: 'gdpr', name: 'Consent Management', description: 'Explicit consent tracking for data processing activities', status: 'partial', lastAudit: '2026-02-18', criticality: 'high' },
    { id: '6', category: 'gdpr', name: 'Data Processing Agreements', description: 'DPA with all third-party processors', status: 'partial', lastAudit: '2026-02-15', criticality: 'medium' },
    { id: '7', category: 'soc2', name: 'Access Control', description: 'RBAC with least-privilege principle enforced', status: 'compliant', lastAudit: '2026-02-20', criticality: 'high' },
    { id: '8', category: 'soc2', name: 'Audit Logging', description: 'All CRUD operations logged with user, IP, and timestamp', status: 'compliant', lastAudit: '2026-02-20', criticality: 'high' },
    { id: '9', category: 'soc2', name: 'Change Management', description: 'Git Flow with PR reviews and conventional commits', status: 'compliant', lastAudit: '2026-02-20', criticality: 'medium' },
    { id: '10', category: 'soc2', name: 'Incident Response Plan', description: 'Documented incident response with escalation procedures', status: 'partial', lastAudit: '2026-02-10', criticality: 'high' },
    { id: '11', category: 'ccpa', name: 'Do Not Sell', description: 'No personal data sold to third parties', status: 'compliant', lastAudit: '2026-02-20', criticality: 'high' },
    { id: '12', category: 'ccpa', name: 'Privacy Notice', description: 'Clear disclosure of data collection practices', status: 'compliant', lastAudit: '2026-02-20', criticality: 'medium' },
];

const retentionPolicies: RetentionPolicy[] = [
    { resource: 'Audit Logs', retentionDays: 2555, action: 'archive', description: '7-year retention for regulatory compliance', recordCount: 12450, nextEnforcement: '2026-03-01' },
    { resource: 'Sessions', retentionDays: 90, action: 'delete', description: 'Expired sessions cleaned after 90 days', recordCount: 340, nextEnforcement: '2026-02-25' },
    { resource: 'Job Applications', retentionDays: 730, action: 'anonymize', description: 'Rejected applicant data anonymized after 2 years', recordCount: 890, nextEnforcement: '2026-03-01' },
    { resource: 'Attendance Records', retentionDays: 1825, action: 'archive', description: 'Archived after 5 years', recordCount: 45200, nextEnforcement: '2026-06-01' },
    { resource: 'Payroll Records', retentionDays: 2555, action: 'archive', description: '7-year retention for tax compliance', recordCount: 8400, nextEnforcement: '2026-06-01' },
    { resource: 'Performance Reviews', retentionDays: 1095, action: 'anonymize', description: 'Anonymized after 3 years', recordCount: 1200, nextEnforcement: '2026-04-01' },
];

const statusConfig: Record<string, { label: string; class: string; color: string }> = {
    compliant: { label: 'Compliant', class: 'badge-success', color: '#10B981' },
    partial: { label: 'Partial', class: 'badge-warning', color: '#F59E0B' },
    'non-compliant': { label: 'Non-Compliant', class: 'badge-danger', color: '#EF4444' },
    'not-applicable': { label: 'N/A', class: 'badge-neutral', color: '#9CA3AF' },
};

const categoryLabels: Record<string, { label: string; icon: string }> = {
    gdpr: { label: 'GDPR', icon: '🇪🇺' },
    ccpa: { label: 'CCPA', icon: '🇺🇸' },
    soc2: { label: 'SOC 2', icon: '🔒' },
    hipaa: { label: 'HIPAA', icon: '🏥' },
};

const actionConfig: Record<string, { label: string; class: string }> = {
    delete: { label: 'Delete', class: 'badge-danger' },
    anonymize: { label: 'Anonymize', class: 'badge-warning' },
    archive: { label: 'Archive', class: 'badge-info' },
};

export default function CompliancePage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'retention' | 'encryption'>('overview');
    const [categoryFilter, setCategoryFilter] = useState('');

    const compliantCount = complianceChecks.filter((c) => c.status === 'compliant').length;
    const partialCount = complianceChecks.filter((c) => c.status === 'partial').length;
    const score = Math.round((compliantCount / complianceChecks.length) * 100);

    const filtered = categoryFilter ? complianceChecks.filter((c) => c.category === categoryFilter) : complianceChecks;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Compliance & Security</h1>
                    <p>GDPR, CCPA, SOC 2 compliance status, data retention, and encryption</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Export Audit Report
                    </button>
                    <button className="btn btn-primary">Run Compliance Scan</button>
                </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
                <div className={styles.scoreCard}>
                    <div className={styles.scoreRing}>
                        <svg width="80" height="80" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="35" fill="none" stroke="var(--border-secondary)" strokeWidth="6" />
                            <circle cx="40" cy="40" r="35" fill="none" stroke={score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)'}
                                strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(score / 100) * 220} 220`} transform="rotate(-90 40 40)" />
                        </svg>
                        <span className={styles.scoreValue}>{score}%</span>
                    </div>
                    <div className="text-xs text-secondary" style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>Compliance Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>✓</div>
                    <div><div className="stat-value">{compliantCount}</div><div className="stat-label">Compliant</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>⚠</div>
                    <div><div className="stat-value">{partialCount}</div><div className="stat-label">Partial</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>🔐</div>
                    <div><div className="stat-value">AES-256</div><div className="stat-label">Encryption</div></div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border-primary)', marginBottom: 'var(--space-4)', gap: 'var(--space-1)' }}>
                {[
                    { key: 'overview', label: '📋 Compliance Checklist' },
                    { key: 'retention', label: '🗄 Data Retention' },
                    { key: 'encryption', label: '🔐 Encryption Status' },
                ].map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        style={{ padding: 'var(--space-3) var(--space-4)', border: 'none', background: 'none', borderBottom: `2px solid ${activeTab === tab.key ? 'var(--accent-primary)' : 'transparent'}`, marginBottom: '-2px', cursor: 'pointer', fontWeight: activeTab === tab.key ? 600 : 400, color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
                <>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        <button className={`btn btn-sm ${!categoryFilter ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategoryFilter('')}>All</button>
                        {Object.entries(categoryLabels).map(([key, cfg]) => (
                            <button key={key} className={`btn btn-sm ${categoryFilter === key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategoryFilter(key)}>
                                {cfg.icon} {cfg.label}
                            </button>
                        ))}
                    </div>
                    <div className="card">
                        <div className="table-wrapper" style={{ border: 'none' }}>
                            <table className="table">
                                <thead>
                                    <tr><th>Check</th><th>Framework</th><th>Description</th><th>Criticality</th><th>Last Audit</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.map((check) => (
                                        <tr key={check.id}>
                                            <td style={{ fontWeight: 500 }}>{check.name}</td>
                                            <td><span className="badge badge-neutral">{categoryLabels[check.category]?.icon} {categoryLabels[check.category]?.label}</span></td>
                                            <td className="text-sm text-secondary">{check.description}</td>
                                            <td><span className={`badge ${check.criticality === 'high' ? 'badge-danger' : check.criticality === 'medium' ? 'badge-warning' : 'badge-info'}`}>{check.criticality}</span></td>
                                            <td className="text-xs text-secondary">{new Date(check.lastAudit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                            <td><span className={`badge ${statusConfig[check.status]?.class}`}>{statusConfig[check.status]?.label}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Retention */}
            {activeTab === 'retention' && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Data Retention Policies</h3>
                        <button className="btn btn-sm btn-primary">Enforce Now</button>
                    </div>
                    <div className="table-wrapper" style={{ border: 'none' }}>
                        <table className="table">
                            <thead>
                                <tr><th>Resource</th><th>Retention</th><th>Action</th><th>Description</th><th>Records</th><th>Next Run</th></tr>
                            </thead>
                            <tbody>
                                {retentionPolicies.map((policy, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 500 }}>{policy.resource}</td>
                                        <td className="font-mono text-sm">{Math.round(policy.retentionDays / 365)} years</td>
                                        <td><span className={`badge ${actionConfig[policy.action]?.class}`}>{actionConfig[policy.action]?.label}</span></td>
                                        <td className="text-sm text-secondary">{policy.description}</td>
                                        <td className="font-mono text-sm">{policy.recordCount.toLocaleString()}</td>
                                        <td className="text-xs text-secondary">{new Date(policy.nextEnforcement).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Encryption */}
            {activeTab === 'encryption' && (
                <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                    <div className="card">
                        <div className="card-header"><h4>Encryption at Rest</h4></div>
                        <div className="card-body">
                            {[
                                { field: 'National ID / SSN', algo: 'AES-256-GCM', status: 'active' },
                                { field: 'Bank Details', algo: 'AES-256-GCM', status: 'active' },
                                { field: 'Personal Email', algo: 'AES-256-DET', status: 'active' },
                                { field: 'Phone Numbers', algo: 'AES-256-GCM', status: 'active' },
                                { field: 'Home Address', algo: 'AES-256-GCM', status: 'active' },
                                { field: 'Emergency Contact', algo: 'AES-256-GCM', status: 'active' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: i < 5 ? '1px solid var(--border-secondary)' : 'none' }}>
                                    <span className="text-sm">{item.field}</span>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <span className="badge badge-neutral font-mono">{item.algo}</span>
                                        <span className="badge badge-success">Active</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header"><h4>Security Configuration</h4></div>
                        <div className="card-body">
                            {[
                                { label: 'TLS/SSL', value: 'Enforced', status: true },
                                { label: 'Password Hashing', value: 'PBKDF2-SHA512', status: true },
                                { label: 'Key Derivation', value: '100,000 iterations', status: true },
                                { label: 'Rate Limiting', value: '100 req/min', status: true },
                                { label: 'CORS Policy', value: 'Strict origin', status: true },
                                { label: 'Helmet Headers', value: 'Enabled', status: true },
                                { label: 'CSRF Protection', value: 'Token-based', status: true },
                                { label: 'Session Timeout', value: '15 min (JWT)', status: true },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: i < 7 ? '1px solid var(--border-secondary)' : 'none' }}>
                                    <span className="text-sm">{item.label}</span>
                                    <span className="text-sm font-mono" style={{ color: item.status ? 'var(--success)' : 'var(--danger)' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
