'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export default function IntegrationsPage() {
  const { data: healthData } = useQuery<{ data: { status: string; services: { service: string; status: string; responseTime: number }[] } }>({
    queryKey: ['health'],
    queryFn: () => api.get('/health'),
  });

  const integrations = [
    { name: 'PostgreSQL Database', desc: 'Primary data store', category: 'Core', icon: '🐘', status: healthData?.data?.services?.find(s => s.service === 'postgresql')?.status || 'checking', responseTime: healthData?.data?.services?.find(s => s.service === 'postgresql')?.responseTime },
    { name: 'Redis Cache', desc: 'Session and cache storage', category: 'Core', icon: '⚡', status: healthData?.data?.services?.find(s => s.service === 'redis')?.status || 'checking', responseTime: healthData?.data?.services?.find(s => s.service === 'redis')?.responseTime },
    { name: 'JWT Authentication', desc: 'Token-based auth with refresh', category: 'Security', icon: '🔐', status: 'healthy' },
    { name: 'Swagger/OpenAPI', desc: 'API documentation', category: 'Developer', icon: '📄', status: 'healthy' },
    { name: 'Email Service', desc: 'Notifications via SMTP', category: 'Communication', icon: '📧', status: 'configured' },
    { name: 'LDAP/Active Directory', desc: 'Enterprise SSO', category: 'Security', icon: '🏢', status: 'configured' },
    { name: 'File Storage', desc: 'Document uploads', category: 'Storage', icon: '📁', status: 'configured' },
    { name: 'Audit Logger', desc: 'Compliance audit trail', category: 'Monitoring', icon: '📋', status: 'healthy' },
  ];

  const statusConfig: Record<string, { label: string; class: string }> = {
    healthy: { label: 'Connected', class: 'badge-success' },
    configured: { label: 'Configured', class: 'badge-info' },
    checking: { label: 'Checking...', class: 'badge-neutral' },
    degraded: { label: 'Degraded', class: 'badge-warning' },
    unhealthy: { label: 'Disconnected', class: 'badge-danger' },
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Integrations</h1>
          <p>Connected services and system integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          </div>
          <div>
            <div className="stat-value">{integrations.filter(i => i.status === 'healthy').length}</div>
            <div className="stat-label">Active Connections</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83" /></svg>
          </div>
          <div>
            <div className="stat-value">{integrations.filter(i => i.status === 'configured').length}</div>
            <div className="stat-label">Configured</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
          </div>
          <div>
            <div className="stat-value">{integrations.length}</div>
            <div className="stat-label">Total Integrations</div>
          </div>
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 'var(--space-5)' }}>
          <h3 style={{ marginBottom: 'var(--space-3)', fontSize: '0.875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {integrations.filter(i => i.category === cat).map(int => (
              <div key={int.name} className="card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <span style={{ fontSize: '2rem' }}>{int.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                    <h4 style={{ fontWeight: 600 }}>{int.name}</h4>
                    <span className={`badge ${statusConfig[int.status]?.class || 'badge-neutral'}`}>{statusConfig[int.status]?.label || int.status}</span>
                  </div>
                  <div className="text-sm text-secondary">{int.desc}</div>
                  {int.responseTime != null && (
                    <div className="text-xs text-tertiary font-mono" style={{ marginTop: 'var(--space-1)' }}>Response: {int.responseTime}ms</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
