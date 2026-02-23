'use client';

import { useState } from 'react';
import { toast } from '@/components/toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'appearance'>('general');

  const [general, setGeneral] = useState({
    companyName: 'Acme Corporation', timezone: 'Asia/Colombo', dateFormat: 'MM/DD/YYYY',
    currency: 'USD', language: 'en', fiscalYearStart: '01',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true, leaveApprovals: true, payslipReady: true,
    systemAlerts: true, weeklyDigest: false, marketingEmails: false,
  });
  const [security, setSecurity] = useState({
    twoFactorEnabled: false, sessionTimeout: '30', passwordExpiry: '90', ipWhitelist: '',
  });

  const handleSave = () => toast.success('Settings Saved', 'Your preferences have been updated.');

  const tabs = [
    { id: 'general' as const, label: 'General', icon: '⚙️' },
    { id: 'notifications' as const, label: 'Notifications', icon: '🔔' },
    { id: 'security' as const, label: 'Security', icon: '🔒' },
    { id: 'appearance' as const, label: 'Appearance', icon: '🎨' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Configure your organization and personal preferences</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
        {/* Tab sidebar */}
        <div className="card" style={{ width: 220, flexShrink: 0, padding: 'var(--space-3)' }}>
          {tabs.map(t => (
            <button key={t.id} className={`btn btn-ghost`} onClick={() => setActiveTab(t.id)}
              style={{ width: '100%', justifyContent: 'flex-start', fontWeight: activeTab === t.id ? 600 : 400, background: activeTab === t.id ? 'var(--bg-secondary)' : 'transparent' }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card" style={{ flex: 1, padding: 'var(--space-6)' }}>
          {activeTab === 'general' && (
            <>
              <h3 style={{ marginBottom: 'var(--space-5)' }}>General Settings</h3>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-5)' }}>
                {[
                  { label: 'Company Name', key: 'companyName' as const, type: 'text' },
                  { label: 'Timezone', key: 'timezone' as const, type: 'select', options: ['Asia/Colombo', 'UTC', 'America/New_York', 'Europe/London'] },
                  { label: 'Date Format', key: 'dateFormat' as const, type: 'select', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
                  { label: 'Currency', key: 'currency' as const, type: 'select', options: ['USD', 'LKR', 'EUR', 'GBP'] },
                  { label: 'Language', key: 'language' as const, type: 'select', options: ['en', 'si', 'ta'] },
                  { label: 'Fiscal Year Start', key: 'fiscalYearStart' as const, type: 'select', options: [{ v: '01', l: 'January' }, { v: '04', l: 'April' }, { v: '07', l: 'July' }] },
                ].map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <label className="label">{f.label}</label>
                    {f.type === 'text' ? (
                      <input className="input" value={general[f.key]} onChange={(e) => setGeneral({ ...general, [f.key]: e.target.value })} />
                    ) : (
                      <select className="input" value={general[f.key]} onChange={(e) => setGeneral({ ...general, [f.key]: e.target.value })}>
                        {(f.options as (string | { v: string; l: string })[])?.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <h3 style={{ marginBottom: 'var(--space-5)' }}>Notification Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[
                  { label: 'Email Notifications', desc: 'Receive notifications via email', key: 'emailNotifications' as const },
                  { label: 'Leave Approval Alerts', desc: 'Get notified when leave requests need approval', key: 'leaveApprovals' as const },
                  { label: 'Payslip Ready', desc: 'Notify when new payslip is available', key: 'payslipReady' as const },
                  { label: 'System Alerts', desc: 'Health and maintenance notifications', key: 'systemAlerts' as const },
                  { label: 'Weekly Digest', desc: 'Weekly summary of HR activities', key: 'weeklyDigest' as const },
                ].map(s => (
                  <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-secondary)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{s.label}</div>
                      <div className="text-sm text-secondary">{s.desc}</div>
                    </div>
                    <button onClick={() => setNotificationSettings({ ...notificationSettings, [s.key]: !notificationSettings[s.key] })}
                      style={{ width: 48, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: notificationSettings[s.key] ? 'var(--accent-primary)' : 'var(--bg-tertiary)', position: 'relative', transition: 'background 0.2s' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: notificationSettings[s.key] ? 26 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <h3 style={{ marginBottom: 'var(--space-5)' }}>Security Settings</h3>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-5)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <label className="label">Session Timeout (minutes)</label>
                  <input className="input" type="number" value={security.sessionTimeout} onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <label className="label">Password Expiry (days)</label>
                  <input className="input" type="number" value={security.passwordExpiry} onChange={(e) => setSecurity({ ...security, passwordExpiry: e.target.value })} />
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Two-Factor Authentication</div>
                  <div className="text-sm text-secondary">Add an extra layer of security</div>
                </div>
                <button onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
                  style={{ width: 48, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: security.twoFactorEnabled ? 'var(--accent-primary)' : 'var(--bg-tertiary)', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: security.twoFactorEnabled ? 26 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </>
          )}

          {activeTab === 'appearance' && (
            <>
              <h3 style={{ marginBottom: 'var(--space-5)' }}>Appearance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 'var(--space-3)' }}>Theme</div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {['Light', 'Dark', 'System'].map(t => (
                      <button key={t} className="btn btn-secondary" style={{ padding: 'var(--space-3) var(--space-5)' }}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 'var(--space-3)' }}>Accent Color</div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'].map(c => (
                      <button key={c} style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: c, border: '3px solid var(--bg-primary)', boxShadow: '0 0 0 1px var(--border-primary)', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
