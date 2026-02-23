'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/components/toast';

interface PerformanceReview {
  id: string;
  reviewType: string;
  period: string;
  selfRating: string | null;
  reviewerRating: string | null;
  finalRating: string | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
  employee: { firstName: string; lastName: string; employeeNumber: string; department?: { name: string } };
  reviewer: { firstName: string; lastName: string };
}

interface PerformanceSummary {
  totalReviews: number;
  completed: number;
  inProgress: number;
  averageRating: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'badge-neutral' },
  self_review: { label: 'Self Review', class: 'badge-info' },
  manager_review: { label: 'Manager Review', class: 'badge-warning' },
  calibration: { label: 'Calibration', class: 'badge-warning' },
  completed: { label: 'Completed', class: 'badge-success' },
};

function renderStars(rating: string | null) {
  if (!rating) return '—';
  const val = Number(rating);
  const full = Math.floor(val);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < full ? 'var(--warning)' : 'none'} stroke="var(--warning)" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  return <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>{stars}<span className="text-sm font-mono" style={{ marginLeft: 4 }}>{Number(rating).toFixed(1)}</span></div>;
}

export default function PerformancePage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: summaryData } = useQuery<{ data: PerformanceSummary }>({
    queryKey: ['performance', 'summary'],
    queryFn: () => api.get('/performance/summary'),
  });
  const summary = summaryData?.data ?? { totalReviews: 0, completed: 0, inProgress: 0, averageRating: 'N/A' };

  const { data: reviewsData, isLoading } = useQuery<{ data: { data: PerformanceReview[] } }>({
    queryKey: ['performance', 'reviews', statusFilter],
    queryFn: () => api.get('/performance/reviews', { status: statusFilter || undefined }),
  });
  const reviews = reviewsData?.data?.data ?? [];

  const completeMutation = useMutation({
    mutationFn: ({ id, finalRating }: { id: string; finalRating: number }) =>
      api.post(`/performance/reviews/${id}/rate`, { finalRating, status: 'completed' }),
    onSuccess: () => { toast.success('Review Completed', 'Performance review marked as complete.'); queryClient.invalidateQueries({ queryKey: ['performance'] }); },
    onError: (e: Error) => toast.error('Error', e.message),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Performance</h1>
          <p>Track and manage employee performance reviews</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.totalReviews}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          </div>
          <div>
            <div className="stat-value">{summary.averageRating}</div>
            <div className="stat-label">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="card">
        <div className="card-header">
          <h3>Performance Reviews</h3>
          <select className="input" style={{ width: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="self_review">Self Review</option>
            <option value="manager_review">Manager Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Type</th>
                <th>Period</th>
                <th>Rating</th>
                <th>Reviewer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>Loading...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>No performance reviews found.</td></tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{review.employee.firstName} {review.employee.lastName}</div>
                      <div className="text-xs text-tertiary">{review.employee.employeeNumber}</div>
                    </td>
                    <td className="text-sm">{review.employee.department?.name || '—'}</td>
                    <td className="text-sm" style={{ textTransform: 'capitalize' }}>{review.reviewType.replace('_', ' ')}</td>
                    <td className="font-mono text-sm">{review.period}</td>
                    <td>{renderStars(review.finalRating || review.reviewerRating)}</td>
                    <td className="text-sm">{review.reviewer.firstName} {review.reviewer.lastName}</td>
                    <td><span className={`badge ${statusConfig[review.status]?.class || 'badge-neutral'}`}>{statusConfig[review.status]?.label || review.status}</span></td>
                    <td>
                      {review.status !== 'completed' && (
                        <button className="btn btn-sm btn-primary" onClick={() => completeMutation.mutate({ id: review.id, finalRating: 4.0 })}>
                          Complete
                        </button>
                      )}
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
