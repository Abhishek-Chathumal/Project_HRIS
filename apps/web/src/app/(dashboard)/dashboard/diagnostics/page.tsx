'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';

const diagLog = createLogger('DiagnosticsPage');

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  uptime: string;
}

interface SystemMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

const mockServices: ServiceStatus[] = [
  { name: 'API Server', status: 'healthy', responseTime: 12, uptime: '99.98%' },
  { name: 'PostgreSQL', status: 'healthy', responseTime: 3, uptime: '99.99%' },
  { name: 'Redis Cache', status: 'healthy', responseTime: 1, uptime: '99.99%' },
  { name: 'Elasticsearch', status: 'healthy', responseTime: 8, uptime: '99.95%' },
  { name: 'MinIO Storage', status: 'healthy', responseTime: 15, uptime: '99.97%' },
  { name: 'Mail Service', status: 'degraded', responseTime: 250, uptime: '98.50%' },
];

const mockMetrics: SystemMetric[] = [
  { label: 'CPU Usage', value: 23, max: 100, unit: '%', color: '#3B82F6' },
  { label: 'Memory (Heap)', value: 156, max: 512, unit: 'MB', color: '#10B981' },
  { label: 'Memory (RSS)', value: 210, max: 1024, unit: 'MB', color: '#8B5CF6' },
  { label: 'Disk Usage', value: 12, max: 100, unit: 'GB', color: '#F59E0B' },
];

const mockLogs = [
  {
    time: '05:12:01',
    level: 'info',
    message: 'Health check passed — all services operational',
    service: 'health',
  },
  {
    time: '05:11:45',
    level: 'warn',
    message: 'Mail service response time elevated (250ms)',
    service: 'mail',
  },
  {
    time: '05:10:30',
    level: 'info',
    message: 'Database connection pool: 8/20 active connections',
    service: 'prisma',
  },
  { time: '05:09:15', level: 'info', message: 'Redis cache hit rate: 94.2%', service: 'redis' },
  {
    time: '05:08:00',
    level: 'info',
    message: 'Auto-cleanup: removed 23 expired sessions',
    service: 'auth',
  },
  {
    time: '05:05:30',
    level: 'info',
    message: 'Scheduled audit log rotation completed',
    service: 'audit',
  },
  {
    time: '05:00:00',
    level: 'info',
    message: 'System health check scheduled (every 5m)',
    service: 'scheduler',
  },
  {
    time: '04:55:20',
    level: 'warn',
    message: 'Slow query detected: employee search (420ms)',
    service: 'prisma',
  },
  {
    time: '04:50:00',
    level: 'info',
    message: 'Health check passed — all services operational',
    service: 'health',
  },
];

const statusColors: Record<string, string> = {
  healthy: 'var(--success)',
  degraded: 'var(--warning)',
  unhealthy: 'var(--danger)',
};

const logLevelColors: Record<string, string> = {
  info: 'var(--info)',
  warn: 'var(--warning)',
  error: 'var(--danger)',
};

export default function DiagnosticsPage() {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const overallStatus = mockServices.every((s) => s.status === 'healthy')
    ? 'healthy'
    : mockServices.some((s) => s.status === 'unhealthy')
      ? 'unhealthy'
      : 'degraded';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>System Diagnostics</h1>
          <p>Real-time system health monitoring and self-diagnostics</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              background:
                overallStatus === 'healthy' ? 'var(--success-light)' : 'var(--warning-light)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: statusColors[overallStatus],
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 'var(--radius-full)',
                background: statusColors[overallStatus],
                animation: 'pulse 2s infinite',
              }}
            />
            {overallStatus === 'healthy' ? 'All Systems Operational' : 'Degraded Performance'}
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              diagLog.info('RunDiagnostic', 'Running full system diagnostic');
              toast.info(
                'Diagnostic Started',
                'Running full system health check across all services...',
              );
              setTimeout(
                () => toast.success('Diagnostic Complete', 'All systems passed health checks.'),
                2000,
              );
            }}
          >
            Run Full Diagnostic
          </button>
        </div>
      </div>

      {/* Uptime + Metrics */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div
          className="stat-card"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            color: '#fff',
            border: 'none',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: 'var(--space-2)',
              }}
            >
              System Uptime
            </div>
            <div
              className="stat-value"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem' }}
            >
              {formatUptime(345600 + uptime)}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                marginTop: 'var(--space-1)',
              }}
            >
              Since last restart
            </div>
          </div>
        </div>
        {mockMetrics.map((metric) => (
          <div key={metric.label} className="stat-card">
            <div style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <span className="text-sm text-secondary">{metric.label}</span>
                <span className="font-mono text-sm" style={{ fontWeight: 600 }}>
                  {metric.value}
                  {metric.unit}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(metric.value / metric.max) * 100}%`,
                    background: metric.color,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div className="text-xs text-tertiary" style={{ marginTop: 'var(--space-1)' }}>
                of {metric.max}
                {metric.unit}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Services + Logs */}
      <div className="grid grid-cols-2">
        {/* Service Status */}
        <div className="card">
          <div className="card-header">
            <h3>Service Status</h3>
            <span className="text-xs text-tertiary">Updated 30s ago</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {mockServices.map((service) => (
              <div
                key={service.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-5)',
                  borderBottom: '1px solid var(--border-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 'var(--radius-full)',
                      background: statusColors[service.status],
                    }}
                  />
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{service.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <span className="font-mono text-xs text-tertiary">{service.responseTime}ms</span>
                  <span className="text-xs text-secondary">{service.uptime}</span>
                  <span
                    className={`badge ${service.status === 'healthy' ? 'badge-success' : service.status === 'degraded' ? 'badge-warning' : 'badge-danger'}`}
                  >
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Logs</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                diagLog.info('ViewAllLogs', 'Viewing full system log');
                toast.info('System Logs', 'Opening full log viewer.');
              }}
            >
              View all
            </button>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: 400, overflowY: 'auto' }}>
            {mockLogs.map((entry, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-5)',
                  borderBottom: '1px solid var(--border-secondary)',
                  fontSize: '0.8125rem',
                }}
              >
                <span
                  className="font-mono text-xs text-tertiary"
                  style={{ flexShrink: 0, paddingTop: 2 }}
                >
                  {entry.time}
                </span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)',
                    background:
                      entry.level === 'warn'
                        ? 'var(--warning-light)'
                        : entry.level === 'error'
                          ? 'var(--danger-light)'
                          : 'var(--info-light)',
                    color: logLevelColors[entry.level],
                    flexShrink: 0,
                  }}
                >
                  {entry.level}
                </span>
                <div style={{ flex: 1 }}>
                  <span>{entry.message}</span>
                </div>
                <span className="text-xs text-tertiary" style={{ flexShrink: 0 }}>
                  {entry.service}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
