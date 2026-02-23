'use client';

import { useState } from 'react';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';
import styles from './integrations.module.css';

const log = createLogger('IntegrationsPage');

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'payroll' | 'cloud' | 'analytics' | 'security' | 'storage';
  status: 'connected' | 'disconnected' | 'error';
  icon: string;
  lastSync?: string;
  features: string[];
}

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered?: string;
  successRate: number;
}

const integrations: Integration[] = [
  {
    id: '1',
    name: 'Slack',
    description:
      'Send HR notifications, leave approvals, and announcements directly to Slack channels.',
    category: 'communication',
    status: 'connected',
    icon: '💬',
    lastSync: '2026-02-23T05:00:00',
    features: ['Leave notifications', 'Approval requests', 'Announcements'],
  },
  {
    id: '2',
    name: 'Microsoft Teams',
    description:
      'Integrate with Teams for meeting scheduling, notifications, and employee directory sync.',
    category: 'communication',
    status: 'disconnected',
    icon: '🟦',
    features: ['Calendar sync', 'Notifications', 'Directory'],
  },
  {
    id: '3',
    name: 'Azure AD / Entra ID',
    description: 'Single Sign-On (SSO) and directory sync via Microsoft Azure Active Directory.',
    category: 'security',
    status: 'connected',
    icon: '🔐',
    lastSync: '2026-02-22T14:30:00',
    features: ['SSO', 'Directory sync', 'MFA'],
  },
  {
    id: '4',
    name: 'Google Workspace',
    description:
      'Sync employee data with Google Workspace for email, calendar, and drive provisioning.',
    category: 'cloud',
    status: 'disconnected',
    icon: '🌐',
    features: ['Email provisioning', 'Calendar', 'Drive'],
  },
  {
    id: '5',
    name: 'QuickBooks',
    description: 'Export payroll data to QuickBooks for accounting and tax filing automation.',
    category: 'payroll',
    status: 'connected',
    icon: '📗',
    lastSync: '2026-02-20T18:00:00',
    features: ['Payroll export', 'Tax filing', 'Journal entries'],
  },
  {
    id: '6',
    name: 'Xero',
    description: 'Bi-directional sync with Xero accounting for payroll, expenses, and invoicing.',
    category: 'payroll',
    status: 'disconnected',
    icon: '🔷',
    features: ['Payroll sync', 'Expenses', 'Invoicing'],
  },
  {
    id: '7',
    name: 'AWS S3',
    description: 'Store employee documents, payslips, and backups in Amazon S3 buckets.',
    category: 'storage',
    status: 'connected',
    icon: '☁️',
    lastSync: '2026-02-23T04:00:00',
    features: ['Document storage', 'Payslip archive', 'Backups'],
  },
  {
    id: '8',
    name: 'Power BI',
    description:
      'Push workforce analytics data to Microsoft Power BI for advanced reporting and dashboards.',
    category: 'analytics',
    status: 'disconnected',
    icon: '📊',
    features: ['HR dashboards', 'Custom reports', 'Real-time data'],
  },
];

const webhooks: WebhookItem[] = [
  {
    id: '1',
    name: 'Employee Onboarding',
    url: 'https://api.example.com/webhooks/onboarding',
    events: ['employee.created', 'employee.activated'],
    status: 'active',
    lastTriggered: '2026-02-22T10:30:00',
    successRate: 98,
  },
  {
    id: '2',
    name: 'Leave Approvals',
    url: 'https://hooks.slack.com/services/T00/B00/xxx',
    events: ['leave.approved', 'leave.rejected'],
    status: 'active',
    lastTriggered: '2026-02-23T04:15:00',
    successRate: 100,
  },
  {
    id: '3',
    name: 'Payroll Export',
    url: 'https://accounting.example.com/api/payroll',
    events: ['payroll.processed', 'payroll.approved'],
    status: 'active',
    lastTriggered: '2026-02-20T18:00:00',
    successRate: 95,
  },
  {
    id: '4',
    name: 'Audit Logger',
    url: 'https://siem.example.com/api/events',
    events: ['audit.*'],
    status: 'inactive',
    successRate: 0,
  },
];

const categoryLabels: Record<string, string> = {
  communication: '💬 Communication',
  payroll: '💰 Payroll & Finance',
  cloud: '☁️ Cloud Services',
  analytics: '📊 Analytics',
  security: '🔐 Security & Identity',
  storage: '💾 Storage',
};

const statusConfig: Record<string, { label: string; class: string }> = {
  connected: { label: 'Connected', class: 'badge-success' },
  disconnected: { label: 'Not Connected', class: 'badge-neutral' },
  error: { label: 'Error', class: 'badge-danger' },
  active: { label: 'Active', class: 'badge-success' },
  inactive: { label: 'Inactive', class: 'badge-neutral' },
};

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'apps' | 'webhooks' | 'api'>('apps');

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Integrations</h1>
          <p>Connect third-party services, manage webhooks, and API access</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            log.info('AddIntegration', 'Opening integration browser');
            toast.info('Add Integration', 'Browse available integrations.');
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Integration
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--success-light)', color: 'var(--success)' }}
          >
            🔗
          </div>
          <div>
            <div className="stat-value">{connectedCount}</div>
            <div className="stat-label">Connected</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--info-light)', color: 'var(--info)' }}
          >
            🔌
          </div>
          <div>
            <div className="stat-value">{integrations.length}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}
          >
            🪝
          </div>
          <div>
            <div className="stat-value">{webhooks.filter((w) => w.status === 'active').length}</div>
            <div className="stat-label">Active Webhooks</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}
          >
            🔑
          </div>
          <div>
            <div className="stat-value">3</div>
            <div className="stat-label">API Keys</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--border-primary)',
          marginBottom: 'var(--space-4)',
          gap: 'var(--space-1)',
        }}
      >
        {[
          { key: 'apps', label: '🔌 Connected Apps' },
          { key: 'webhooks', label: '🪝 Webhooks' },
          { key: 'api', label: '🔑 API Keys' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              background: 'none',
              borderBottom: `2px solid ${activeTab === tab.key ? 'var(--accent-primary)' : 'transparent'}`,
              marginBottom: '-2px',
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Apps Tab */}
      {activeTab === 'apps' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {integrations.map((integration) => (
            <div key={integration.id} className={styles.integrationCard}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{integration.icon}</span>
                  <div>
                    <h4>{integration.name}</h4>
                    <span className="text-xs text-tertiary">
                      {categoryLabels[integration.category]?.split(' ')[1]}
                    </span>
                  </div>
                </div>
                <span className={`badge ${statusConfig[integration.status]?.class}`}>
                  {statusConfig[integration.status]?.label}
                </span>
              </div>
              <p
                className="text-sm text-secondary"
                style={{ lineHeight: 1.5, marginBottom: 'var(--space-3)' }}
              >
                {integration.description}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-1)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                {integration.features.map((f) => (
                  <span key={f} className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                    {f}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--border-secondary)',
                }}
              >
                {integration.lastSync ? (
                  <span className="text-xs text-tertiary">
                    Last sync:{' '}
                    {new Date(integration.lastSync).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                ) : (
                  <span className="text-xs text-tertiary">Never synced</span>
                )}
                <button
                  className={`btn btn-sm ${integration.status === 'connected' ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => {
                    log.info(
                      integration.status === 'connected' ? 'Configure' : 'Connect',
                      `${integration.name}`,
                      { integrationId: integration.id },
                    );
                    toast.info(
                      integration.status === 'connected' ? 'Configure' : 'Connect',
                      `${integration.status === 'connected' ? 'Configuring' : 'Connecting to'} ${integration.name}.`,
                    );
                  }}
                >
                  {integration.status === 'connected' ? 'Configure' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="card">
          <div
            className="card-header"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <h3>Webhook Endpoints</h3>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                log.info('AddWebhook', 'Creating new webhook endpoint');
                toast.info('Add Webhook', 'New webhook creation form is opening.');
              }}
            >
              + Add Webhook
            </button>
          </div>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Events</th>
                  <th>Success %</th>
                  <th>Last Triggered</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((wh) => (
                  <tr key={wh.id}>
                    <td style={{ fontWeight: 500 }}>{wh.name}</td>
                    <td
                      className="font-mono text-xs"
                      style={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {wh.url}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {wh.events.map((e) => (
                          <span
                            key={e}
                            className="badge badge-neutral"
                            style={{ fontSize: '0.5625rem' }}
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td
                      className="font-mono text-sm"
                      style={{
                        color:
                          wh.successRate >= 95
                            ? 'var(--success)'
                            : wh.successRate >= 80
                              ? 'var(--warning)'
                              : 'var(--danger)',
                      }}
                    >
                      {wh.successRate}%
                    </td>
                    <td className="text-xs text-secondary">
                      {wh.lastTriggered
                        ? new Date(wh.lastTriggered).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td>
                      <span className={`badge ${statusConfig[wh.status]?.class}`}>
                        {statusConfig[wh.status]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div
              className="card-header"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h3>API Keys</h3>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  log.info('GenerateKey', 'Generating new API key');
                  toast.info('Generate Key', 'New API key generation dialog is opening.');
                }}
              >
                + Generate Key
              </button>
            </div>
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Key</th>
                    <th>Permissions</th>
                    <th>Created</th>
                    <th>Last Used</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 500 }}>Production API</td>
                    <td className="font-mono text-xs">hris_prod_••••••••••••aB3x</td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                        Full Access
                      </span>
                    </td>
                    <td className="text-xs text-secondary">Jan 15, 2026</td>
                    <td className="text-xs text-secondary">2 min ago</td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 500 }}>Mobile App</td>
                    <td className="font-mono text-xs">hris_mob_••••••••••••kL9m</td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                        Read Only
                      </span>
                    </td>
                    <td className="text-xs text-secondary">Feb 1, 2026</td>
                    <td className="text-xs text-secondary">1 hour ago</td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 500 }}>Webhook Tester</td>
                    <td className="font-mono text-xs">hris_test_••••••••••••zQ7w</td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                        Employees + Leave
                      </span>
                    </td>
                    <td className="text-xs text-secondary">Feb 10, 2026</td>
                    <td className="text-xs text-secondary">3 days ago</td>
                    <td>
                      <span className="badge badge-warning">Limited</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* REST API docs link */}
          <div className="card">
            <div
              className="card-body"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}
            >
              <div style={{ fontSize: '2rem' }}>📖</div>
              <div style={{ flex: 1 }}>
                <h4>API Documentation</h4>
                <p className="text-sm text-secondary">
                  Full REST API reference with interactive examples, authentication guide, and rate
                  limit details.
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  log.info('OpenAPIDocs', 'Opening API documentation');
                  toast.info('API Docs', 'Opening API documentation in new tab.');
                }}
              >
                Open API Docs →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
