'use client';

import { useState } from 'react';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';

const log = createLogger('PerformancePage');

interface Review {
  id: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  reviewPeriod: string;
  reviewer: string;
  overallRating: number;
  status: 'completed' | 'in-progress' | 'not-started' | 'overdue';
  dueDate: string;
  goals: { title: string; progress: number }[];
}

const mockReviews: Review[] = [
  {
    id: '1',
    employeeName: 'Sarah Johnson',
    employeeNumber: 'EMP-002',
    department: 'Engineering',
    reviewPeriod: 'Q4 2025',
    reviewer: 'Michael Chen',
    overallRating: 4.2,
    status: 'completed',
    dueDate: '2026-01-31',
    goals: [
      { title: 'Code quality improvement', progress: 95 },
      { title: 'Mentoring junior devs', progress: 80 },
    ],
  },
  {
    id: '2',
    employeeName: 'Emily Williams',
    employeeNumber: 'EMP-004',
    department: 'Marketing',
    reviewPeriod: 'Q4 2025',
    reviewer: 'System Administrator',
    overallRating: 0,
    status: 'in-progress',
    dueDate: '2026-02-28',
    goals: [
      { title: 'Campaign ROI target', progress: 60 },
      { title: 'Social media growth', progress: 45 },
    ],
  },
  {
    id: '3',
    employeeName: 'James Rodriguez',
    employeeNumber: 'EMP-005',
    department: 'Finance',
    reviewPeriod: 'Q4 2025',
    reviewer: 'System Administrator',
    overallRating: 3.8,
    status: 'completed',
    dueDate: '2026-01-31',
    goals: [
      { title: 'Financial reporting automation', progress: 100 },
      { title: 'Budget accuracy', progress: 90 },
    ],
  },
  {
    id: '4',
    employeeName: 'Aiko Tanaka',
    employeeNumber: 'EMP-006',
    department: 'Operations',
    reviewPeriod: 'Q4 2025',
    reviewer: 'System Administrator',
    overallRating: 4.6,
    status: 'completed',
    dueDate: '2026-01-31',
    goals: [
      { title: 'Process optimization', progress: 92 },
      { title: 'Vendor management', progress: 88 },
    ],
  },
  {
    id: '5',
    employeeName: 'David Kim',
    employeeNumber: 'EMP-007',
    department: 'Engineering',
    reviewPeriod: 'Q4 2025',
    reviewer: 'Michael Chen',
    overallRating: 0,
    status: 'not-started',
    dueDate: '2026-02-28',
    goals: [
      { title: 'Test coverage target', progress: 30 },
      { title: 'Bug resolution rate', progress: 55 },
    ],
  },
  {
    id: '6',
    employeeName: 'Lisa Patel',
    employeeNumber: 'EMP-008',
    department: 'Sales',
    reviewPeriod: 'Q4 2025',
    reviewer: 'System Administrator',
    overallRating: 0,
    status: 'overdue',
    dueDate: '2026-01-31',
    goals: [
      { title: 'Sales target Q4', progress: 72 },
      { title: 'Client retention', progress: 85 },
    ],
  },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  completed: { label: 'Completed', class: 'badge-success' },
  'in-progress': { label: 'In Progress', class: 'badge-info' },
  'not-started': { label: 'Not Started', class: 'badge-neutral' },
  overdue: { label: 'Overdue', class: 'badge-danger' },
};

const getRatingColor = (r: number) =>
  r >= 4.5
    ? 'var(--success)'
    : r >= 3.5
      ? 'var(--info)'
      : r >= 2.5
        ? 'var(--warning)'
        : 'var(--danger)';

export default function PerformancePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completedCount = mockReviews.filter((r) => r.status === 'completed').length;
  const avgRating =
    mockReviews.filter((r) => r.overallRating > 0).reduce((s, r) => s + r.overallRating, 0) /
    mockReviews.filter((r) => r.overallRating > 0).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Performance</h1>
          <p>Track reviews, goals, and employee development</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            log.info('StartReviewCycle', 'Starting new review cycle');
            toast.success(
              'Review Cycle',
              'New Q1 2026 review cycle has been initiated for all departments.',
            );
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
          Start Review Cycle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{mockReviews.length}</div>
            <div className="stat-label">Total Reviews</div>
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div className="stat-value">
              {completedCount}/{mockReviews.length}
            </div>
            <div className="stat-label">Completed</div>
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
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{avgRating.toFixed(1)}</div>
            <div className="stat-label">Avg Rating</div>
          </div>
        </div>
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <div className="stat-value">
              {mockReviews.filter((r) => r.status === 'overdue').length}
            </div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      {/* Review Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {mockReviews.map((review) => (
          <div
            key={review.id}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => setExpandedId(expandedId === review.id ? null : review.id)}
          >
            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{review.employeeName}</div>
                    <div className="text-xs text-secondary">
                      {review.department} · {review.reviewPeriod}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  {review.overallRating > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: getRatingColor(review.overallRating),
                        }}
                      >
                        {review.overallRating}
                      </div>
                      <div className="text-xs text-tertiary">/ 5.0</div>
                    </div>
                  )}
                  <span className={`badge ${statusConfig[review.status]?.class}`}>
                    {statusConfig[review.status]?.label}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      transform: expandedId === review.id ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Expanded Goals */}
              {expandedId === review.id && (
                <div
                  style={{
                    marginTop: 'var(--space-4)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--border-secondary)',
                  }}
                >
                  <div
                    className="text-xs text-secondary"
                    style={{
                      marginBottom: 'var(--space-3)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Goals & Objectives
                  </div>
                  {review.goals.map((goal, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: 'var(--space-3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-4)',
                      }}
                    >
                      <span className="text-sm" style={{ flex: 1, minWidth: 0 }}>
                        {goal.title}
                      </span>
                      <div
                        style={{
                          width: 120,
                          height: 6,
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${goal.progress}%`,
                            borderRadius: 'var(--radius-full)',
                            background:
                              goal.progress >= 80
                                ? 'var(--success)'
                                : goal.progress >= 50
                                  ? 'var(--warning)'
                                  : 'var(--danger)',
                          }}
                        />
                      </div>
                      <span
                        className="font-mono text-xs"
                        style={{ width: 36, textAlign: 'right', flexShrink: 0 }}
                      >
                        {goal.progress}%
                      </span>
                    </div>
                  ))}
                  <div
                    style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}
                  >
                    <span className="text-xs text-tertiary">Reviewer: {review.reviewer}</span>
                    <span className="text-xs text-tertiary">
                      Due:{' '}
                      {new Date(review.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
