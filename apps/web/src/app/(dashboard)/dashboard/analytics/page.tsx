'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export default function AnalyticsPage() {
  const { data: dashStats } = useQuery<{ data: { totalEmployees: number; activeEmployees: number; presentToday: number; attendanceRate: number; pendingLeaves: number; departments: { name: string; count: number }[] } }>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/employees/dashboard-stats'),
  });
  const stats = dashStats?.data;

  const { data: trainingSummary } = useQuery<{ data: { totalCourses: number; completionRate: number; totalEnrollments: number } }>({
    queryKey: ['training', 'summary'],
    queryFn: () => api.get('/training/summary'),
  });

  const { data: perfSummary } = useQuery<{ data: { totalReviews: number; completed: number; averageRating: string } }>({
    queryKey: ['performance', 'summary'],
    queryFn: () => api.get('/performance/summary'),
  });

  const { data: recruitSummary } = useQuery<{ data: { openJobs: number; totalApplicants: number; hiredThisMonth: number } }>({
    queryKey: ['recruitment', 'summary'],
    queryFn: () => api.get('/recruitment/summary'),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Organization-wide metrics and insights</p>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Workforce */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>👥 Workforce Overview</h3>
          {stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Total Employees', value: stats.totalEmployees, color: 'var(--accent-primary)' },
                { label: 'Active', value: stats.activeEmployees, color: 'var(--success)' },
                { label: 'Present Today', value: stats.presentToday, color: 'var(--info)' },
                { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, color: 'var(--warning)' },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-secondary)' }}>
                  <span className="text-sm">{m.label}</span>
                  <span className="font-mono" style={{ fontWeight: 600, color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          ) : <div className="text-secondary">Loading...</div>}
        </div>

        {/* Departments */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>🏢 Department Distribution</h3>
          {stats?.departments ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {stats.departments.map((d, i) => {
                const max = Math.max(...stats.departments.map(x => x.count));
                const colors = ['var(--accent-primary)', 'var(--success)', 'var(--warning)', 'var(--info)', 'var(--danger)', '#8b5cf6'];
                return (
                  <div key={d.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                      <span className="text-sm">{d.name}</span>
                      <span className="font-mono text-sm">{d.count}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(d.count / max) * 100}%`, background: colors[i % colors.length], borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="text-secondary">Loading...</div>}
        </div>

        {/* Recruitment */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📋 Recruitment Pipeline</h3>
          {recruitSummary?.data ? (
            <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
              {[
                { label: 'Open Jobs', value: recruitSummary.data.openJobs, emoji: '📌' },
                { label: 'Applicants', value: recruitSummary.data.totalApplicants, emoji: '👤' },
                { label: 'Hired', value: recruitSummary.data.hiredThisMonth, emoji: '✅' },
              ].map(m => (
                <div key={m.label} style={{ flex: 1, textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>{m.emoji}</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>{m.value}</div>
                  <div className="text-xs text-tertiary">{m.label}</div>
                </div>
              ))}
            </div>
          ) : <div className="text-secondary">Loading...</div>}
        </div>

        {/* Training & Performance */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📊 Training & Performance</h3>
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            <div style={{ flex: 1 }}>
              <h4 className="text-sm text-secondary" style={{ marginBottom: 'var(--space-3)' }}>Training</h4>
              {trainingSummary?.data ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-sm">Courses</span><strong>{trainingSummary.data.totalCourses}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-sm">Enrollments</span><strong>{trainingSummary.data.totalEnrollments}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-sm">Completion</span><strong>{trainingSummary.data.completionRate}%</strong>
                  </div>
                </div>
              ) : <div className="text-secondary">Loading...</div>}
            </div>
            <div style={{ width: 1, background: 'var(--border-secondary)' }} />
            <div style={{ flex: 1 }}>
              <h4 className="text-sm text-secondary" style={{ marginBottom: 'var(--space-3)' }}>Performance</h4>
              {perfSummary?.data ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-sm">Reviews</span><strong>{perfSummary.data.totalReviews}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-sm">Completed</span><strong>{perfSummary.data.completed}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-sm">Avg Rating</span><strong>{perfSummary.data.averageRating}</strong>
                  </div>
                </div>
              ) : <div className="text-secondary">Loading...</div>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
        <span className="text-sm text-tertiary">Data refreshes automatically. All metrics are calculated from live system data.</span>
      </div>
    </div>
  );
}
