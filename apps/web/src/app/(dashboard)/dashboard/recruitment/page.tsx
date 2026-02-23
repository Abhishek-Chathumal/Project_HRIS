'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/components/toast';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  employmentType: string;
  experienceLevel: string | null;
  salaryMin: string | null;
  salaryMax: string | null;
  location: string | null;
  isRemote: boolean;
  status: string;
  openings: number;
  publishedAt: string | null;
  closingDate: string | null;
  createdAt: string;
  position?: { title: string; department?: { name: string } };
  _count: { applications: number };
}

interface RecruitmentSummary {
  openJobs: number;
  totalApplicants: number;
  interviewsScheduled: number;
  hiredThisMonth: number;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'badge-neutral' },
  open: { label: 'Open', class: 'badge-success' },
  closed: { label: 'Closed', class: 'badge-danger' },
  on_hold: { label: 'On Hold', class: 'badge-warning' },
};

export default function RecruitmentPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', employmentType: 'full-time', location: '', openings: 1 });

  const { data: summaryData } = useQuery<{ data: RecruitmentSummary }>({
    queryKey: ['recruitment', 'summary'],
    queryFn: () => api.get('/recruitment/summary'),
  });
  const summary = summaryData?.data ?? { openJobs: 0, totalApplicants: 0, interviewsScheduled: 0, hiredThisMonth: 0 };

  const { data: jobsData, isLoading } = useQuery<{ data: { data: JobPosting[] } }>({
    queryKey: ['recruitment', 'jobs'],
    queryFn: () => api.get('/recruitment/jobs'),
  });
  const jobs = jobsData?.data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/recruitment/jobs', data),
    onSuccess: () => { toast.success('Job Posted', 'New job posting created.'); queryClient.invalidateQueries({ queryKey: ['recruitment'] }); setShowCreate(false); setForm({ title: '', description: '', employmentType: 'full-time', location: '', openings: 1 }); },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.post(`/recruitment/jobs/${id}/status`, { status }),
    onSuccess: () => { toast.success('Status Updated', 'Job posting status changed.'); queryClient.invalidateQueries({ queryKey: ['recruitment'] }); },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Recruitment</h1>
          <p>Manage job postings and track applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Post Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.openJobs}</div>
            <div className="stat-label">Open Positions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.totalApplicants}</div>
            <div className="stat-label">Total Applicants</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.interviewsScheduled}</div>
            <div className="stat-label">Interviews Scheduled</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.hiredThisMonth}</div>
            <div className="stat-label">Hired This Month</div>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Create Job Posting</h3>
          <div className="grid grid-cols-3" style={{ gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Job Title</label>
              <input className="input" placeholder="e.g. Senior Developer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Employment Type</label>
              <select className="input" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Location</label>
              <input className="input" placeholder="e.g. Colombo, Sri Lanka" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label className="label">Description</label>
            <textarea className="input" rows={4} placeholder="Job description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="card">
        <div className="card-header"><h3>Job Postings</h3></div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Department</th>
                <th>Type</th>
                <th>Location</th>
                <th>Openings</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>Loading...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>No job postings. Create one to start recruiting.</td></tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 500 }}>{job.title}</td>
                    <td className="text-sm">{job.position?.department?.name || '—'}</td>
                    <td className="text-sm" style={{ textTransform: 'capitalize' }}>{job.employmentType.replace('-', ' ')}</td>
                    <td className="text-sm">{job.location || (job.isRemote ? 'Remote' : '—')}</td>
                    <td className="font-mono">{job.openings}</td>
                    <td className="font-mono">{job._count.applications}</td>
                    <td><span className={`badge ${statusConfig[job.status]?.class || 'badge-neutral'}`}>{statusConfig[job.status]?.label || job.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {job.status === 'draft' && (
                          <button className="btn btn-sm btn-primary" onClick={() => statusMutation.mutate({ id: job.id, status: 'open' })}>Publish</button>
                        )}
                        {job.status === 'open' && (
                          <button className="btn btn-sm btn-secondary" onClick={() => statusMutation.mutate({ id: job.id, status: 'closed' })}>Close</button>
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
    </div>
  );
}
