'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/components/toast';

interface PolicyItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  content: string;
  version: number;
  status: string;
  effectiveDate: string | null;
  requiresAcknowledgment: boolean;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'badge-neutral' },
  active: { label: 'Active', class: 'badge-success' },
  archived: { label: 'Archived', class: 'badge-warning' },
};

const categories = ['attendance', 'leave', 'payroll', 'conduct', 'safety', 'it', 'hr'];

export default function PoliciesPage() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'hr', description: '', content: '', requiresAcknowledgment: false });

  const { data: policiesData, isLoading } = useQuery<{ data: { data: PolicyItem[] } }>({
    queryKey: ['policies', categoryFilter, statusFilter],
    queryFn: () => api.get('/policies', { organizationId: 'default', category: categoryFilter || undefined, status: statusFilter || undefined }),
  });
  const policies = policiesData?.data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: typeof form & { organizationId: string; createdBy: string }) => api.post('/policies', data),
    onSuccess: () => { toast.success('Policy Created', 'New policy has been drafted.'); queryClient.invalidateQueries({ queryKey: ['policies'] }); setShowCreate(false); setForm({ name: '', category: 'hr', description: '', content: '', requiresAcknowledgment: false }); },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/policies/${id}/activate`, { approvedBy: 'admin' }),
    onSuccess: () => { toast.success('Policy Activated', 'Policy is now active.'); queryClient.invalidateQueries({ queryKey: ['policies'] }); },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Policies</h1>
          <p>Manage organizational policies and compliance documents</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Policy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div>
            <div className="stat-value">{policies.filter(p => p.status === 'active').length}</div>
            <div className="stat-label">Active Policies</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </div>
          <div>
            <div className="stat-value">{policies.filter(p => p.status === 'draft').length}</div>
            <div className="stat-label">Draft Policies</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </div>
          <div>
            <div className="stat-value">{policies.length}</div>
            <div className="stat-label">Total Policies</div>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Create Policy</h3>
          <div className="grid grid-cols-3" style={{ gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Policy Name</label>
              <input className="input" placeholder="e.g. Remote Work Policy" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Description</label>
              <input className="input" placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label className="label">Policy Content</label>
            <textarea className="input" rows={6} placeholder="Policy content..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ resize: 'vertical', fontFamily: 'var(--font-mono)' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => createMutation.mutate({ ...form, organizationId: 'default', createdBy: 'admin' })} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Policy'}
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card">
        <div className="card-header">
          <h3>All Policies</h3>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <select className="input" style={{ width: 160 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <select className="input" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Policy Name</th>
                <th>Category</th>
                <th>Version</th>
                <th>Status</th>
                <th>Effective Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>Loading...</td></tr>
              ) : policies.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>No policies found.</td></tr>
              ) : (
                policies.map(policy => (
                  <>
                    <tr key={policy.id} style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === policy.id ? null : policy.id)}>
                      <td style={{ fontWeight: 500 }}>
                        <div>{policy.name}</div>
                        {policy.description && <div className="text-xs text-tertiary">{policy.description}</div>}
                      </td>
                      <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{policy.category}</span></td>
                      <td className="font-mono">v{policy.version}</td>
                      <td><span className={`badge ${statusConfig[policy.status]?.class || 'badge-neutral'}`}>{statusConfig[policy.status]?.label || policy.status}</span></td>
                      <td className="text-sm">{policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {policy.status === 'draft' && (
                          <button className="btn btn-sm btn-primary" onClick={() => activateMutation.mutate(policy.id)}>Activate</button>
                        )}
                      </td>
                    </tr>
                    {expandedId === policy.id && (
                      <tr key={`${policy.id}-content`}>
                        <td colSpan={6} style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                          {policy.content}
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
