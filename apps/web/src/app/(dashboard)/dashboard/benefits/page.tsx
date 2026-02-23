'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export default function BenefitsPage() {
  const { data: statsData } = useQuery<{ data: { totalEmployees: number; activeEmployees: number } }>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/employees/dashboard-stats'),
  });
  const totalActive = statsData?.data?.activeEmployees ?? 0;

  const benefitsPlans = [
    { name: 'Health Insurance', category: 'Healthcare', provider: 'National Insurance Trust', enrolled: Math.round(totalActive * 0.92), cost: '$450/mo', icon: '🏥', status: 'active' },
    { name: 'Dental Plan', category: 'Healthcare', provider: 'DentalFirst', enrolled: Math.round(totalActive * 0.78), cost: '$65/mo', icon: '🦷', status: 'active' },
    { name: 'Vision Plan', category: 'Healthcare', provider: 'EyeCare Plus', enrolled: Math.round(totalActive * 0.45), cost: '$25/mo', icon: '👁️', status: 'active' },
    { name: 'EPF Contribution', category: 'Retirement', provider: 'EPF Board', enrolled: totalActive, cost: '8% Basic', icon: '🏛️', status: 'active' },
    { name: 'ETF Contribution', category: 'Retirement', provider: 'ETF Board', enrolled: totalActive, cost: '3% Basic', icon: '📊', status: 'active' },
    { name: 'Life Insurance', category: 'Insurance', provider: 'LifeGuard Insurance', enrolled: Math.round(totalActive * 0.65), cost: '$35/mo', icon: '🛡️', status: 'active' },
    { name: 'Meal Allowance', category: 'Allowance', provider: 'Internal', enrolled: totalActive, cost: '3% Basic', icon: '🍽️', status: 'active' },
    { name: 'Transport Allowance', category: 'Allowance', provider: 'Internal', enrolled: totalActive, cost: '5% Basic', icon: '🚌', status: 'active' },
  ];

  const categories = [...new Set(benefitsPlans.map(b => b.category))];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Benefits</h1>
          <p>Employee benefits and compensation packages</p>
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div>
            <div className="stat-value">{benefitsPlans.length}</div>
            <div className="stat-label">Active Plans</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          </div>
          <div>
            <div className="stat-value">{totalActive}</div>
            <div className="stat-label">Eligible Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
          </div>
          <div>
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div>
            <div className="stat-value">100%</div>
            <div className="stat-label">Compliance</div>
          </div>
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-3)', fontSize: '1rem', color: 'var(--text-secondary)' }}>{cat}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {benefitsPlans.filter(b => b.category === cat).map(plan => (
              <div key={plan.name} className="card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: '1.5rem' }}>{plan.icon}</span>
                    <div>
                      <h4 style={{ fontWeight: 600 }}>{plan.name}</h4>
                      <span className="text-xs text-tertiary">{plan.provider}</span>
                    </div>
                  </div>
                  <span className="badge badge-success">{plan.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <span>{plan.enrolled} enrolled</span>
                  <span className="font-mono" style={{ fontWeight: 500 }}>{plan.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
