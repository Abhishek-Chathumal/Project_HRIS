'use client';

import { useState } from 'react';
import styles from './attendance.module.css';

interface AttendanceRecord {
    id: string;
    employeeName: string;
    employeeNumber: string;
    date: string;
    clockIn: string | null;
    clockOut: string | null;
    status: string;
    totalHours: number;
    overtime: number;
}

const statusConfig: Record<string, { label: string; class: string }> = {
    present: { label: 'Present', class: 'badge-success' },
    late: { label: 'Late', class: 'badge-warning' },
    absent: { label: 'Absent', class: 'badge-danger' },
    'half-day': { label: 'Half Day', class: 'badge-info' },
    leave: { label: 'On Leave', class: 'badge-neutral' },
    wfh: { label: 'WFH', class: 'badge-info' },
};

const mockAttendance: AttendanceRecord[] = [
    { id: '1', employeeName: 'Sarah Johnson', employeeNumber: 'EMP-002', date: '2026-02-23', clockIn: '08:55', clockOut: '17:05', status: 'present', totalHours: 8.17, overtime: 0.17 },
    { id: '2', employeeName: 'Michael Chen', employeeNumber: 'EMP-003', date: '2026-02-23', clockIn: '09:15', clockOut: '18:30', status: 'late', totalHours: 9.25, overtime: 1.25 },
    { id: '3', employeeName: 'Emily Williams', employeeNumber: 'EMP-004', date: '2026-02-23', clockIn: '08:45', clockOut: '17:00', status: 'present', totalHours: 8.25, overtime: 0.25 },
    { id: '4', employeeName: 'James Rodriguez', employeeNumber: 'EMP-005', date: '2026-02-23', clockIn: null, clockOut: null, status: 'absent', totalHours: 0, overtime: 0 },
    { id: '5', employeeName: 'Aiko Tanaka', employeeNumber: 'EMP-006', date: '2026-02-23', clockIn: '09:00', clockOut: '13:00', status: 'half-day', totalHours: 4, overtime: 0 },
    { id: '6', employeeName: 'David Kim', employeeNumber: 'EMP-007', date: '2026-02-23', clockIn: '08:30', clockOut: '16:30', status: 'present', totalHours: 8, overtime: 0 },
    { id: '7', employeeName: 'Lisa Patel', employeeNumber: 'EMP-008', date: '2026-02-23', clockIn: null, clockOut: null, status: 'leave', totalHours: 0, overtime: 0 },
    { id: '8', employeeName: 'System Administrator', employeeNumber: 'EMP-001', date: '2026-02-23', clockIn: '08:50', clockOut: null, status: 'present', totalHours: 0, overtime: 0 },
];

export default function AttendancePage() {
    const [selectedDate, setSelectedDate] = useState('2026-02-23');
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockTime, setClockTime] = useState<string | null>(null);

    const handleClockToggle = () => {
        const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        if (isClockedIn) {
            setIsClockedIn(false);
        } else {
            setClockTime(now);
            setIsClockedIn(true);
        }
    };

    const presentCount = mockAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    const absentCount = mockAttendance.filter((a) => a.status === 'absent').length;
    const lateCount = mockAttendance.filter((a) => a.status === 'late').length;
    const leaveCount = mockAttendance.filter((a) => a.status === 'leave').length;

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Attendance</h1>
                    <p>Track and manage employee attendance</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <input
                        type="date"
                        className="input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: 180 }}
                    />
                    <button className="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Export
                    </button>
                </div>
            </div>

            {/* Clock In/Out Card + Stats */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
                {/* Clock In/Out */}
                <div className={styles.clockCard}>
                    <div className={styles.clockTime}>
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className={styles.clockDate}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <button
                        className={`btn ${isClockedIn ? 'btn-danger' : 'btn-primary'} btn-lg`}
                        onClick={handleClockToggle}
                        style={{ width: '100%', marginTop: 'var(--space-4)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {isClockedIn ? 'Clock Out' : 'Clock In'}
                    </button>
                    {clockTime && (
                        <div className={styles.clockedAt}>
                            Clocked in at <strong>{clockTime}</strong>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                    <div>
                        <div className="stat-value">{presentCount}</div>
                        <div className="stat-label">Present Today</div>
                        <div className="stat-change" style={{ color: 'var(--success)' }}>{Math.round(presentCount / mockAttendance.length * 100)}% rate</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    </div>
                    <div>
                        <div className="stat-value">{absentCount}</div>
                        <div className="stat-label">Absent</div>
                        <div className="stat-change" style={{ color: 'var(--danger)' }}>{lateCount} late arrivals</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    </div>
                    <div>
                        <div className="stat-value">{leaveCount}</div>
                        <div className="stat-label">On Leave</div>
                        <div className="stat-change" style={{ color: 'var(--info)' }}>Approved absences</div>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="card">
                <div className="card-header">
                    <h3>Attendance Log — {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                </div>
                <div className="table-wrapper" style={{ border: 'none' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>ID</th>
                                <th>Clock In</th>
                                <th>Clock Out</th>
                                <th>Total Hours</th>
                                <th>Overtime</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockAttendance.map((record) => (
                                <tr key={record.id}>
                                    <td style={{ fontWeight: 500 }}>{record.employeeName}</td>
                                    <td><code className="font-mono text-sm">{record.employeeNumber}</code></td>
                                    <td>
                                        {record.clockIn ? (
                                            <span className="font-mono">{record.clockIn}</span>
                                        ) : (
                                            <span className="text-tertiary">—</span>
                                        )}
                                    </td>
                                    <td>
                                        {record.clockOut ? (
                                            <span className="font-mono">{record.clockOut}</span>
                                        ) : record.clockIn ? (
                                            <span className="badge badge-info">Active</span>
                                        ) : (
                                            <span className="text-tertiary">—</span>
                                        )}
                                    </td>
                                    <td>
                                        {record.totalHours > 0 ? (
                                            <span className="font-mono">{record.totalHours.toFixed(2)}h</span>
                                        ) : (
                                            <span className="text-tertiary">—</span>
                                        )}
                                    </td>
                                    <td>
                                        {record.overtime > 0 ? (
                                            <span className="font-mono" style={{ color: 'var(--warning)' }}>+{record.overtime.toFixed(2)}h</span>
                                        ) : (
                                            <span className="text-tertiary">—</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${statusConfig[record.status]?.class || 'badge-neutral'}`}>
                                            {statusConfig[record.status]?.label || record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
