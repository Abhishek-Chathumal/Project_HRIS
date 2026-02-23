'use client';

import { useState } from 'react';
import styles from './notifications.module.css';

interface NotificationItem {
    id: string;
    type: 'leave' | 'attendance' | 'payroll' | 'system' | 'performance' | 'policy';
    title: string;
    message: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    isRead: boolean;
    timestamp: string;
    actionUrl?: string;
    sender?: string;
}

const mockNotifications: NotificationItem[] = [
    { id: '1', type: 'leave', title: 'Leave Request Pending Approval', message: 'Sarah Johnson has requested 3 days annual leave (Mar 5-7). Please review and approve.', priority: 'high', isRead: false, timestamp: '2026-02-23T05:30:00', sender: 'Sarah Johnson', actionUrl: '/dashboard/leave' },
    { id: '2', type: 'attendance', title: 'Late Arrival Alert', message: 'David Kim arrived 45 minutes late today. This is the 3rd occurrence this month.', priority: 'normal', isRead: false, timestamp: '2026-02-23T04:15:00', sender: 'System', actionUrl: '/dashboard/attendance' },
    { id: '3', type: 'payroll', title: 'Payroll Processing Complete', message: 'February 2026 payroll has been processed. 7 payslips generated totaling $48,470 net.', priority: 'normal', isRead: false, timestamp: '2026-02-22T18:00:00', sender: 'Payroll System' },
    { id: '4', type: 'system', title: 'LDAP Sync Completed', message: 'Directory sync completed successfully. 42 users synchronized, 2 new users provisioned.', priority: 'low', isRead: true, timestamp: '2026-02-22T14:30:00', sender: 'System' },
    { id: '5', type: 'performance', title: 'Review Cycle Approaching', message: 'Q1 2026 performance review cycle starts in 7 days. Ensure all goals are updated.', priority: 'high', isRead: true, timestamp: '2026-02-21T09:00:00', sender: 'HR Department' },
    { id: '6', type: 'policy', title: 'New Policy Published', message: 'Updated Remote Work Policy v3 is now active. All employees must acknowledge by March 15.', priority: 'urgent', isRead: false, timestamp: '2026-02-20T16:45:00', sender: 'Policy Engine' },
    { id: '7', type: 'leave', title: 'Leave Request Approved', message: 'Your annual leave request for Feb 28 - Mar 1 has been approved by your manager.', priority: 'normal', isRead: true, timestamp: '2026-02-20T10:30:00', sender: 'Michael Chen' },
    { id: '8', type: 'system', title: 'Scheduled Maintenance', message: 'System maintenance window: Saturday Feb 25, 2:00 AM - 4:00 AM UTC. Brief downtime expected.', priority: 'low', isRead: true, timestamp: '2026-02-19T12:00:00', sender: 'DevOps' },
];

const typeConfig: Record<string, { icon: string; color: string }> = {
    leave: { icon: '🏖', color: '#10B981' },
    attendance: { icon: '🕐', color: '#3B82F6' },
    payroll: { icon: '💰', color: '#8B5CF6' },
    system: { icon: '⚙️', color: '#6B7280' },
    performance: { icon: '📊', color: '#F59E0B' },
    policy: { icon: '📋', color: '#EF4444' },
};

const priorityConfig: Record<string, { label: string; class: string }> = {
    low: { label: 'Low', class: 'badge-neutral' },
    normal: { label: 'Normal', class: 'badge-info' },
    high: { label: 'High', class: 'badge-warning' },
    urgent: { label: 'Urgent', class: 'badge-danger' },
};

export default function NotificationsPage() {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [typeFilter, setTypeFilter] = useState('');
    const [notifications, setNotifications] = useState(mockNotifications);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const filtered = notifications
        .filter((n) => filter === 'all' || !n.isRead)
        .filter((n) => !typeFilter || n.type === typeFilter);

    const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const toggleRead = (id: string) =>
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)));

    const timeAgo = (ts: string) => {
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Notifications</h1>
                    <p>Stay updated on important HR events and actions</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {unreadCount > 0 && (
                        <button className="btn btn-secondary" onClick={markAllRead}>
                            ✓ Mark All Read ({unreadCount})
                        </button>
                    )}
                    <button className="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" /></svg>
                        Preferences
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>All</button>
                    <button className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('unread')}>
                        Unread {unreadCount > 0 && <span className={styles.countBadge}>{unreadCount}</span>}
                    </button>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button className={`btn btn-sm ${!typeFilter ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTypeFilter('')}>All Types</button>
                    {Object.entries(typeConfig).map(([key, cfg]) => (
                        <button key={key} className={`btn btn-sm ${typeFilter === key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTypeFilter(key)}>
                            {cfg.icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {filtered.map((notif) => (
                    <div key={notif.id} className={`${styles.notifCard} ${!notif.isRead ? styles.unread : ''}`} onClick={() => toggleRead(notif.id)}>
                        <div className={styles.notifIcon} style={{ background: `${typeConfig[notif.type]?.color}20`, color: typeConfig[notif.type]?.color }}>
                            {typeConfig[notif.type]?.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                                <span style={{ fontWeight: notif.isRead ? 400 : 600, fontSize: '0.875rem' }}>{notif.title}</span>
                                {notif.priority !== 'normal' && (
                                    <span className={`badge ${priorityConfig[notif.priority]?.class}`} style={{ fontSize: '0.625rem' }}>
                                        {priorityConfig[notif.priority]?.label}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-secondary" style={{ lineHeight: 1.5, marginBottom: 'var(--space-1)' }}>{notif.message}</p>
                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                {notif.sender && <span className="text-xs text-tertiary">From: {notif.sender}</span>}
                                <span className="text-xs text-tertiary">{timeAgo(notif.timestamp)}</span>
                            </div>
                        </div>
                        {!notif.isRead && <div className={styles.unreadDot} />}
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🔔</div>
                        <p className="text-secondary">No notifications to show</p>
                    </div>
                )}
            </div>
        </div>
    );
}
