'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/components/toast';

interface TrainingCourse {
  id: string;
  title: string;
  description: string | null;
  category: string;
  provider: string | null;
  format: string;
  duration: number | null;
  maxParticipants: number | null;
  cost: string | null;
  isMandatory: boolean;
  skills: string[];
  _count: { enrollments: number };
}

interface TrainingSummary {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  avgProgress: number;
}

const formatConfig: Record<string, { label: string; icon: string }> = {
  online: { label: 'Online', icon: '🌐' },
  classroom: { label: 'Classroom', icon: '🏫' },
  blended: { label: 'Blended', icon: '📚' },
  'self-paced': { label: 'Self-Paced', icon: '⏱️' },
};

export default function TrainingPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Technical', format: 'online', provider: '', duration: 0, isMandatory: false });

  const { data: summaryData } = useQuery<{ data: TrainingSummary }>({
    queryKey: ['training', 'summary'],
    queryFn: () => api.get('/training/summary'),
  });
  const summary = summaryData?.data ?? { totalCourses: 0, activeCourses: 0, totalEnrollments: 0, completedEnrollments: 0, completionRate: 0, avgProgress: 0 };

  const { data: coursesData, isLoading } = useQuery<{ data: { data: TrainingCourse[] } }>({
    queryKey: ['training', 'courses'],
    queryFn: () => api.get('/training/courses'),
  });
  const courses = coursesData?.data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/training/courses', data),
    onSuccess: () => { toast.success('Course Created', 'New training course added.'); queryClient.invalidateQueries({ queryKey: ['training'] }); setShowCreate(false); },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Training</h1>
          <p>Manage training courses and employee development</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.activeCourses}</div>
            <div className="stat-label">Active Courses</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.totalEnrollments}</div>
            <div className="stat-label">Total Enrollments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.avgProgress}%</div>
            <div className="stat-label">Avg Progress</div>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Create Training Course</h3>
          <div className="grid grid-cols-3" style={{ gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Course Title</label>
              <input className="input" placeholder="e.g. React Advanced Patterns" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Technical">Technical</option>
                <option value="Leadership">Leadership</option>
                <option value="Compliance">Compliance</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Safety">Safety</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label">Format</label>
              <select className="input" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                <option value="online">Online</option>
                <option value="classroom">Classroom</option>
                <option value="blended">Blended</option>
                <option value="self-paced">Self-Paced</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="Course description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>Loading courses...</div>
        ) : courses.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>No training courses yet. Create one to get started.</div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="card" style={{ padding: 'var(--space-5)', transition: 'all 0.2s', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{course.title}</h4>
                  <span className="text-sm text-secondary">{course.category}</span>
                </div>
                <span style={{ fontSize: '1.25rem' }}>{formatConfig[course.format]?.icon || '📄'}</span>
              </div>
              {course.description && (
                <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-3)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                  {course.description}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-secondary)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  {course.duration && <span>{course.duration}h</span>}
                  <span>{course._count.enrollments} enrolled</span>
                  {course.provider && <span>{course.provider}</span>}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {course.isMandatory && <span className="badge badge-danger" style={{ fontSize: '0.625rem' }}>Mandatory</span>}
                  <span className="badge badge-info">{formatConfig[course.format]?.label || course.format}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
