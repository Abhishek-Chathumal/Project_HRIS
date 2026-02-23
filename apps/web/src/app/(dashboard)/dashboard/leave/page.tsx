'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';
import styles from './leave.module.css';

const log = createLogger('LeavePage');

interface LeaveType {
  id: string;
  name: string;
  code: string;
  color: string;
  defaultDays: number;
  isPaid: boolean;
  allowHalfDay: boolean;
}

interface LeaveBalanceItem {
  id: string;
  year: number;
  entitled: number;
  used: number;
  pending: number;
  carriedOver: number;
  adjusted: number;
  leaveType: { name: string; code: string; color: string; isPaid: boolean };
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  isHalfDay: boolean;
  createdAt: string;
  employee: { firstName: string; lastName: string; employeeNumber: string };
  leaveType: { name: string; code: string; color: string };
  approver?: { firstName: string; lastName: string };
}

interface PaginatedRequests {
  data: LeaveRequest[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'badge-warning' },
  approved: { label: 'Approved', class: 'badge-success' },
  rejected: { label: 'Rejected', class: 'badge-danger' },
  cancelled: { label: 'Cancelled', class: 'badge-neutral' },
};

export default function LeavePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'my-balance' | 'requests' | 'approvals'>('my-balance');
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Apply form state
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState('');

  // Fetch leave types
  const { data: leaveTypesData } = useQuery<{ data: LeaveType[] }>({
    queryKey: ['leave', 'types'],
    queryFn: () => api.get('/leave/types'),
  });
  const leaveTypes = leaveTypesData?.data ?? [];

  // Fetch leave balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery<{ data: LeaveBalanceItem[] }>({
    queryKey: ['leave', 'balance'],
    queryFn: () => api.get('/leave/balance'),
  });
  const balances = balanceData?.data ?? [];

  // Fetch my leave requests
  const { data: myRequestsData, isLoading: requestsLoading } = useQuery<{
    data: PaginatedRequests;
  }>({
    queryKey: ['leave', 'my-requests'],
    queryFn: () => api.get('/leave/my-requests'),
    enabled: activeTab === 'requests',
  });
  const myRequests = myRequestsData?.data?.data ?? [];

  // Fetch pending approvals (admin/manager)
  const { data: pendingData, isLoading: approvalsLoading } = useQuery<{ data: PaginatedRequests }>({
    queryKey: ['leave', 'pending-approvals'],
    queryFn: () => api.get('/leave/pending-approvals'),
    enabled: activeTab === 'approvals',
  });
  const pendingApprovals = pendingData?.data?.data ?? [];

  // Apply leave mutation
  const applyMutation = useMutation({
    mutationFn: (data: {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason?: string;
      isHalfDay?: boolean;
      halfDayType?: string;
    }) => {
      log.info('Apply', 'Applying for leave', data);
      return api.post('/leave/apply', data);
    },
    onSuccess: () => {
      toast.success('Leave Request Submitted', 'Your leave request has been sent for approval.');
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      resetForm();
    },
    onError: (err: Error) => {
      toast.error('Application Failed', err.message);
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (requestId: string) => {
      log.info('Approve', 'Approving leave', { requestId });
      return api.post(`/leave/${requestId}/approve`);
    },
    onSuccess: () => {
      toast.success('Leave Approved', 'The leave request has been approved.');
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
    onError: (err: Error) => {
      toast.error('Approval Failed', err.message);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => {
      log.info('Reject', 'Rejecting leave', { requestId });
      return api.post(`/leave/${requestId}/reject`, { reason: 'Request not approved by manager' });
    },
    onSuccess: () => {
      toast.warning('Leave Rejected', 'The leave request has been rejected.');
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
    onError: (err: Error) => {
      toast.error('Rejection Failed', err.message);
    },
  });

  const resetForm = () => {
    setShowApplyForm(false);
    setLeaveTypeId('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setIsHalfDay(false);
    setHalfDayType('');
  };

  const handleSubmitLeave = () => {
    if (!leaveTypeId || !startDate || !endDate) {
      toast.error('Missing Fields', 'Please fill in leave type, start date, and end date.');
      return;
    }
    applyMutation.mutate({
      leaveTypeId,
      startDate,
      endDate,
      reason,
      isHalfDay: isHalfDay || undefined,
      halfDayType: halfDayType || undefined,
    });
  };

  const getAvailable = (b: LeaveBalanceItem) =>
    Number(b.entitled) +
    Number(b.carriedOver) +
    Number(b.adjusted) -
    Number(b.used) -
    Number(b.pending);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Leave Management</h1>
          <p>View balances, apply for leave, and manage requests</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowApplyForm(!showApplyForm);
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Apply for Leave
        </button>
      </div>

      {/* Apply Form */}
      {showApplyForm && (
        <div className={styles.applyCard}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>New Leave Request</h3>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className="label">Leave Type</label>
              <select
                className="input"
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((lt) => {
                  const bal = balances.find((b) => b.leaveType.code === lt.code);
                  const avail = bal ? getAvailable(bal) : Number(lt.defaultDays);
                  return (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} ({avail} days available)
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={styles.formField}>
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label className="label">End Date</label>
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
            <div className={styles.formField}>
              <label className="label">Half Day</label>
              <select
                className="input"
                value={isHalfDay ? halfDayType || 'first' : ''}
                onChange={(e) => {
                  setIsHalfDay(!!e.target.value);
                  setHalfDayType(e.target.value);
                }}
              >
                <option value="">No</option>
                <option value="first">First Half</option>
                <option value="second">Second Half</option>
              </select>
            </div>
          </div>
          <div className={styles.formField} style={{ marginTop: 'var(--space-4)' }}>
            <label className="label">Reason</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Briefly describe the reason for leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-4)',
              justifyContent: 'flex-end',
            }}
          >
            <button className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmitLeave}
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'my-balance' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('my-balance')}
        >
          My Balance
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Leave Requests
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'approvals' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          Pending Approvals
          {pendingApprovals.length > 0 && (
            <span className={styles.tabBadge}>{pendingApprovals.length}</span>
          )}
        </button>
      </div>

      {/* My Balance Tab */}
      {activeTab === 'my-balance' && (
        <div className={styles.balanceGrid}>
          {balanceLoading ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: 'var(--space-6)',
                color: 'var(--text-secondary)',
              }}
            >
              Loading leave balances...
            </div>
          ) : balances.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: 'var(--space-6)',
                color: 'var(--text-secondary)',
              }}
            >
              No leave balances found. Leave balances are set up by your HR administrator.
            </div>
          ) : (
            balances.map((balance) => {
              const available = getAvailable(balance);
              const total =
                Number(balance.entitled) + Number(balance.carriedOver) + Number(balance.adjusted);
              return (
                <div key={balance.id} className={styles.balanceCard}>
                  <div className={styles.balanceHeader}>
                    <div
                      className={styles.balanceDot}
                      style={{ background: balance.leaveType.color || '#3B82F6' }}
                    />
                    <span className={styles.balanceType}>{balance.leaveType.name}</span>
                    <span className={styles.balanceCode}>{balance.leaveType.code}</span>
                  </div>
                  <div className={styles.balanceStats}>
                    <div className={styles.balanceMain}>
                      <span className={styles.balanceValue}>{available}</span>
                      <span className={styles.balanceLabel}>Available</span>
                    </div>
                    <div className={styles.balanceBreakdown}>
                      <div>
                        <span className="text-tertiary">Total:</span> <strong>{total}</strong>
                      </div>
                      <div>
                        <span className="text-tertiary">Used:</span>{' '}
                        <strong>{Number(balance.used)}</strong>
                      </div>
                      <div>
                        <span className="text-tertiary">Pending:</span>{' '}
                        <strong>{Number(balance.pending)}</strong>
                      </div>
                    </div>
                  </div>
                  <div className={styles.balanceBar}>
                    <div
                      className={styles.balanceBarFill}
                      style={{
                        width: `${total > 0 ? (Number(balance.used) / total) * 100 : 0}%`,
                        background: balance.leaveType.color || '#3B82F6',
                      }}
                    />
                    <div
                      className={styles.balanceBarPending}
                      style={{
                        width: `${total > 0 ? (Number(balance.pending) / total) * 100 : 0}%`,
                        background: balance.leaveType.color || '#3B82F6',
                        opacity: 0.3,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Leave Requests Tab */}
      {activeTab === 'requests' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requestsLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: 'center',
                        padding: 'var(--space-6)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : myRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: 'center',
                        padding: 'var(--space-6)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      No leave requests found. Apply for leave to get started.
                    </td>
                  </tr>
                ) : (
                  myRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 'var(--radius-full)',
                              background: req.leaveType.color,
                            }}
                          />
                          {req.leaveType.name}
                        </div>
                      </td>
                      <td className="text-sm">
                        {new Date(req.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {req.startDate !== req.endDate && (
                          <>
                            {' '}
                            —{' '}
                            {new Date(req.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </>
                        )}
                        {req.isHalfDay && (
                          <span
                            className="badge badge-info"
                            style={{ marginLeft: 'var(--space-2)', fontSize: '0.625rem' }}
                          >
                            Half
                          </span>
                        )}
                      </td>
                      <td className="font-mono">{Number(req.totalDays)}</td>
                      <td
                        className="text-sm text-secondary"
                        style={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {req.reason || '—'}
                      </td>
                      <td className="text-sm text-secondary">
                        {new Date(req.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        <span
                          className={`badge ${statusConfig[req.status]?.class || 'badge-neutral'}`}
                        >
                          {statusConfig[req.status]?.label || req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvalsLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: 'center',
                        padding: 'var(--space-6)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : pendingApprovals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: 'center',
                        padding: 'var(--space-6)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      No pending leave requests to review.
                    </td>
                  </tr>
                ) : (
                  pendingApprovals.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {req.employee.firstName} {req.employee.lastName}
                          </div>
                          <div className="text-xs text-tertiary">{req.employee.employeeNumber}</div>
                        </div>
                      </td>
                      <td>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 'var(--radius-full)',
                              background: req.leaveType.color,
                            }}
                          />
                          {req.leaveType.name}
                        </div>
                      </td>
                      <td className="text-sm">
                        {new Date(req.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {req.startDate !== req.endDate && (
                          <>
                            {' '}
                            —{' '}
                            {new Date(req.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </>
                        )}
                      </td>
                      <td className="font-mono">{Number(req.totalDays)}</td>
                      <td
                        className="text-sm text-secondary"
                        style={{
                          maxWidth: 180,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {req.reason || '—'}
                      </td>
                      <td>
                        <span className={`badge ${statusConfig[req.status]?.class}`}>
                          {statusConfig[req.status]?.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--success)', color: '#fff', border: 'none' }}
                            onClick={() => approveMutation.mutate(req.id)}
                            disabled={approveMutation.isPending}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => rejectMutation.mutate(req.id)}
                            disabled={rejectMutation.isPending}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
