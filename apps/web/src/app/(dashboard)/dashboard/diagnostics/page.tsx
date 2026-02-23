'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface SystemHealth {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  services: { service: string; status: string; responseTime: number; details?: Record<string, unknown> }[];
  memory: { rss: number; heapUsed: number; heapTotal: number; external: number };
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [d > 0 ? `${d}d` : '', h > 0 ? `${h}h` : '', `${m}m`, `${s}s`].filter(Boolean).join(' ');
}

const statusColor: Record<string, string> = { healthy: 'var(--success)', degraded: 'var(--warning)', unhealthy: 'var(--danger)' };

export default function DiagnosticsPage() {
  const { data: healthData, isLoading, refetch } = useQuery<{ data: SystemHealth }>({
    queryKey: ['health'],
    queryFn: () => api.get('/health'),
    refetchInterval: 30000,
  });
  const health = healthData?.data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>System Diagnostics</h1>
          <p>Real-time system health and service monitoring</p>
        </div>
        <button className="btn btn-secondary" onClick={() => refetch()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>Checking system health...</div>
      ) : !health ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⚠️</div>
          <h3>Unable to reach API</h3>
          <p className="text-secondary">The backend server may be offline.</p>
        </div>
      ) : (
        <>
          {/* Overall Status */}
          <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: `${statusColor[health.status]}20`, color: statusColor[health.status] }}>
                <div style={{ width: 20, height: 20, borderRadius: 'var(--radius-full)', background: statusColor[health.status] }} />
              </div>
              <div>
                <div className="stat-value" style={{ textTransform: 'capitalize' }}>{health.status}</div>
                <div className="stat-label">System Status</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <div>
                <div className="stat-value">{formatUptime(health.uptime)}</div>
                <div className="stat-label">Uptime</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              </div>
              <div>
                <div className="stat-value">{health.memory.heapUsed} MB</div>
                <div className="stat-label">Memory (Heap Used)</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              <div>
                <div className="stat-value">v{health.version}</div>
                <div className="stat-label">API Version</div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="grid grid-cols-2" style={{ marginBottom: 'var(--space-6)' }}>
            {health.services.map(svc => (
              <div key={svc.service} className="card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 'var(--radius-full)', background: statusColor[svc.status] }} />
                    <h3 style={{ textTransform: 'capitalize' }}>{svc.service}</h3>
                  </div>
                  <span className={`badge ${svc.status === 'healthy' ? 'badge-success' : svc.status === 'degraded' ? 'badge-warning' : 'badge-danger'}`}>
                    {svc.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                  <div>
                    <div className="text-xs text-tertiary">Response Time</div>
                    <div className="font-mono" style={{ fontWeight: 600 }}>{svc.responseTime}ms</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Memory Chart */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Memory Usage</h3>
            <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
              {[
                { label: 'RSS', value: health.memory.rss, max: 512, color: 'var(--accent-primary)' },
                { label: 'Heap Used', value: health.memory.heapUsed, max: health.memory.heapTotal, color: 'var(--success)' },
                { label: 'Heap Total', value: health.memory.heapTotal, max: 512, color: 'var(--warning)' },
                { label: 'External', value: health.memory.external, max: 64, color: 'var(--info)' },
              ].map(m => (
                <div key={m.label} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span className="text-sm">{m.label}</span>
                    <span className="font-mono text-sm">{m.value} MB</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (m.value / m.max) * 100)}%`, background: m.color, borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
            <span className="text-xs text-tertiary">Last checked: {new Date(health.timestamp).toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  );
}
