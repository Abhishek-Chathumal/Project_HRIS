'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';
import styles from './attendance.module.css';

const log = createLogger('AttendancePage');

interface ClockStatus {
  isClockedIn: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  workMinutes: number;
  status: string | null;
}

interface AttendanceRecord {
  id: string;
  clockIn: string | null;
  clockOut: string | null;
  workMinutes: number | null;
  overtimeMinutes: number | null;
  status: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department?: { name: string };
  };
}

interface TodayData {
  records: AttendanceRecord[];
  stats: {
    totalActive: number;
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    onLeave: number;
    attendanceRate: number;
  };
}

const statusConfig: Record<string, { label: string; class: string }> = {
  present: { label: 'Present', class: 'badge-success' },
  late: { label: 'Late', class: 'badge-warning' },
  absent: { label: 'Absent', class: 'badge-danger' },
  'half-day': { label: 'Half Day', class: 'badge-info' },
  leave: { label: 'On Leave', class: 'badge-neutral' },
  wfh: { label: 'WFH', class: 'badge-info' },
};

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [liveTime, setLiveTime] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch current user's clock status
  const { data: clockStatus } = useQuery<{ data: ClockStatus }>({
    queryKey: ['attendance', 'my-status'],
    queryFn: () => api.get('/attendance/my-status'),
    refetchInterval: 30000,
  });

  const myStatus = clockStatus?.data;
  const isClockedIn = myStatus?.isClockedIn ?? false;

  // Live elapsed timer when clocked in
  useEffect(() => {
    if (!isClockedIn || !myStatus?.clockInTime) {
      setElapsedSeconds(0);
      return;
    }
    const updateElapsed = () => {
      const clockIn = new Date(myStatus.clockInTime!).getTime();
      setElapsedSeconds(Math.floor((Date.now() - clockIn) / 1000));
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [isClockedIn, myStatus?.clockInTime]);

  // Fetch today's attendance for all employees (admin view)
  const { data: todayData, isLoading } = useQuery<{ data: TodayData }>({
    queryKey: ['attendance', 'today'],
    queryFn: () => api.get('/attendance/today'),
    refetchInterval: 60000,
  });

  const today = todayData?.data;
  const records = today?.records ?? [];
  const stats = today?.stats ?? {
    totalActive: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    onLeave: 0,
    attendanceRate: 0,
  };

  // Clock In mutation
  const clockInMutation = useMutation({
    mutationFn: () => {
      log.info('ClockIn', 'Clocking in...');
      return api.post('/attendance/clock-in');
    },
    onSuccess: () => {
      toast.success(
        'Clocked In',
        `You have clocked in at ${liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. Have a productive day!`,
      );
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: Error) => {
      toast.error('Clock In Failed', err.message);
    },
  });

  // Clock Out mutation
  const clockOutMutation = useMutation({
    mutationFn: () => {
      log.info('ClockOut', 'Clocking out...');
      return api.post('/attendance/clock-out');
    },
    onSuccess: () => {
      toast.success('Clocked Out', `You have clocked out. Total session recorded.`);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: Error) => {
      toast.error('Clock Out Failed', err.message);
    },
  });

  const handleClockToggle = () => {
    if (isClockedIn) {
      clockOutMutation.mutate();
    } else {
      clockInMutation.mutate();
    }
  };

  const isClockLoading = clockInMutation.isPending || clockOutMutation.isPending;

  // Format elapsed time
  const elapsedHours = Math.floor(elapsedSeconds / 3600);
  const elapsedMins = Math.floor((elapsedSeconds % 3600) / 60);
  const elapsedSecs = elapsedSeconds % 60;
  const elapsedDisplay = `${elapsedHours.toString().padStart(2, '0')}:${elapsedMins.toString().padStart(2, '0')}:${elapsedSecs.toString().padStart(2, '0')}`;

  // CSV export
  const handleExport = () => {
    const headers = [
      'Employee',
      'ID',
      'Department',
      'Clock In',
      'Clock Out',
      'Hours',
      'Overtime',
      'Status',
    ];
    const rows = records.map((r) => [
      `${r.employee.firstName} ${r.employee.lastName}`,
      r.employee.employeeNumber,
      r.employee.department?.name || '',
      formatTime(r.clockIn),
      formatTime(r.clockOut),
      r.workMinutes ? (r.workMinutes / 60).toFixed(2) : '0',
      r.overtimeMinutes ? (r.overtimeMinutes / 60).toFixed(2) : '0',
      statusConfig[r.status]?.label || r.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Export Complete', `${records.length} records exported.`);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>Track and manage employee attendance</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Clock In/Out Card + Stats */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Clock In/Out */}
        <div className={styles.clockCard}>
          <div className={styles.clockTime}>
            {liveTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
          <div className={styles.clockDate}>
            {liveTime.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>

          {/* Live elapsed timer when clocked in */}
          {isClockedIn && (
            <div className={styles.elapsedTimer}>
              <span className={styles.elapsedLabel}>Session Duration</span>
              <span className={styles.elapsedTime}>{elapsedDisplay}</span>
            </div>
          )}

          <button
            className={`btn ${isClockedIn ? 'btn-danger' : 'btn-primary'} btn-lg`}
            onClick={handleClockToggle}
            disabled={isClockLoading || !!myStatus?.clockOutTime}
            style={{ width: '100%', marginTop: 'var(--space-4)' }}
          >
            {isClockLoading ? (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Processing...
              </span>
            ) : myStatus?.clockOutTime ? (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Day Complete
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {isClockedIn ? 'Clock Out' : 'Clock In'}
              </>
            )}
          </button>

          {myStatus?.clockInTime && (
            <div className={styles.clockedAt}>
              Clocked in at <strong>{formatTime(myStatus.clockInTime)}</strong>
              {myStatus.clockOutTime && (
                <>
                  {' '}
                  · Out at <strong>{formatTime(myStatus.clockOutTime)}</strong>
                </>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
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
            <div className="stat-value">{stats.present}</div>
            <div className="stat-label">Present Today</div>
            <div className="stat-change" style={{ color: 'var(--success)' }}>
              {stats.attendanceRate}% rate
            </div>
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
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{stats.absent}</div>
            <div className="stat-label">Absent</div>
            <div className="stat-change" style={{ color: 'var(--danger)' }}>
              {stats.late} late arrivals
            </div>
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
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <div className="stat-value">{stats.onLeave}</div>
            <div className="stat-label">On Leave</div>
            <div className="stat-change" style={{ color: 'var(--info)' }}>
              Approved absences
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <div className="card-header">
          <h3>
            Today&apos;s Attendance —{' '}
            {liveTime.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <span className="text-sm text-secondary">
            {isLoading
              ? 'Loading...'
              : `${records.length} of ${stats.totalActive} employees recorded`}
          </span>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Total Hours</th>
                <th>Overtime</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: 'center',
                      padding: 'var(--space-6)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Loading attendance records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: 'center',
                      padding: 'var(--space-6)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    No attendance records for today yet. Be the first to clock in!
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    <td style={{ fontWeight: 500 }}>
                      {record.employee.firstName} {record.employee.lastName}
                    </td>
                    <td>
                      <code className="font-mono text-sm">{record.employee.employeeNumber}</code>
                    </td>
                    <td className="text-sm">{record.employee.department?.name || '—'}</td>
                    <td>
                      {record.clockIn ? (
                        <span className="font-mono">{formatTime(record.clockIn)}</span>
                      ) : (
                        <span className="text-tertiary">—</span>
                      )}
                    </td>
                    <td>
                      {record.clockOut ? (
                        <span className="font-mono">{formatTime(record.clockOut)}</span>
                      ) : record.clockIn ? (
                        <span className="badge badge-info">Active</span>
                      ) : (
                        <span className="text-tertiary">—</span>
                      )}
                    </td>
                    <td>
                      {record.workMinutes && record.workMinutes > 0 ? (
                        <span className="font-mono">{formatDuration(record.workMinutes)}</span>
                      ) : record.clockIn && !record.clockOut ? (
                        <span className="font-mono text-secondary">In progress</span>
                      ) : (
                        <span className="text-tertiary">—</span>
                      )}
                    </td>
                    <td>
                      {record.overtimeMinutes && record.overtimeMinutes > 0 ? (
                        <span className="font-mono" style={{ color: 'var(--warning)' }}>
                          +{formatDuration(record.overtimeMinutes)}
                        </span>
                      ) : (
                        <span className="text-tertiary">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${statusConfig[record.status]?.class || 'badge-neutral'}`}
                      >
                        {statusConfig[record.status]?.label || record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  );
}
