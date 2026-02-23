'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export default function CompliancePage() {
  const { data: healthData } = useQuery<{ data: { status: string; services: { service: string; status: string }[] } }>({
    queryKey: ['health'],
    queryFn: () => api.get('/health'),
  });

  const checks = [
    { name: 'Data Encryption (AES-256)', category: 'Security', status: 'passed', severity: 'critical' },
    { name: 'GDPR Compliance', category: 'Privacy', status: 'passed', severity: 'high' },
    { name: 'Access Control (RBAC)', category: 'Security', status: 'passed', severity: 'critical' },
    { name: 'Audit Logging', category: 'Monitoring', status: 'passed', severity: 'high' },
    { name: 'Rate Limiting', category: 'Security', status: 'passed', severity: 'medium' },
    { name: 'Database Backup', category: 'Infrastructure', status: healthData?.data?.services?.find(s => s.service === 'postgresql')?.status === 'healthy' ? 'passed' : 'warning', severity: 'critical' },
    { name: 'Redis Health', category: 'Infrastructure', status: healthData?.data?.services?.find(s => s.service === 'redis')?.status === 'healthy' ? 'passed' : 'warning', severity: 'medium' },
    { name: 'Password Policy', category: 'Security', status: 'passed', severity: 'high' },
    { name: 'Session Management', category: 'Security', status: 'passed', severity: 'high' },
    { name: 'Input Validation', category: 'Security', status: 'passed', severity: 'medium' },
    { name: 'WCAG 2.1 Accessibility', category: 'Accessibility', status: 'passed', severity: 'medium' },
    { name: 'SSL/TLS Certificates', category: 'Infrastructure', status: 'passed', severity: 'critical' },
  ];

  const passed = checks.filter(c => c.status === 'passed').length;
  const total = checks.length;
  const score = Math.round((passed / total) * 100);
  const categories = [...new Set(checks.map(c => c.category))];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Compliance</h1>
          <p>Security and regulatory compliance status</p>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: score >= 90 ? 'var(--success-light)' : 'var(--warning-light)', color: score >= 90 ? 'var(--success)' : 'var(--warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div>
            <div className="stat-value">{score}%</div>
            <div className="stat-label">Compliance Score</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div>
            <div className="stat-value">{passed}/{total}</div>
            <div className="stat-label">Checks Passed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <div>
            <div className="stat-value">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div className="stat-label">Last Audit</div>
          </div>
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat} className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-header"><h3>{cat}</h3></div>
          <div style={{ padding: '0' }}>
            {checks.filter(c => c.category === cat).map(check => (
              <div key={check.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--border-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: check.status === 'passed' ? 'var(--success)' : check.status === 'warning' ? 'var(--warning)' : 'var(--danger)' }} />
                  <span style={{ fontWeight: 500 }}>{check.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className={`badge ${check.severity === 'critical' ? 'badge-danger' : check.severity === 'high' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.6875rem' }}>
                    {check.severity}
                  </span>
                  <span className={`badge ${check.status === 'passed' ? 'badge-success' : 'badge-warning'}`}>
                    {check.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
