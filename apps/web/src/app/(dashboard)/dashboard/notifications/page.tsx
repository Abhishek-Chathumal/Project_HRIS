'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/components/toast';

interface UserNotification {
  id: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: string;
    createdAt: string;
  };
}

const priorityConfig: Record<string, { class: string }> = {
  low: { class: 'badge-neutral' },
  normal: { class: 'badge-info' },
  high: { class: 'badge-warning' },
  urgent: { class: 'badge-danger' },
};

const typeIcons: Record<string, string> = {
  leave_request: '📋',
  approval_pending: '⏳',
  payslip_ready: '💰',
  system: '⚙️',
  announcement: '📢',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifData, isLoading } = useQuery<{ data: { data: UserNotification[]; unreadCount: number } }>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications'),
  });
  const notifications = notifData?.data?.data ?? [];
  const unreadCount = notifData?.data?.unreadCount ?? 0;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => { toast.success('All Read', 'All notifications marked as read.'); queryClient.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending}>
            Mark All Read
          </button>
        )}
      </div>

      <div className="card">
        {isLoading ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🔔</div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>No notifications</h3>
            <p className="text-secondary">When you have new notifications, they will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
                  padding: 'var(--space-4) var(--space-5)',
                  borderBottom: '1px solid var(--border-secondary)',
                  background: n.isRead ? 'transparent' : 'var(--accent-primary-light)',
                  cursor: n.isRead ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => { if (!n.isRead) markReadMutation.mutate(n.notification.id); }}
              >
                <div style={{ fontSize: '1.5rem', flexShrink: 0, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  {typeIcons[n.notification.type] || '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                    <h4 style={{ fontWeight: n.isRead ? 400 : 600, fontSize: '0.9375rem' }}>{n.notification.title}</h4>
                    <span className="text-xs text-tertiary">
                      {new Date(n.notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-2)' }}>{n.notification.message}</p>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <span className={`badge ${priorityConfig[n.notification.priority]?.class || 'badge-neutral'}`} style={{ fontSize: '0.6875rem' }}>
                      {n.notification.priority}
                    </span>
                    {!n.isRead && (
                      <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>New</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
