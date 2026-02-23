'use client';

import { useState } from 'react';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';

const log = createLogger('BenefitsPage');

interface BenefitPlan {
  id: string;
  name: string;
  category: 'health' | 'retirement' | 'insurance' | 'wellness' | 'financial';
  provider: string;
  description: string;
  enrolledCount: number;
  eligibleCount: number;
  monthlyCost: number;
  employerContribution: number;
  status: 'active' | 'pending' | 'expired';
}

const categoryConfig: Record<string, { label: string; color: string; icon: string }> = {
  health: { label: 'Health & Medical', color: '#EF4444', icon: '❤' },
  retirement: { label: 'Retirement', color: '#8B5CF6', icon: '🏦' },
  insurance: { label: 'Life Insurance', color: '#3B82F6', icon: '🛡' },
  wellness: { label: 'Wellness', color: '#10B981', icon: '🧘' },
  financial: { label: 'Financial', color: '#F59E0B', icon: '💰' },
};

const mockPlans: BenefitPlan[] = [
  {
    id: '1',
    name: 'Premium Health Plan',
    category: 'health',
    provider: 'BlueCross Shield',
    description: 'Comprehensive medical, dental, and vision coverage with low deductibles.',
    enrolledCount: 42,
    eligibleCount: 50,
    monthlyCost: 580,
    employerContribution: 75,
    status: 'active',
  },
  {
    id: '2',
    name: 'Basic Health Plan',
    category: 'health',
    provider: 'BlueCross Shield',
    description: 'Essential medical coverage with standard deductibles for employees.',
    enrolledCount: 8,
    eligibleCount: 50,
    monthlyCost: 320,
    employerContribution: 60,
    status: 'active',
  },
  {
    id: '3',
    name: '401(k) Retirement Plan',
    category: 'retirement',
    provider: 'Fidelity',
    description: '6% company matching. Fully vested after 3 years of service.',
    enrolledCount: 38,
    eligibleCount: 45,
    monthlyCost: 0,
    employerContribution: 100,
    status: 'active',
  },
  {
    id: '4',
    name: 'Group Life Insurance',
    category: 'insurance',
    provider: 'MetLife',
    description: '2x annual salary coverage. Optional supplemental coverage available.',
    enrolledCount: 50,
    eligibleCount: 50,
    monthlyCost: 45,
    employerContribution: 100,
    status: 'active',
  },
  {
    id: '5',
    name: 'Wellness Program',
    category: 'wellness',
    provider: 'Internal',
    description: 'Gym membership, mental health counseling, and wellness app subscriptions.',
    enrolledCount: 28,
    eligibleCount: 50,
    monthlyCost: 50,
    employerContribution: 80,
    status: 'active',
  },
  {
    id: '6',
    name: 'Employee Stock Purchase',
    category: 'financial',
    provider: 'Company',
    description: 'Purchase company stock at 15% discount. Semi-annual purchase periods.',
    enrolledCount: 15,
    eligibleCount: 40,
    monthlyCost: 0,
    employerContribution: 0,
    status: 'active',
  },
];

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function BenefitsPage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const categories = Object.keys(categoryConfig);
  const filtered = categoryFilter
    ? mockPlans.filter((p) => p.category === categoryFilter)
    : mockPlans;

  const totalMonthly = mockPlans.reduce((s, p) => s + p.monthlyCost * p.enrolledCount, 0);
  const enrollmentRate = Math.round(
    (mockPlans.reduce((s, p) => s + p.enrolledCount, 0) /
      mockPlans.reduce((s, p) => s + p.eligibleCount, 0)) *
      100,
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Benefits</h1>
          <p>Employee benefits, insurance, and welfare programs</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            log.info('AddPlan', 'Opening new benefit plan form');
            toast.info('Add Plan', 'Benefit plan creation form is opening.');
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
          Add Plan
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
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{mockPlans.length}</div>
            <div className="stat-label">Active Plans</div>
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
            </svg>
          </div>
          <div>
            <div className="stat-value">{enrollmentRate}%</div>
            <div className="stat-label">Enrollment Rate</div>
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
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{fmt(totalMonthly)}</div>
            <div className="stat-label">Monthly Cost</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: 'var(--info-light)', color: 'var(--info)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <button
          className={`btn btn-sm ${!categoryFilter ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setCategoryFilter('')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {categoryConfig[cat].icon} {categoryConfig[cat].label}
          </button>
        ))}
      </div>

      {/* Benefit Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {filtered.map((plan) => (
          <div key={plan.id} className="card">
            <div className="card-body">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.25rem' }}>{categoryConfig[plan.category]?.icon}</span>
                  <span className="text-xs text-secondary">
                    {categoryConfig[plan.category]?.label}
                  </span>
                </div>
                <span className="badge badge-success">Active</span>
              </div>

              <h4 style={{ marginBottom: 'var(--space-1)' }}>{plan.name}</h4>
              <p className="text-xs text-tertiary" style={{ marginBottom: 'var(--space-2)' }}>
                by {plan.provider}
              </p>
              <p
                className="text-sm text-secondary"
                style={{ marginBottom: 'var(--space-4)', lineHeight: 1.5 }}
              >
                {plan.description}
              </p>

              {/* Enrollment */}
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  <span className="text-xs text-secondary">Enrolled</span>
                  <span className="text-xs font-mono">
                    {plan.enrolledCount}/{plan.eligibleCount}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(plan.enrolledCount / plan.eligibleCount) * 100}%`,
                      background: categoryConfig[plan.category]?.color || 'var(--accent-primary)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--border-secondary)',
                  fontSize: '0.75rem',
                }}
              >
                {plan.monthlyCost > 0 ? (
                  <span className="text-secondary">{fmt(plan.monthlyCost)}/mo</span>
                ) : (
                  <span className="text-secondary">No cost</span>
                )}
                {plan.employerContribution > 0 && (
                  <span style={{ color: 'var(--success)' }}>
                    Employer: {plan.employerContribution}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
