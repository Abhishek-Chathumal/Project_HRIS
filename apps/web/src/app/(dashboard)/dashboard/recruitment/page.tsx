'use client';

import { useState } from 'react';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';
import styles from './recruitment.module.css';

const log = createLogger('RecruitmentPage');

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'open' | 'closed' | 'draft';
  applicants: number;
  shortlisted: number;
  postedDate: string;
  closingDate: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  position: string;
  stage: 'applied' | 'screening' | 'interview' | 'evaluation' | 'offer' | 'hired' | 'rejected';
  appliedDate: string;
  rating: number;
}

const mockJobs: JobPosting[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'full-time',
    status: 'open',
    applicants: 42,
    shortlisted: 8,
    postedDate: '2026-02-01',
    closingDate: '2026-03-15',
  },
  {
    id: '2',
    title: 'HR Business Partner',
    department: 'Human Resources',
    location: 'On-site',
    type: 'full-time',
    status: 'open',
    applicants: 23,
    shortlisted: 5,
    postedDate: '2026-02-10',
    closingDate: '2026-03-10',
  },
  {
    id: '3',
    title: 'Data Analyst',
    department: 'Finance',
    location: 'Hybrid',
    type: 'full-time',
    status: 'open',
    applicants: 56,
    shortlisted: 12,
    postedDate: '2026-01-20',
    closingDate: '2026-02-28',
  },
  {
    id: '4',
    title: 'Marketing Intern',
    department: 'Marketing',
    location: 'On-site',
    type: 'internship',
    status: 'open',
    applicants: 87,
    shortlisted: 6,
    postedDate: '2026-02-15',
    closingDate: '2026-04-01',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'contract',
    status: 'draft',
    applicants: 0,
    shortlisted: 0,
    postedDate: '',
    closingDate: '',
  },
  {
    id: '6',
    title: 'Sales Manager',
    department: 'Sales',
    location: 'On-site',
    type: 'full-time',
    status: 'closed',
    applicants: 38,
    shortlisted: 10,
    postedDate: '2025-12-01',
    closingDate: '2026-01-15',
  },
];

const mockApplicants: Applicant[] = [
  {
    id: '1',
    name: 'Alex Rivera',
    email: 'alex.r@email.com',
    position: 'Senior Frontend Developer',
    stage: 'interview',
    appliedDate: '2026-02-05',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Jordan Lee',
    email: 'jordan.l@email.com',
    position: 'Senior Frontend Developer',
    stage: 'screening',
    appliedDate: '2026-02-08',
    rating: 3.8,
  },
  {
    id: '3',
    name: 'Priya Sharma',
    email: 'priya.s@email.com',
    position: 'HR Business Partner',
    stage: 'evaluation',
    appliedDate: '2026-02-12',
    rating: 4.2,
  },
  {
    id: '4',
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    position: 'Data Analyst',
    stage: 'offer',
    appliedDate: '2026-01-25',
    rating: 4.8,
  },
  {
    id: '5',
    name: 'Sofia Chen',
    email: 'sofia.c@email.com',
    position: 'Senior Frontend Developer',
    stage: 'applied',
    appliedDate: '2026-02-20',
    rating: 0,
  },
  {
    id: '6',
    name: 'Tom Wilson',
    email: 'tom.w@email.com',
    position: 'Data Analyst',
    stage: 'rejected',
    appliedDate: '2026-01-28',
    rating: 2.1,
  },
];

const stages = ['applied', 'screening', 'interview', 'evaluation', 'offer', 'hired'];

const stageColors: Record<string, string> = {
  applied: '#94A3B8',
  screening: '#3B82F6',
  interview: '#8B5CF6',
  evaluation: '#F59E0B',
  offer: '#10B981',
  hired: '#059669',
  rejected: '#EF4444',
};

const statusConfig: Record<string, { label: string; class: string }> = {
  open: { label: 'Open', class: 'badge-success' },
  closed: { label: 'Closed', class: 'badge-neutral' },
  draft: { label: 'Draft', class: 'badge-warning' },
};

const typeLabels: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'pipeline'>('jobs');

  const openJobs = mockJobs.filter((j) => j.status === 'open').length;
  const totalApplicants = mockJobs.reduce((s, j) => s + j.applicants, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Recruitment</h1>
          <p>Manage job postings, applications, and hiring pipeline</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            log.info('PostNewJob', 'Creating new job posting');
            toast.info('Post New Job', 'Job posting form is opening.');
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
          Post New Job
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
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
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{openJobs}</div>
            <div className="stat-label">Open Positions</div>
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{totalApplicants}</div>
            <div className="stat-label">Total Applicants</div>
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
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div className="stat-value">
              {mockApplicants.filter((a) => a.stage === 'interview').length}
            </div>
            <div className="stat-label">Interviews Pending</div>
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div className="stat-value">
              {mockApplicants.filter((a) => a.stage === 'offer').length}
            </div>
            <div className="stat-label">Offers Extended</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'jobs' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Job Postings
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'pipeline' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          Hiring Pipeline
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="card">
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Applicants</th>
                  <th>Shortlisted</th>
                  <th>Status</th>
                  <th>Closing</th>
                </tr>
              </thead>
              <tbody>
                {mockJobs.map((job) => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 500 }}>{job.title}</td>
                    <td className="text-sm">{job.department}</td>
                    <td className="text-sm">{job.location}</td>
                    <td>
                      <span className="badge badge-info">{typeLabels[job.type]}</span>
                    </td>
                    <td className="font-mono">{job.applicants}</td>
                    <td className="font-mono">{job.shortlisted}</td>
                    <td>
                      <span className={`badge ${statusConfig[job.status]?.class}`}>
                        {statusConfig[job.status]?.label}
                      </span>
                    </td>
                    <td className="text-sm text-secondary">
                      {job.closingDate
                        ? new Date(job.closingDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pipeline Tab — Kanban */}
      {activeTab === 'pipeline' && (
        <div className={styles.pipeline}>
          {stages.map((stage) => {
            const items = mockApplicants.filter((a) => a.stage === stage);
            return (
              <div key={stage} className={styles.pipelineColumn}>
                <div className={styles.columnHeader}>
                  <div className={styles.columnDot} style={{ background: stageColors[stage] }} />
                  <span className={styles.columnTitle}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </span>
                  <span className={styles.columnCount}>{items.length}</span>
                </div>
                <div className={styles.columnCards}>
                  {items.map((applicant) => (
                    <div key={applicant.id} className={styles.applicantCard}>
                      <div style={{ fontWeight: 500, marginBottom: 'var(--space-1)' }}>
                        {applicant.name}
                      </div>
                      <div
                        className="text-xs text-secondary"
                        style={{ marginBottom: 'var(--space-2)' }}
                      >
                        {applicant.position}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span className="text-xs text-tertiary">
                          {new Date(applicant.appliedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {applicant.rating > 0 && (
                          <span className="text-xs font-mono" style={{ color: 'var(--warning)' }}>
                            ★ {applicant.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className={styles.emptyColumn}>No candidates</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
