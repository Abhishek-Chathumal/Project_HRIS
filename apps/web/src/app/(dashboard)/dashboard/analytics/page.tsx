'use client';

import { useState } from 'react';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';
import styles from './analytics.module.css';

const log = createLogger('AnalyticsPage');

interface AttritionData {
  department: string;
  risk: number;
  headcount: number;
  turnover: number;
  topFactor: string;
}

interface AnomalyItem {
  id: string;
  type: 'attendance' | 'payroll' | 'leave' | 'performance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  confidence: number;
}

const attritionData: AttritionData[] = [
  {
    department: 'Engineering',
    risk: 18,
    headcount: 45,
    turnover: 12.5,
    topFactor: 'Market salary gap',
  },
  {
    department: 'Sales',
    risk: 32,
    headcount: 22,
    turnover: 28.0,
    topFactor: 'Commission structure',
  },
  { department: 'Marketing', risk: 14, headcount: 15, turnover: 8.2, topFactor: 'Career growth' },
  {
    department: 'Operations',
    risk: 8,
    headcount: 30,
    turnover: 5.0,
    topFactor: 'Work-life balance',
  },
  { department: 'Finance', risk: 12, headcount: 18, turnover: 9.3, topFactor: 'Management style' },
  { department: 'HR', risk: 5, headcount: 10, turnover: 3.0, topFactor: 'N/A' },
];

const anomalies: AnomalyItem[] = [
  {
    id: '1',
    type: 'attendance',
    title: 'Unusual absence pattern',
    description:
      'EMP-012 has shown a 340% increase in Monday absences over the past 6 weeks, deviating 3.2σ from baseline.',
    severity: 'medium',
    detectedAt: '2026-02-22T14:30:00',
    status: 'new',
    confidence: 87,
  },
  {
    id: '2',
    type: 'payroll',
    title: 'Overtime spike detected',
    description:
      'Engineering department overtime hours increased 156% this period — 4 employees exceeding legal weekly limits.',
    severity: 'high',
    detectedAt: '2026-02-22T10:15:00',
    status: 'investigating',
    confidence: 94,
  },
  {
    id: '3',
    type: 'leave',
    title: 'Leave exhaustion risk',
    description:
      '8 employees in Sales projected to exhaust all leave balances by Q2 based on current consumption rate.',
    severity: 'medium',
    detectedAt: '2026-02-21T09:00:00',
    status: 'new',
    confidence: 78,
  },
  {
    id: '4',
    type: 'performance',
    title: 'Performance decline cluster',
    description:
      'Cluster of 5 employees in Marketing showing synchronized performance decline — potential management issue.',
    severity: 'critical',
    detectedAt: '2026-02-20T16:45:00',
    status: 'investigating',
    confidence: 92,
  },
  {
    id: '5',
    type: 'attendance',
    title: 'Buddy punching suspicion',
    description:
      'Clock-in IP addresses for EMP-034 and EMP-041 match 98% of the time across different shifts.',
    severity: 'high',
    detectedAt: '2026-02-19T11:20:00',
    status: 'resolved',
    confidence: 96,
  },
];

const trendData = [
  { month: 'Sep', attrition: 4.2, hiring: 6, engagement: 78 },
  { month: 'Oct', attrition: 3.8, hiring: 8, engagement: 80 },
  { month: 'Nov', attrition: 5.1, hiring: 5, engagement: 76 },
  { month: 'Dec', attrition: 2.9, hiring: 3, engagement: 82 },
  { month: 'Jan', attrition: 6.3, hiring: 10, engagement: 74 },
  { month: 'Feb', attrition: 4.0, hiring: 7, engagement: 79 },
];

const severityConfig: Record<string, { label: string; class: string; color: string }> = {
  low: { label: 'Low', class: 'badge-success', color: '#10B981' },
  medium: { label: 'Medium', class: 'badge-warning', color: '#F59E0B' },
  high: { label: 'High', class: 'badge-danger', color: '#EF4444' },
  critical: { label: 'Critical', class: 'badge-danger', color: '#DC2626' },
};

const statusConfig: Record<string, { label: string; class: string }> = {
  new: { label: 'New', class: 'badge-info' },
  investigating: { label: 'Investigating', class: 'badge-warning' },
  resolved: { label: 'Resolved', class: 'badge-success' },
  dismissed: { label: 'Dismissed', class: 'badge-neutral' },
};

const typeIcons: Record<string, string> = {
  attendance: '🕐',
  payroll: '💰',
  leave: '🏖',
  performance: '📊',
};

const getRiskColor = (risk: number) =>
  risk >= 30
    ? 'var(--danger)'
    : risk >= 20
      ? 'var(--warning)'
      : risk >= 10
        ? 'var(--info)'
        : 'var(--success)';

const maxBar = Math.max(...trendData.map((d) => d.hiring));

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'attrition' | 'anomalies' | 'trends'>('attrition');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>ML Analytics</h1>
          <p>AI-powered workforce intelligence, predictions, and anomaly detection</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span className={styles.mlBadge}>
            <span className={styles.pulseGreen} /> Model v2.4 — Trained Feb 20
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => {
              log.info('ExportReport', 'Exporting ML analytics report');
              toast.success('Report Export', 'ML Analytics report is being generated as PDF.');
            }}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div>
            <div className="stat-value">14.2%</div>
            <div className="stat-label">Attrition Risk</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{anomalies.filter((a) => a.status === 'new').length}</div>
            <div className="stat-label">Active Anomalies</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--success-light)', color: 'var(--success)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div className="stat-value">79%</div>
            <div className="stat-label">Engagement Score</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 20V10" />
              <path d="M18 20V4" />
              <path d="M6 20v-4" />
            </svg>
          </div>
          <div>
            <div className="stat-value">91%</div>
            <div className="stat-label">Model Accuracy</div>
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
        {(['attrition', 'anomalies', 'trends'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              background: 'none',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--accent-primary)' : 'transparent'}`,
              marginBottom: '-2px',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            {tab === 'attrition'
              ? '🎯 Attrition Prediction'
              : tab === 'anomalies'
                ? '🔍 Anomaly Detection'
                : '📈 Workforce Trends'}
          </button>
        ))}
      </div>

      {/* Attrition Tab */}
      {activeTab === 'attrition' && (
        <div className="card">
          <div className="card-header">
            <h3>Department Attrition Risk</h3>
          </div>
          <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
            {attritionData.map((dept) => (
              <div key={dept.department} className={styles.attritionRow}>
                <div style={{ width: 120, fontWeight: 500, fontSize: '0.875rem' }}>
                  {dept.department}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: 24,
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${dept.risk}%`,
                        background: getRiskColor(dept.risk),
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.5s ease',
                        minWidth: 8,
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {dept.risk}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-secondary" style={{ width: 80, textAlign: 'right' }}>
                  {dept.headcount} staff
                </div>
                <div
                  className="text-xs font-mono"
                  style={{
                    width: 70,
                    textAlign: 'right',
                    color: dept.turnover > 15 ? 'var(--danger)' : 'var(--text-secondary)',
                  }}
                >
                  {dept.turnover}% TO
                </div>
                <div className="text-xs text-tertiary" style={{ width: 150, textAlign: 'right' }}>
                  {dept.topFactor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={styles.anomalyCard}
              style={{ borderLeftColor: severityConfig[anomaly.severity]?.color }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: '1.25rem' }}>{typeIcons[anomaly.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{anomaly.title}</span>
                    <span className={`badge ${severityConfig[anomaly.severity]?.class}`}>
                      {severityConfig[anomaly.severity]?.label}
                    </span>
                    <span className={`badge ${statusConfig[anomaly.status]?.class}`}>
                      {statusConfig[anomaly.status]?.label}
                    </span>
                  </div>
                  <p
                    className="text-sm text-secondary"
                    style={{ lineHeight: 1.5, marginBottom: 'var(--space-2)' }}
                  >
                    {anomaly.description}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <span className="text-xs text-tertiary">
                      Confidence: <strong className="font-mono">{anomaly.confidence}%</strong>
                    </span>
                    <span className="text-xs text-tertiary">
                      Detected:{' '}
                      {new Date(anomaly.detectedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    log.info('Investigate', `Investigating anomaly: ${anomaly.title}`, {
                      anomalyId: anomaly.id,
                    });
                    toast.info('Investigation', `Opening investigation for "${anomaly.title}".`);
                  }}
                >
                  Investigate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
          {/* Hiring Trend (bar chart) */}
          <div className="card">
            <div className="card-header">
              <h4>Hiring Trend (6 months)</h4>
            </div>
            <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 'var(--space-3)',
                  height: 160,
                }}
              >
                {trendData.map((d) => (
                  <div
                    key={d.month}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                    }}
                  >
                    <span className="text-xs font-mono">{d.hiring}</span>
                    <div
                      style={{
                        width: '100%',
                        height: `${(d.hiring / maxBar) * 120}px`,
                        background:
                          'linear-gradient(180deg, var(--accent-primary), var(--accent-primary-hover))',
                        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <span className="text-xs text-tertiary">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Engagement Score */}
          <div className="card">
            <div className="card-header">
              <h4>Engagement Score (6 months)</h4>
            </div>
            <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
              {trendData.map((d) => (
                <div
                  key={d.month}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <span className="text-xs text-secondary" style={{ width: 30 }}>
                    {d.month}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${d.engagement}%`,
                        background:
                          d.engagement >= 80
                            ? 'var(--success)'
                            : d.engagement >= 70
                              ? 'var(--warning)'
                              : 'var(--danger)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono" style={{ width: 35, textAlign: 'right' }}>
                    {d.engagement}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Attrition Trend */}
          <div className="card">
            <div className="card-header">
              <h4>Attrition Rate (%)</h4>
            </div>
            <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
              {trendData.map((d) => (
                <div
                  key={d.month}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <span className="text-xs text-secondary" style={{ width: 30 }}>
                    {d.month}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${d.attrition * 10}%`,
                        background:
                          d.attrition >= 5
                            ? 'var(--danger)'
                            : d.attrition >= 3
                              ? 'var(--warning)'
                              : 'var(--success)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono" style={{ width: 35, textAlign: 'right' }}>
                    {d.attrition}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className="card">
            <div className="card-header">
              <h4>Key Insights</h4>
            </div>
            <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
              <div className={styles.insightItem}>
                <span className={styles.insightDot} style={{ background: 'var(--danger)' }} />
                <span className="text-sm">
                  Sales department has <strong>2.3x</strong> higher attrition than company average
                </span>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.insightDot} style={{ background: 'var(--warning)' }} />
                <span className="text-sm">
                  January hiring spike coincides with lowest engagement score
                </span>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.insightDot} style={{ background: 'var(--success)' }} />
                <span className="text-sm">
                  HR department shows strongest retention — 3% annual turnover
                </span>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.insightDot} style={{ background: 'var(--info)' }} />
                <span className="text-sm">
                  Employees with 2+ training courses have <strong>47%</strong> lower attrition risk
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
